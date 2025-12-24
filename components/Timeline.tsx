
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TimelineEvent } from '../types';
import { Plus, CalendarDays, X, UserCircle, Copy } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
  activeEventId: string | 'profile' | null;
  onSelectEvent: (id: string | 'profile') => void;
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
  onCopyFromEvent: (targetId: string, sourceId: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ events, activeEventId, onSelectEvent, onAddEvent, onDeleteEvent, onCopyFromEvent }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copyMenuOpenId, setCopyMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const handleOpenCopyMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.top, left: rect.right + 10 });
    setCopyMenuOpenId(id);
  };

  const handleCopySelection = (sourceId: string) => {
    if (copyMenuOpenId) {
      onCopyFromEvent(copyMenuOpenId, sourceId);
      setCopyMenuOpenId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setCopyMenuOpenId(null);
    if (copyMenuOpenId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [copyMenuOpenId]);

  return (
    <div className="flex flex-col h-full bg-slate-100 border-r border-slate-200 relative">
      <div className="p-4 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm flex-shrink-0">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Timeline</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 -translate-x-1/2 min-h-full"></div>

        <div className="space-y-8 pb-10">
          {/* Patient Profile Selection */}
          <div 
            className={`relative flex flex-col items-center cursor-pointer group transition-all duration-300`}
            onClick={() => onSelectEvent('profile')}
          >
             <div className={`w-4 h-4 rounded-full border-4 z-10 mb-2 transition-colors ${
                activeEventId === 'profile' 
                ? 'bg-white border-blue-600 scale-125 shadow-md' 
                : 'bg-slate-400 border-slate-100 group-hover:bg-blue-400'
            }`}></div>
            <div className={`relative w-40 p-4 rounded-lg border text-center transition-all ${
                activeEventId === 'profile'
                ? 'bg-blue-50 border-blue-500 shadow-md transform scale-105'
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}>
              <UserCircle className={`w-8 h-8 mx-auto mb-1 ${activeEventId === 'profile' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="text-sm font-bold text-slate-800">Patient Profile</div>
            </div>
          </div>

          {events.map((event, index) => {
            const isActive = event.id === activeEventId;
            return (
              <div 
                key={event.id}
                className={`relative flex flex-col items-center cursor-pointer group transition-all duration-300`}
                onClick={() => onSelectEvent(event.id)}
              >
                {/* Dot on line */}
                <div className={`w-4 h-4 rounded-full border-4 z-10 mb-2 transition-colors ${
                    isActive 
                    ? 'bg-white border-green-600 scale-125 shadow-md' 
                    : 'bg-slate-400 border-slate-100 group-hover:bg-green-400'
                }`}></div>

                {/* Card */}
                <div className={`relative w-40 p-3 rounded-lg border text-center transition-all ${
                    isActive
                    ? 'bg-green-50 border-green-500 shadow-md transform scale-105'
                    : 'bg-white border-slate-200 hover:border-green-300'
                }`}>
                  <button 
                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-red-200 hover:border-red-700 z-50 pointer-events-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDeleteEvent(event.id);
                    }}
                    type="button"
                    title="Delete Timepoint"
                  >
                    <X className="w-5 h-5 pointer-events-none" />
                  </button>

                  <div className="text-xs font-bold text-slate-500 mb-1">Timepoint {index + 1}</div>
                  <div className="flex items-center justify-center text-sm font-semibold text-slate-800">
                     <CalendarDays className="w-3 h-3 mr-1 opacity-50"/>
                     {event.date || 'Set Date'}
                  </div>

                  {/* Copy Button */}
                  <button 
                    className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg border z-50 pointer-events-auto ${
                      copyMenuOpenId === event.id 
                        ? 'bg-blue-600 text-white border-blue-700' 
                        : 'bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white border-blue-200 hover:border-blue-700 opacity-0 group-hover:opacity-100'
                    }`}
                    onClick={(e) => handleOpenCopyMenu(e, event.id)}
                    type="button"
                    title="Copy content from another timepoint"
                  >
                    <Copy className="w-4 h-4 pointer-events-none" />
                  </button>
                </div>
              </div>
            );
          })}
           <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
        <button
          onClick={onAddEvent}
          className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all active:scale-95 font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Timepoint
        </button>
      </div>

      {/* Copy Selection Menu */}
      {copyMenuOpenId && menuPos && createPortal(
        <div 
          className="fixed z-[10001] bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden min-w-[180px] animate-in zoom-in-95 duration-150"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
            欲複製的內容
          </div>
          <div className="max-h-60 overflow-y-auto bg-slate-50">
            {events.map((e, idx) => {
              // Skip the timepoint that is currently being edited (the target)
              if (e.id === copyMenuOpenId) return null;
              
              return (
                <button
                  key={e.id}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200 hover:bg-blue-50 hover:text-blue-700 transition-colors last:border-0"
                  onClick={() => handleCopySelection(e.id)}
                >
                  Timepoint {idx + 1}
                </button>
              );
            })}
            {events.length <= 1 && (
              <div className="p-4 text-xs text-slate-400 italic text-center">
                No other timepoints to copy from.
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Timeline;
