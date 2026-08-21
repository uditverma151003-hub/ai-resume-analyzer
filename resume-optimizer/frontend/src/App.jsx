import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ParsedResult from './components/ParsedResult';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResultsDashboard from './components/ResultsDashboard';
import AuthForm from './components/AuthForm';
import ScanHistory from './components/ScanHistory';
import TermsModal from './components/TermsModal';
import PrivacyModal from './components/PrivacyModal';
import { supabase } from './lib/supabaseClient';
import {
  Sparkles,
  FileCheck2,
  Zap,
  Target,
  LogOut,
  Server,
  AlertCircle,
  ShieldCheck,
  FileText,
  RotateCw
} from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(null);

  const [backendStatus, setBackendStatus] = useState('checking...');
  const [isWakingUpServer, setIsWakingUpServer] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadIsSlow, setUploadIsSlow] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeIsSlow, setAnalyzeIsSlow] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  // Legal Modal states
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Listen to Supabase auth session
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check backend health with 3-second cold start warning timer
  const checkBackendHealth = () => {
    setBackendStatus('checking...');
    setIsWakingUpServer(false);

    const wakeUpTimer = setTimeout(() => {
      setIsWakingUpServer(true);
      setBackendStatus('Waking up the server — this can take up to a minute on first load');
    }, 3000);

    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Health check non-200 response');
      })
      .then(() => {
        clearTimeout(wakeUpTimer);
        setIsWakingUpServer(false);
        setBackendStatus('connected');
      })
      .catch(() => {
        clearTimeout(wakeUpTimer);
        setIsWakingUpServer(false);
        setBackendStatus('unreachable');
      });
  };

  useEffect(() => {
    checkBackendHealth();
  }, [apiUrl]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setParseResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setLimitReached(false);
    setSessionExpiredMsg(null);
  };

  const handleSessionExpired = async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setSession(null);
    setParseResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setLimitReached(false);
    setSessionExpiredMsg('Your session expired, please sign in again.');
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadIsSlow(false);
    setUploadError(null);
    setParseResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setLimitReached(false);

    const slowTimer = setTimeout(() => {
      setUploadIsSlow(true);
    }, 5000);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch(`${apiUrl}/api/resume/parse`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume file');
      }

      setParseResult(data);
    } catch (err) {
      setUploadError(err.message || 'Unable to upload file. Please check your connection and try again.');
    } finally {
      clearTimeout(slowTimer);
      setIsUploading(false);
      setUploadIsSlow(false);
    }
  };

  const handleAnalyzeMatch = async (jobDescription) => {
    if (!parseResult || !parseResult.extractedText) return;

    setIsAnalyzing(true);
    setAnalyzeIsSlow(false);
    setAnalysisError(null);
    setLimitReached(false);

    const slowTimer = setTimeout(() => {
      setAnalyzeIsSlow(true);
    }, 5000);

    const headers = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    try {
      const response = await fetch(`${apiUrl}/api/resume/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resumeText: parseResult.extractedText,
          jobDescription: jobDescription,
          resumeFilename: parseResult.filename || 'Resume',
        }),
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (response.status === 429 || data.limitReached) {
        setLimitReached(true);
        setAnalysisError(data.error || "You've used your free scan this month. Upgrade for unlimited access.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze resume match');
      }

      setAnalysisResult(data.analysis);
    } catch (err) {
      setAnalysisError(err.message || 'Unable to connect to server. Please check your network and try again.');
    } finally {
      clearTimeout(slowTimer);
      setIsAnalyzing(false);
      setAnalyzeIsSlow(false);
    }
  };

  const handleResetUpload = () => {
    setParseResult(null);
    setUploadError(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setLimitReached(false);
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setLimitReached(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col items-center justify-between font-sans selection:bg-sky-500/30">
      {/* BRAND HEADER */}
      <header className="w-full border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 p-0.5 shadow-lg glow-cyan flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
                <Target className="w-5 h-5 text-sky-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white font-heading">
                  RESUME
                </span>
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 font-heading">
                  OPTIMIZER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Precision ATS Matcher & Bullet Editor</p>
            </div>
          </div>

          {/* Right Header Status Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {session?.user && (
              <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs shadow-sm">
                <span className="text-slate-300 font-medium truncate max-w-[160px]">
                  {session.user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 font-medium transition-colors border-l border-slate-800 pl-3 flex items-center gap-1 min-h-[28px]"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium max-w-full">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendStatus === 'unreachable'
                    ? 'bg-rose-500'
                    : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="truncate max-w-[200px] sm:max-w-none text-slate-300">
                {backendStatus === 'connected'
                  ? 'Server Online'
                  : backendStatus === 'unreachable'
                  ? 'Server Unreachable'
                  : isWakingUpServer
                  ? 'Waking up server...'
                  : 'Checking server...'}
              </span>

              {backendStatus === 'unreachable' && (
                <button
                  onClick={checkBackendHealth}
                  className="ml-1 text-sky-400 hover:text-sky-300 font-bold underline text-[11px] flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8">
        {sessionExpiredMsg && (
          <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center justify-between text-amber-200 text-xs font-medium shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{sessionExpiredMsg}</span>
            </div>
            <button
              onClick={() => setSessionExpiredMsg(null)}
              className="text-amber-400 hover:text-amber-300 font-bold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {authLoading ? (
          <div className="py-24 text-center text-sm text-slate-400 flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
            Connecting to secure workspace...
          </div>
        ) : !session ? (
          /* LANDING & HERO VIEW BEFORE SIGN IN */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-6">
            {/* Hero Pitch Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Resume Optimization</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-heading">
                Tailor your resume for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">every job description.</span>
              </h2>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                Identify ATS keyword gaps, calculate precise match scores, and rewrite weak bullet points with 100% truthful, high-impact phrasing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider font-heading">
                    <FileCheck2 className="w-4 h-4" />
                    <span>ATS Gap Analysis</span>
                  </div>
                  <p className="text-xs text-slate-400">Instant matched vs missing keyword breakdown ranked by role impact.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-heading">
                    <Zap className="w-4 h-4" />
                    <span>Tailored Bullet Rewriter</span>
                  </div>
                  <p className="text-xs text-slate-400">Transform weak bullets into metric-driven action statements.</p>
                </div>
              </div>
            </div>

            {/* Auth Form Column */}
            <div className="lg:col-span-5">
              <AuthForm onAuthSuccess={(sess) => {
                setSession(sess);
                setSessionExpiredMsg(null);
              }} />
            </div>
          </div>
        ) : (
          /* WORKSPACE VIEW AFTER SIGN IN */
          <div className="space-y-8">
            {limitReached && (
              <div className="p-4 bg-amber-950/50 border border-amber-800/80 rounded-2xl space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm font-heading">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Free Monthly Scan Limit Reached</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  You've utilized your free monthly scan allowance for this calendar month. Your scan history remains fully accessible below.
                </p>
              </div>
            )}

            {!parseResult ? (
              <FileUpload
                onFileSelect={handleFileUpload}
                isLoading={isUploading}
                isSlow={uploadIsSlow}
                error={uploadError}
              />
            ) : analysisResult ? (
              <ResultsDashboard
                analysis={analysisResult}
                resumeText={parseResult.extractedText}
                onReset={handleResetAnalysis}
                token={session.access_token}
                onSessionExpired={handleSessionExpired}
              />
            ) : (
              <div className="space-y-8">
                <ParsedResult
                  result={parseResult}
                  onReset={handleResetUpload}
                />
                <JobDescriptionInput
                  onAnalyze={handleAnalyzeMatch}
                  isAnalyzing={isAnalyzing}
                  isSlow={analyzeIsSlow}
                  error={analysisError}
                />
              </div>
            )}

            <ScanHistory
              token={session.access_token}
              apiUrl={apiUrl}
              onSessionExpired={handleSessionExpired}
            />
          </div>
        )}
      </main>

      {/* LAUNCH FOOTER */}
      <footer className="w-full border-t border-slate-800/80 bg-[#0b0f17] py-6 mt-12 text-slate-500 text-xs font-medium">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Resume Optimizer.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Built for Career Excellence</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-slate-300 transition-colors underline-offset-4 hover:underline"
            >
              Terms of Service
            </button>

            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-slate-300 transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      {/* LEGAL MODALS */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}

export default App;


