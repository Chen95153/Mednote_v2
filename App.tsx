
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import Editor from './components/Editor';
import Modal from './components/Modal';
import LoginScreen from './components/LoginScreen';
import ApiKeyModal from './components/ApiKeyModal';
import { generateAdmissionNote, refineNoteSegment, refineFullNote } from './services/geminiService';
import { TimelineEvent, PatientProfile } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { db } from './firebaseConfig';
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import {
  FileText, Copy, Sparkles, Loader2, Maximize2, Minimize2,
  Check, Wand2, Undo2, Redo2, History, X as CloseIcon,
  Clock, ArrowRight, MessageSquareText, Zap, BrainCircuit, Type,
  LogOut, Key, UserCircle
} from 'lucide-react';

// Main Application Logic
const MainApp: React.FC = () => {
  const { user, apiKey, saveApiKey, removeApiKey, signOut } = useAuth();

  // --- State: Data ---
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      dateType: 'date',
      categorizedContent: {},
      otherInformation: ''
    }
  ]);
  const [activeEventId, setActiveEventId] = useState<string | 'profile' | null>('profile');
  const [isGenerating, setIsGenerating] = useState(false);

  // Custom Items State
  const [customItems, setCustomItems] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) {
      setCustomItems({});
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCustomItems(data.customItems || {});
      }
    });
    return () => unsub();
  }, [user]);

  const handleAddCustomItem = async (category: string, item: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        [`customItems.${category}`]: arrayUnion(item)
      });
    } catch (err) {
      console.error("Error adding custom item:", err);
      // Fallback if document doesn't exist or map field issue: setDoc with merge
      await setDoc(userRef, {
        customItems: {
          [category]: [item] // Note: this overwrites if logic is not careful, but arrayUnion on updateDoc is safer. 
          // If updateDoc failed likely doc missing, so setDoc merge is safe init.
        }
      }, { merge: true });
      // Retry update with arrayUnion to be sure if the above setDoc only init the field
      await updateDoc(userRef, {
        [`customItems.${category}`]: arrayUnion(item)
      });
    }
  };

  // Advanced Version History State
  const [generatedNote, setGeneratedNote] = useState('');
  const [noteHistory, setNoteHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 means no history yet
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const [copied, setCopied] = useState(false);
  const [timepointToDelete, setTimepointToDelete] = useState<{ id: string, index: number } | null>(null);

  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    age: '65',
    gender: 'male',
    underlying_diseases: ['Hypertension', 'Diabetes Mellitus'],
    control_quality: '',
    management_modality: '',
    follow_up_status: ''
  });

  const [informant, setInformant] = useState('himself');

  // Refinement States
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number, end: number } | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number, y: number } | null>(null);
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Full Note Assistant States
  const [assistantInput, setAssistantInput] = useState('');
  const [isAssistantProcessing, setIsAssistantProcessing] = useState(false);

  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // --- UI Layout ---
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [timelineWidth, setTimelineWidth] = useState(300);
  const [genAreaHeight, setGenAreaHeight] = useState(380);
  const [isGenFullScreen, setIsGenFullScreen] = useState(false);

  const [lastUpdateTrigger, setLastUpdateTrigger] = useState<{ category: string, timestamp: number } | null>(null);
  const isResizing = useRef(false);

  // Display Diagnosis
  const displayDiagnosis = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      const dx = events[i].categorizedContent['Definitive diagnosis'];
      if (dx && dx.trim()) return dx;
    }
    return 'Pending';
  }, [events]);

  const startResize = (type: 'sidebar' | 'timeline' | 'genArea') => (e: React.MouseEvent) => {
    isResizing.current = true;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = type === 'sidebar' ? sidebarWidth : timelineWidth;
    const startH = genAreaHeight;

    const doDrag = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      if (type === 'sidebar') {
        setSidebarWidth(Math.max(200, Math.min(600, startW + (moveEvent.clientX - startX))));
      } else if (type === 'timeline') {
        setTimelineWidth(Math.max(200, Math.min(600, startW + (moveEvent.clientX - startX))));
      } else if (type === 'genArea') {
        setGenAreaHeight(Math.max(200, Math.min(window.innerHeight - 100, startH - (moveEvent.clientY - startY))));
      }
    };

    const stopDrag = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const handleAddEvent = () => {
    const newId = Date.now().toString();
    setEvents([...events, { id: newId, date: '', dateType: 'date', categorizedContent: {}, otherInformation: '' }]);
    setActiveEventId(newId);
  };

  const initiateDeleteEvent = (id: string) => {
    if (events.length <= 1) return alert("Must have at least one timepoint.");
    const index = events.findIndex(e => e.id === id);
    setTimepointToDelete({ id, index });
  };

  const confirmDeleteEvent = () => {
    if (!timepointToDelete) return;
    const { id, index } = timepointToDelete;
    setEvents(prev => {
      const newEvents = prev.filter(e => e.id !== id);
      if (activeEventId === id) setActiveEventId(newEvents[index]?.id || newEvents[index - 1]?.id || 'profile');
      return newEvents;
    });
    setTimepointToDelete(null);
  };

  const handleUpdateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...updates } : ev));
  };

  const handleCopyFromEvent = (targetId: string, sourceId: string) => {
    const sourceEvent = events.find(e => e.id === sourceId);
    if (!sourceEvent) return;
    setEvents(prev => prev.map(ev => {
      if (ev.id === targetId) {
        const updatedCategorizedContent = { ...ev.categorizedContent };
        Object.keys(sourceEvent.categorizedContent).forEach(key => {
          const sourceVal = sourceEvent.categorizedContent[key];
          if (sourceVal) {
            const currentVal = updatedCategorizedContent[key] || '';
            updatedCategorizedContent[key] = currentVal ? `${currentVal}, ${sourceVal}` : sourceVal;
          }
        });
        let updatedOtherInfo = ev.otherInformation;
        if (sourceEvent.otherInformation) {
          updatedOtherInfo = updatedOtherInfo ? `${updatedOtherInfo}\n${sourceEvent.otherInformation}` : sourceEvent.otherInformation;
        }
        return { ...ev, categorizedContent: updatedCategorizedContent, otherInformation: updatedOtherInfo };
      }
      return ev;
    }));
  };

  const handleSidebarItemClick = (category: string, item: string) => {
    if (!activeEventId) return;
    if (activeEventId === 'profile') {
      if (category === 'Underlying disease') {
        setPatientProfile(prev => ({ ...prev, underlying_diseases: Array.from(new Set([...prev.underlying_diseases, item])) }));
      }
      return;
    }
    setLastUpdateTrigger({ category, timestamp: Date.now() });
    setEvents(prev => prev.map(ev => {
      if (ev.id === activeEventId) {
        const current = ev.categorizedContent[category] || '';
        return { ...ev, categorizedContent: { ...ev.categorizedContent, [category]: current ? `${current}, ${item}` : item } };
      }
      return ev;
    }));
  };

  const getPayload = () => {
    return {
      "patient_profile": {
        "age": parseInt(patientProfile.age) || 0,
        "gender": patientProfile.gender,
        "informant": informant,
        "underlying_disease": patientProfile.underlying_diseases,
        "control_status": {
          "quality": patientProfile.control_quality,
          "modality": patientProfile.management_modality,
          "follow_up": patientProfile.follow_up_status
        }
      },
      "timepoints": events.map((e) => ({
        "date": e.date,
        "vital_sign": e.categorizedContent['Vital Sign'] || '',
        "symptom": e.categorizedContent['Symptom'] || '',
        "negative_symptom": e.categorizedContent['Negative Symptom'] || '',
        "medical_facility": e.categorizedContent['Medical Facility'] || '',
        "tentative_diagnosis": e.categorizedContent['Tentative Diagnosis'] || '',
        "underlying_disease": e.categorizedContent['Underlying disease'] || '',
        "definitive_diagnosis": e.categorizedContent['Definitive diagnosis'] || '',
        "physical_examination": e.categorizedContent['Physical examination'] || '',
        "lab_data": e.categorizedContent['Lab data'] || '',
        "image_finding": e.categorizedContent['Image finding'] || '',
        "treatment": e.categorizedContent['Treatment'] || '',
        "other_information": e.otherInformation || ''
      }))
    };
  };

  const updateHistory = (newNote: string) => {
    const truncatedHistory = noteHistory.slice(0, historyIndex + 1);
    const newHistory = [...truncatedHistory, newNote];
    setNoteHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setGeneratedNote(newNote);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    setIsGenerating(true);
    const payload = getPayload();
    const result = await generateAdmissionNote(payload, apiKey);
    updateHistory(result);
    setIsGenerating(false);
  };

  const handleFullRefine = async (customInstruction?: string) => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    const instruction = customInstruction || assistantInput;
    if (!instruction.trim() || !generatedNote) return;

    setIsAssistantProcessing(true);
    const payload = getPayload();
    const result = await refineFullNote(payload, generatedNote, instruction, apiKey);
    updateHistory(result);
    setIsAssistantProcessing(false);
    if (!customInstruction) setAssistantInput('');
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGeneratedNote(noteHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < noteHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGeneratedNote(noteHistory[newIndex]);
    }
  };

  const jumpToHistory = (index: number) => {
    setHistoryIndex(index);
    setGeneratedNote(noteHistory[index]);
    setShowHistoryModal(false);
  };

  const handleTextSelection = () => {
    const el = noteTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value.substring(start, end).trim();

    if (text.length > 0) {
      const rect = el.getBoundingClientRect();
      setSelectedText(text);
      setSelectionRange({ start, end });
      setToolbarPos({ x: rect.left + 50, y: rect.top + 50 });
    } else {
      setSelectedText('');
      setSelectionRange(null);
      setToolbarPos(null);
    }
  };

  const handleRefine = async () => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    if (!selectedText || !refinementInstruction || !selectionRange) return;
    setIsRefining(true);
    const payload = getPayload();
    const newSegment = await refineNoteSegment(payload, generatedNote, selectedText, refinementInstruction, apiKey);

    const before = generatedNote.substring(0, selectionRange.start);
    const after = generatedNote.substring(selectionRange.end);

    const refinedNote = before + newSegment + after;
    updateHistory(refinedNote);

    setIsRefining(false);
    setToolbarPos(null);
    setSelectedText('');
    setRefinementInstruction('');
  };

  const copyToClipboard = () => {
    if (!generatedNote) return;
    navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeEvent = events.find(e => e.id === activeEventId);

  // If no API Key is set, force the modal
  const showRequiredKeyModal = !apiKey && !showKeyModal;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Modal
        isOpen={!!timepointToDelete}
        onClose={() => setTimepointToDelete(null)}
        onConfirm={confirmDeleteEvent}
        title="Delete Timepoint"
        message={`Are you sure?`}
      />

      <ApiKeyModal
        isOpen={showRequiredKeyModal || showKeyModal}
        onSave={async (key) => {
          await saveApiKey(key);
          setShowKeyModal(false);
        }}
        isDismissible={!!apiKey}
        onDismiss={() => setShowKeyModal(false)}
      />

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2 text-blue-700">
                <History className="w-5 h-5" />
                <h3 className="font-bold">Version History</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {noteHistory.length === 0 && <p className="text-center text-slate-400 py-10">No history available yet.</p>}
              {[...noteHistory].reverse().map((note, idx) => {
                const originalIndex = noteHistory.length - 1 - idx;
                const isActive = originalIndex === historyIndex;
                return (
                  <button
                    key={originalIndex}
                    onClick={() => jumpToHistory(originalIndex)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start space-x-4 ${isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`mt-1 p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">Version {originalIndex + 1}</span>
                        {isActive && <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Active</span>}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 italic">
                        {note.substring(0, 150)}...
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 self-center text-slate-300" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <header className="h-14 bg-blue-900 text-white flex items-center px-4 justify-between shadow-md z-20 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <h1 className="font-bold text-lg hidden md:block">Smart Medical Record</h1>
        </div>

        {/* Center Info */}
        <div className="hidden md:flex text-sm opacity-80 gap-4">
          <span>Patient: {patientProfile.age}y/{patientProfile.gender}</span>
          <span className="max-w-[300px] truncate">Dx: {displayDiagnosis}</span>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-1.5 rounded-full hover:bg-blue-800 text-blue-200 transition-colors"
            title="API Key Settings"
          >
            <Key className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 bg-blue-800 rounded-full pl-1 pr-3 py-1">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full border border-white/20" />
            ) : (
              <UserCircle className="w-6 h-6 text-blue-200" />
            )}
            <span className="text-xs font-semibold max-w-[100px] truncate">{user?.displayName || user?.email}</span>
          </div>
          <button onClick={signOut} className="p-1.5 hover:bg-red-600 rounded-full transition-colors text-white" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div style={{ width: sidebarWidth }} className="flex-shrink-0 z-10 flex flex-col">
          <Sidebar onItemClick={handleSidebarItemClick} />
        </div>
        <div className="w-1 bg-slate-300 hover:bg-blue-500 cursor-col-resize z-20 transition-colors" onMouseDown={startResize('sidebar')} />
        <div style={{ width: timelineWidth }} className="flex-shrink-0 z-0 flex flex-col">
          <Timeline
            events={events}
            activeEventId={activeEventId}
            onSelectEvent={setActiveEventId}
            onAddEvent={handleAddEvent}
            onDeleteEvent={initiateDeleteEvent}
            onCopyFromEvent={handleCopyFromEvent}
          />
        </div>
        <div className="w-1 bg-slate-300 hover:bg-blue-500 cursor-col-resize z-20 transition-colors" onMouseDown={startResize('timeline')} />
        <div className="flex-1 min-w-0">
          <Editor
            event={activeEvent}
            onUpdate={handleUpdateEvent}
            profile={patientProfile}
            onUpdateProfile={setPatientProfile}
            isProfileSelected={activeEventId === 'profile'}
            informant={informant}
            setInformant={setInformant}
            lastUpdateTrigger={lastUpdateTrigger}
          />
        </div>
      </div>

      {!isGenFullScreen && <div className="h-1 bg-slate-300 hover:bg-blue-500 cursor-row-resize z-20" onMouseDown={startResize('genArea')} />}

      <div style={{ height: isGenFullScreen ? '100vh' : genAreaHeight }} className={`flex flex-col border-t-4 border-slate-200 bg-white shadow-2xl transition-all ${isGenFullScreen ? 'fixed inset-0 z-50' : 'relative'}`}>
        <div className="px-6 py-3 border-b flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-slate-700">AI Generation Area</h2>

            {/* Version Controls */}
            <div className="flex items-center ml-4 bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 disabled:text-slate-200 transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= noteHistory.length - 1}
                title="Redo (Ctrl+Y)"
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 disabled:text-slate-200 border-l border-slate-100 transition-colors"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="p-1.5 hover:bg-slate-100 rounded text-blue-600 font-bold text-xs flex items-center border-l border-slate-100 transition-colors"
              >
                <History className="w-3.5 h-3.5 mr-1" />
                V{historyIndex + 1}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {generatedNote && (
              <button
                onClick={copyToClipboard}
                className={`flex items-center px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95'}`}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
            <button onClick={() => setIsGenFullScreen(!isGenFullScreen)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
              {isGenFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={handleGenerate} disabled={isGenerating} className={`flex items-center px-6 py-2 rounded-full font-bold shadow-md transition-all active:scale-95 ${isGenerating ? 'bg-slate-300 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:brightness-110'}`}>
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isGenerating ? 'Generating...' : 'Generate Note'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex bg-slate-50 overflow-hidden">
          {/* 7:3 Split - Main Content Area */}
          <div className="w-[70%] h-full p-4 relative overflow-hidden flex flex-col">
            <div className="flex-1 relative">
              <textarea
                ref={noteTextareaRef}
                onMouseUp={handleTextSelection}
                onKeyUp={handleTextSelection}
                className="w-full h-full p-8 bg-white border rounded-lg shadow-inner resize-none font-serif text-lg leading-relaxed custom-scrollbar outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
                value={generatedNote}
                onChange={(e) => {
                  const val = e.target.value;
                  setGeneratedNote(val);
                }}
                placeholder={apiKey ? "The generated medical admission note will appear here..." : "Please set your API Key to start generating notes."}
              />

              {/* Highlight & Rewrite Floating Toolbar (Small Selection Fix) */}
              {toolbarPos && selectedText && (
                <div
                  className="absolute z-[60] bg-white border border-slate-200 rounded-xl shadow-2xl p-4 w-80 animate-in zoom-in-95 duration-200"
                  style={{ top: 20, right: 20 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1.5 text-blue-600">
                      <Wand2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Refine Selection</span>
                    </div>
                    <button onClick={() => { setToolbarPos(null); setSelectedText(''); }} className="text-slate-400 hover:text-slate-600">
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Target Text</div>
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 max-h-20 overflow-y-auto italic">
                      "{selectedText}"
                    </div>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      autoFocus
                      placeholder="e.g. Rewrite this more formally..."
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                      value={refinementInstruction}
                      onChange={(e) => setRefinementInstruction(e.target.value)}
                    />
                    <button
                      disabled={isRefining || !refinementInstruction.trim()}
                      onClick={handleRefine}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center disabled:bg-slate-300"
                    >
                      {isRefining ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />}
                      {isRefining ? 'Refining...' : 'Refine Segment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 30% - AI Refinement Box */}
          <div className="w-[30%] h-full border-l border-slate-200 bg-white flex flex-col">
            <div className="p-3 border-b flex items-center space-x-2 bg-slate-50/50">
              <MessageSquareText className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">病歷修正 Assistant</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Quick Refine Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Quick Refine</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleFullRefine("Make the note more concise and pithy without losing clinical facts.")}
                    className="flex items-center p-2 text-xs font-semibold text-slate-600 border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <Zap className="w-3.5 h-3.5 mr-2 text-yellow-500" />
                    <span>縮短篇幅 (Make it concise)</span>
                  </button>
                  <button
                    onClick={() => handleFullRefine("Analyze the original JSON data and checking if any clinical details are missing in the current draft. Flag them or add them if the data allows.")}
                    className="flex items-center p-2 text-xs font-semibold text-slate-600 border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 mr-2 text-purple-500" />
                    <span>檢查細節補充 (Detail check)</span>
                  </button>
                  <button
                    onClick={() => handleFullRefine("Carefully check for grammar, prepositions, and article usage. Ensure formal academic medical tone.")}
                    className="flex items-center p-2 text-xs font-semibold text-slate-600 border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <Type className="w-3.5 h-3.5 mr-2 text-blue-500" />
                    <span>檢查文法與冠詞 (Grammar check)</span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-2" />

              {/* Manual Instruction Box */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Manual Refinement</label>
                <textarea
                  className="w-full h-32 p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-shadow resize-none bg-slate-50/30"
                  placeholder="e.g. Rewrite the second paragraph to emphasize the fever course..."
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                />
                <button
                  disabled={isAssistantProcessing || !assistantInput.trim() || !generatedNote}
                  onClick={() => handleFullRefine()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {isAssistantProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isAssistantProcessing ? 'Refining Note...' : 'Refine Full Note'}
                </button>
              </div>

              {!generatedNote && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-700 italic">
                  Generate a note first to use the refinement assistant.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, loading, signInWithGoogle, error } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={signInWithGoogle} authError={error} />;
  }

  return <MainApp />;
};

export default App;
