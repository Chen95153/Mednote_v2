
import React, { useRef, useEffect, useState } from 'react';
import { TimelineEvent, PatientProfile } from '../types';
import { MENU_DATA } from '../constants';
import { User, X, Activity, Building2, Plus } from 'lucide-react';

interface EditorProps {
  event: TimelineEvent | undefined;
  onUpdate: (id: string, updates: Partial<TimelineEvent>) => void;
  profile: PatientProfile;
  onUpdateProfile: (profile: PatientProfile) => void;
  isProfileSelected: boolean;
  informant: string;
  setInformant: (inf: string) => void;
  lastUpdateTrigger: { category: string, timestamp: number } | null;
}

const Editor: React.FC<EditorProps> = ({ 
  event, 
  onUpdate, 
  profile, 
  onUpdateProfile, 
  isProfileSelected,
  informant,
  setInformant,
  lastUpdateTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [newDiseaseInput, setNewDiseaseInput] = useState('');

  useEffect(() => {
    if (lastUpdateTrigger && !isProfileSelected) {
      const targetSection = sectionRefs.current[lastUpdateTrigger.category];
      if (targetSection) {
        targetSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [lastUpdateTrigger, isProfileSelected]);

  const handleGenderSelection = (gender: 'male' | 'female') => {
    onUpdateProfile({ ...profile, gender });
    setInformant(gender === 'male' ? 'himself' : 'herself');
  };

  const handleAddManualDisease = () => {
    const trimmed = newDiseaseInput.trim();
    if (trimmed && !profile.underlying_diseases.includes(trimmed)) {
      onUpdateProfile({
        ...profile,
        underlying_diseases: [...profile.underlying_diseases, trimmed]
      });
    }
    setNewDiseaseInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddManualDisease();
    }
  };

  const appendSuggestion = (field: keyof PatientProfile, suggestion: string) => {
    const currentValue = profile[field] as string;
    if (!currentValue) {
        onUpdateProfile({ ...profile, [field]: suggestion });
    } else {
        const newValue = currentValue.trim().endsWith(',') 
            ? `${currentValue.trim()} ${suggestion}`
            : `${currentValue.trim()}, ${suggestion}`;
        onUpdateProfile({ ...profile, [field]: newValue });
    }
  };

  if (isProfileSelected) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-slate-200 bg-blue-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Patient Profile</h2>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Age (Numeric)</label>
                    <input 
                        type="number" 
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={profile.age}
                        onChange={(e) => onUpdateProfile({ ...profile, age: e.target.value })}
                        placeholder="65"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Sex</label>
                    <div className="flex space-x-2">
                        {['male', 'female'].map(s => (
                            <button
                                key={s}
                                onClick={() => handleGenderSelection(s as 'male' | 'female')}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all border ${
                                    profile.gender === s 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

             <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Informant</label>
                    <input 
                        type="text" 
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={informant}
                        onChange={(e) => setInformant(e.target.value)}
                        placeholder="e.g. himself, wife, family, relatives..."
                    />
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Underlying Diseases</label>
                </div>
                
                {/* Manual Entry Input */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type a disease and press Enter..." 
                    className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    value={newDiseaseInput}
                    onChange={(e) => setNewDiseaseInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button 
                    onClick={handleAddManualDisease}
                    disabled={!newDiseaseInput.trim()}
                    className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl min-h-[60px] border border-dashed border-slate-300">
                    {profile.underlying_diseases.length === 0 && (
                        <p className="text-slate-400 text-xs italic flex items-center justify-center w-full">No diseases selected</p>
                    )}
                    {profile.underlying_diseases.map(disease => (
                        <div key={disease} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full flex items-center text-sm font-semibold shadow-sm border border-blue-200">
                            {disease}
                            <button 
                                onClick={() => onUpdateProfile({...profile, underlying_diseases: profile.underlying_diseases.filter(d => d !== disease)})}
                                className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100 pb-10">
                <div className="flex items-center space-x-2 text-green-700">
                    <Activity className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Underlying Disease Control Status</h3>
                </div>

                <div className="space-y-8">
                    {/* Control Quality */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            CONTROL QUALITY (控制程度)
                        </label>
                        <textarea 
                            className="w-full h-20 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm leading-relaxed"
                            value={profile.control_quality}
                            onChange={(e) => onUpdateProfile({...profile, control_quality: e.target.value})}
                        />
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 mb-2">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mr-1 self-center">General:</span>
                                {['Well controlled', 'Poorly controlled', 'Fair', 'Suboptimal', 'Stable', 'Unstable', 'Refractory'].map(item => (
                                    <button key={item} onClick={() => appendSuggestion('control_quality', item)} className="text-[11px] text-slate-400 hover:text-blue-500 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-100">{item}</button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 mb-2">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mr-1 self-center">Specific:</span>
                                {['Acute exacerbation', 'Stationary', 'Remission', 'Progressive', 'Terminal stage'].map(item => (
                                    <button key={item} onClick={() => appendSuggestion('control_quality', item)} className="text-[11px] text-slate-400 hover:text-blue-500 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-100">{item}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Management Modality */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            MANAGEMENT MODALITY (控制方式)
                        </label>
                        <textarea 
                            className="w-full h-20 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm leading-relaxed"
                            value={profile.management_modality}
                            onChange={(e) => onUpdateProfile({...profile, management_modality: e.target.value})}
                        />
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 mb-2">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mr-1 self-center">HTN/Heart:</span>
                                {['Oral anti-hypertensive agents', 'Medical control', 'Diet control', 'Lifestyle modification'].map(item => (
                                    <button key={item} onClick={() => appendSuggestion('management_modality', item)} className="text-[11px] text-slate-400 hover:text-blue-500 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-100">{item}</button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 mb-2">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mr-1 self-center">DM:</span>
                                {['Oral anti-diabetic agents (OAD)', 'Insulin injection', 'Diet control and exercise'].map(item => (
                                    <button key={item} onClick={() => appendSuggestion('management_modality', item)} className="text-[11px] text-slate-400 hover:text-blue-500 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-100">{item}</button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 mb-2">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mr-1 self-center">ESRD:</span>
                                {['Regular Hemodialysis (H/D)', 'H/D on Mon/Wed/Fri', 'H/D on Tue/Thu/Sat', 'Peritoneal Dialysis (PD/CAPD)', 'Conservative treatment'].map(item => (
                                    <button key={item} onClick={() => appendSuggestion('management_modality', item)} className="text-[11px] text-slate-400 hover:text-blue-500 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-100">{item}</button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 mb-2">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mr-1 self-center">Cancer:</span>
                                {['Chemotherapy', 'Target therapy', 'Immunotherapy', 'Regular surveillance post-operation', 'Palliative care'].map(item => (
                                    <button key={item} onClick={() => appendSuggestion('management_modality', item)} className="text-[11px] text-slate-400 hover:text-blue-500 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-100">{item}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Follow-up Status */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            FOLLOW-UP STATUS (追蹤監測)
                        </label>
                        <textarea 
                            className="w-full h-20 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm leading-relaxed"
                            value={profile.follow_up_status}
                            onChange={(e) => onUpdateProfile({...profile, follow_up_status: e.target.value})}
                        />
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 mb-2">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mr-1 self-center">Frequency:</span>
                                {['Regularly', 'Irregularly', 'Intermittently', 'Lost to follow-up'].map(item => (
                                    <button key={item} onClick={() => appendSuggestion('follow_up_status', item)} className="text-[11px] text-slate-400 hover:text-blue-500 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-100">{item}</button>
                                ))}
                            </div>
                            <p className="text-[9px] text-slate-400 italic mt-1 ml-2">Location: Match the Medical Facility items from the left sidebar.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 p-8 text-center h-full">
        <p>Select a profile or timepoint from the timeline to start editing.</p>
      </div>
    );
  }

  const handleContentChange = (category: string, value: string) => {
    const newCategorizedContent = { ...event.categorizedContent, [category]: value };
    onUpdate(event.id, { categorizedContent: newCategorizedContent });
  };

  const editorCategories = MENU_DATA.filter(m => m.category !== 'Disease');

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Editor</h2>
        <div className="text-lg font-mono font-semibold text-slate-800">
            {event.date || (event.dateType === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD')}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar" ref={containerRef}>
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-700">Event Time</label>
            <div className="flex space-x-2 text-xs">
                 <button 
                    onClick={() => onUpdate(event.id, { dateType: 'date', date: '' })}
                    className={`px-3 py-1 rounded-full transition-colors ${event.dateType === 'date' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                 >Exact Date</button>
                 <button 
                    onClick={() => onUpdate(event.id, { dateType: 'month', date: '' })}
                    className={`px-3 py-1 rounded-full transition-colors ${event.dateType === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                 >Month Only</button>
            </div>
          </div>
          <input
            type={event.dateType === 'date' ? 'date' : 'month'}
            className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={event.date}
            onChange={(e) => onUpdate(event.id, { date: e.target.value })}
          />
        </div>

        <div className="space-y-6">
            <div 
                ref={(el) => { sectionRefs.current['Medical Facility'] = el; }}
                className="group pb-4 border-b border-slate-100 scroll-mt-10"
            >
                <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5" />
                    Medical Facility (醫療院所)
                </label>
                <textarea
                    className="w-full h-16 p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 font-sans text-sm leading-relaxed transition-shadow"
                    placeholder="e.g. the Emergency Department of Linkou Chang Gung Memorial Hospital"
                    value={event.categorizedContent['Medical Facility'] || ''}
                    onChange={(e) => handleContentChange('Medical Facility', e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Clinical Findings</h3>
                <span className="text-xs text-slate-500 font-normal hidden sm:inline">(Click menu items to insert)</span>
            </div>

            {editorCategories.filter(c => c.category !== 'Medical Facility').map((menuItem) => {
                const isDiagnosis = ['Tentative Diagnosis', 'Underlying disease', 'Definitive diagnosis'].includes(menuItem.category);
                const isVital = menuItem.category === 'Vital Sign';
                const labelColor = isDiagnosis ? 'text-indigo-800' : 
                                 isVital ? 'text-green-700' :
                                 menuItem.category === 'Negative Symptom' ? 'text-red-700' : 'text-orange-700';

                return (
                    <div 
                        key={menuItem.category} 
                        ref={(el) => { sectionRefs.current[menuItem.category] = el; }}
                        className="group scroll-mt-10"
                    >
                        <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${labelColor}`}>
                            {menuItem.category}
                        </label>
                        <textarea
                            className={`w-full h-24 p-3 border border-slate-300 rounded-lg shadow-sm font-sans text-sm leading-relaxed resize-y transition-shadow ${
                              isDiagnosis ? 'focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-indigo-50/10' :
                              isVital ? 'focus:ring-2 focus:ring-green-200 focus:border-green-400 bg-green-50/10' :
                              menuItem.category === 'Negative Symptom' ? 'focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-red-50/20' : 'focus:ring-2 focus:ring-orange-200 focus:border-orange-400'
                            }`}
                            placeholder={`Describe ${menuItem.category.toLowerCase()}...`}
                            value={event.categorizedContent[menuItem.category] || ''}
                            onChange={(e) => handleContentChange(menuItem.category, e.target.value)}
                        />
                    </div>
                );
            })}

            <div className="group pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Other Information</label>
                <textarea
                    className="w-full h-32 p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 font-sans text-sm leading-relaxed resize-y transition-shadow"
                    placeholder="Enter any additional information..."
                    value={event.otherInformation || ''}
                    onChange={(e) => onUpdate(event.id, { otherInformation: e.target.value })}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
