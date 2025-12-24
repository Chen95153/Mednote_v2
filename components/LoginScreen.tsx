
import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, ShieldCheck, Sparkles, AlertTriangle, Copy, Check, DownloadCloud, AlertOctagon } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  authError?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, authError }) => {
  const [currentDomain, setCurrentDomain] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    // Detect environment
    const hostname = window.location.hostname;
    const href = window.location.href;

    // Check for sandbox/iframe/file/about:srcdoc environments
    if (!hostname || hostname === '' || href.startsWith('about:') || href.startsWith('file:') || href.startsWith('data:')) {
      setIsSandbox(true);
      setCurrentDomain('Sandbox Mode (Auth Disabled)');
    } else {
      setIsSandbox(false);
      setCurrentDomain(hostname);
    }
  }, []);

  const copyDomain = () => {
    if (isSandbox) return;
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-6 relative">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10">
        {/* Left Side: Hero */}
        <div className="md:w-1/2 p-10 bg-blue-50 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <div className="z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MediScribe AI</h1>
            </div>
            
            <h2 className="text-4xl font-extrabold text-blue-900 mb-4 leading-tight">
              Transform Medical Records with AI
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Generate professional, academic-grade admission notes from structured inputs in seconds using Gemini 1.5 Pro.
            </p>
          </div>

          <div className="space-y-4 z-10">
            <div className="flex items-center space-x-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Structured Data Entry</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-700">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <span className="font-medium">AI-Powered Generation</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-700">
              <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="font-medium">Bring Your Own Key (Secure)</span>
            </div>
          </div>

          {/* Decorative Circles */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        </div>

        {/* Right Side: Login */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center items-center bg-white relative">
          
          {isSandbox ? (
            /* SANDBOX WARNING STATE */
            <div className="text-center w-full">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Preview Environment Detected</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed px-4">
                This app is running in a <strong>Sandboxed Preview</strong> (no domain). Google Login requires a real web server to function securely.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 mx-2">
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center">
                  <DownloadCloud className="w-4 h-4 mr-2 text-blue-600"/>
                  How to fix:
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2">
                  <li><strong>Download</strong> or <strong>Export</strong> this project from the editor.</li>
                  <li>Run it locally (e.g., <code>npm run dev</code> &rarr; <code>localhost</code>).</li>
                  <li>Or deploy it to a hosting service (Vercel, Netlify).</li>
                </ol>
              </div>

              <button disabled className="w-full py-3 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                Login Disabled in Sandbox
              </button>
            </div>
          ) : (
            /* NORMAL LOGIN STATE */
            <div className="w-full flex flex-col items-center">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h3>
                <p className="text-slate-500">Please sign in to access your workspace</p>
              </div>

              {authError && (
                <div className="mb-6 w-full p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-800 mb-1">Authentication Error</h4>
                    <p className="text-xs text-red-700 whitespace-pre-wrap leading-relaxed select-all font-mono bg-red-50/50 p-1 rounded">
                      {authError}
                    </p>
                    {authError.includes("Settings > Authorized domains") && (
                      <div className="mt-2 p-2 bg-white border border-red-100 rounded text-xs text-slate-500">
                          <strong>Tip:</strong> You must add the <u>exact domain</u> shown in the bottom right corner of this screen to Firebase Console.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={onLogin}
                className="w-full max-w-sm flex items-center justify-center space-x-3 px-6 py-4 border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 hover:shadow-md transition-all group bg-white"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-6 h-6"
                />
                <span className="text-slate-700 font-bold text-lg group-hover:text-slate-900">Sign in with Google</span>
              </button>

              <p className="mt-8 text-xs text-center text-slate-400 max-w-xs leading-relaxed">
                By signing in, you agree to use your own Gemini API Key. Your key is encrypted and stored securely linked to your account.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Domain Helper Footer */}
      <div className="absolute bottom-4 right-4 z-0 flex flex-col items-end opacity-70 hover:opacity-100 transition-opacity">
        <label className="text-[10px] text-blue-200 uppercase font-bold mb-1">Detected Domain (For Firebase Whitelist)</label>
        <button 
          onClick={copyDomain}
          disabled={isSandbox}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 transition-colors ${isSandbox ? 'bg-red-900/40 text-red-200 cursor-not-allowed' : 'bg-black/20 backdrop-blur-md text-white hover:bg-black/30'}`}
        >
          <span className="text-xs font-mono">{currentDomain}</span>
          {!isSandbox && (copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-300" />)}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
