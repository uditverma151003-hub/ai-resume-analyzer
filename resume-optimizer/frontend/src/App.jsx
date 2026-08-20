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
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  // Check backend health
  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Network response was not ok');
      })
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('unreachable'));
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
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadError(null);
    setParseResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setLimitReached(false);

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
      setUploadError(err.message || 'An unexpected error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeMatch = async (jobDescription) => {
    if (!parseResult || !parseResult.extractedText) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setLimitReached(false);

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
      setAnalysisError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
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
      <header className="w-full max-w-4xl flex items-center justify-between py-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Resume Optimizer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Phase 5: Auth & Monthly Limit</p>
        </div>

        <div className="flex items-center gap-3">
          {session?.user && (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs">
              <span className="text-slate-300 font-medium truncate max-w-[180px]">
                {session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors border-l border-slate-800 pl-3"
              >
                Logout
              </button>
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : backendStatus === 'unreachable'
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span>Backend: {backendStatus}</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        {authLoading ? (
          <div className="py-20 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            Loading authentication...
          </div>
        ) : !session ? (
          <div className="space-y-6">
            <AuthForm onAuthSuccess={(sess) => setSession(sess)} />
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
                error={uploadError}
              />
            ) : analysisResult ? (
              <ResultsDashboard
                analysis={analysisResult}
                resumeText={parseResult.extractedText}
                onReset={handleResetAnalysis}
                token={session.access_token}
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
                  error={analysisError}
                />
              </div>
            )}

            <ScanHistory token={session.access_token} apiUrl={apiUrl} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
