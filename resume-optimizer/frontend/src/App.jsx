import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ParsedResult from './components/ParsedResult';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResultsDashboard from './components/ResultsDashboard';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Network response was not ok');
      })
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('unreachable'));
  }, [apiUrl]);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadError(null);
    setParseResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);

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

    try {
      const response = await fetch(`${apiUrl}/api/resume/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: parseResult.extractedText,
          jobDescription: jobDescription,
        }),
      });

      const data = await response.json();

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
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-6 font-sans">
      <header className="w-full max-w-4xl flex items-center justify-between py-6 border-b border-slate-800 mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Resume Optimizer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Phase 3: Visual Dashboard</p>
        </div>

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
          <span>Backend status: {backendStatus}</span>
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-8">
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
      </main>
    </div>
  );
}


export default App;
