import { useState } from 'react';

function JobDescriptionInput({ onAnalyze, isAnalyzing, isSlow, error }) {
  const [jobDescription, setJobDescription] = useState('');

  const charCount = jobDescription.trim().length;
  const isMinLength = charCount >= 50;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMinLength && !isAnalyzing) {
      onAnalyze(jobDescription.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="job-description-input" className="text-sm sm:text-base font-semibold text-white block">
            Target Job Description
          </label>
          <span className={`text-xs font-mono ${isMinLength ? 'text-emerald-400' : 'text-amber-400'}`}>
            {charCount} / 50 min chars
          </span>
        </div>

        <textarea
          id="job-description-input"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job posting, required qualifications, and key responsibilities here..."
          rows={7}
          disabled={isAnalyzing}
          className="w-full p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-y min-h-[140px]"
        />

        {isAnalyzing && isSlow && (
          <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl text-amber-200 text-xs animate-fade-in flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>This is taking a bit longer than usual — the server may be waking up from idle</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200 text-sm">
            <span>{error}</span>
            <button
              onClick={() => onAnalyze(jobDescription.trim())}
              className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded text-xs font-semibold transition-colors shrink-0 self-end sm:self-auto min-h-[32px]"
            >
              Try again
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isMinLength || isAnalyzing}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg min-h-[48px] ${
            isMinLength && !isAnalyzing
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.99]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing your resume against this role...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Analyze Match</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default JobDescriptionInput;

