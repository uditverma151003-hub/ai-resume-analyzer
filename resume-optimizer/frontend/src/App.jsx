import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ParsedResult from './components/ParsedResult';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResultsDashboard from './components/ResultsDashboard';
import AuthForm from './components/AuthForm';
import ScanHistory from './components/ScanHistory';
import { supabase } from './lib/supabaseClient';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-6 font-sans">
      <header className="w-full max-w-4xl flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-slate-800 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Resume Optimizer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">AI-Powered Resume Matcher & Optimizer</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {session?.user && (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs">
              <span className="text-slate-300 font-medium truncate max-w-[160px] sm:max-w-[180px]">
                {session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors border-l border-slate-800 pl-3 min-h-[32px]"
              >
                Logout
              </button>
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium max-w-full">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                backendStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : backendStatus === 'unreachable'
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="truncate max-w-[240px] sm:max-w-none">
              {backendStatus === 'connected'
                ? 'Backend: connected'
                : backendStatus === 'unreachable'
                ? 'Backend: unreachable'
                : isWakingUpServer
                ? 'Waking up the server — this can take up to a minute on first load'
                : 'Checking backend...'}
            </span>

            {backendStatus === 'unreachable' && (
              <button
                onClick={checkBackendHealth}
                className="ml-1 text-indigo-400 hover:text-indigo-300 font-bold underline text-[11px]"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        {sessionExpiredMsg && (
          <div className="p-4 bg-amber-950/60 border border-amber-800/80 rounded-2xl flex items-center justify-between text-amber-200 text-xs font-medium shadow-lg animate-fade-in">
            <span>{sessionExpiredMsg}</span>
            <button
              onClick={() => setSessionExpiredMsg(null)}
              className="text-amber-400 hover:text-amber-300 font-bold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {authLoading ? (
          <div className="py-20 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            Loading authentication...
          </div>
        ) : !session ? (
          <div className="space-y-6">
            <AuthForm onAuthSuccess={(sess) => {
              setSession(sess);
              setSessionExpiredMsg(null);
            }} />
          </div>
        ) : (
          <div className="space-y-8">
            {limitReached && (
              <div className="p-4 bg-amber-950/60 border border-amber-800/80 rounded-2xl space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Free Monthly Scan Cap Reached</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  You've used your free scan for this calendar month. Upgrade for unlimited access.
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
    </div>
  );
}

export default App;

