
import React, { useState } from 'react';
import { Key, Lock, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => Promise<void>;
  isDismissible?: boolean;
  onDismiss?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  isOpen, 
  onSave, 
  isDismissible = false,
  onDismiss 
}) => {
  const [inputKey, setInputKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!inputKey.trim()) {
      setError('Please enter a valid API key.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onSave(inputKey.trim());
    } catch (err) {
      setError('Failed to save API Key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={isDismissible ? onDismiss : undefined} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Setup Gemini API Key</h2>
          <p className="text-blue-100 text-sm mt-1">Required to power the AI generation</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Why do I need this?</p>
                <p className="opacity-90 leading-relaxed">
                  This application runs on your own Google Cloud account. Your API key is stored securely in your database and is never shared with us.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Enter your Gemini API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  placeholder="AIzaSy..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
            </div>
            
            <div className="text-center">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                Get a free API key here <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            {isDismissible && (
               <button
                onClick={onDismiss}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !inputKey}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
