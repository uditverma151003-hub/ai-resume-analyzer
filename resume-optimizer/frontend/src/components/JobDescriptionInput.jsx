import { useState } from 'react';
import { Target, Sparkles, Clock, AlertCircle, RotateCw } from 'lucide-react';

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
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <label htmlFor="job-description-input" className="text-sm sm:text-base font-bold text-white flex items-center gap-2 font-heading">
            <Target className="w-4 h-4 text-sky-400" />
            Target Job Posting / Description
          </label>
          <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
            isMinLength
              ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            {charCount} / 50 min chars
          </span>
        </div>

        <textarea
          id="job-description-input"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job posting, required qualifications, key skills, and responsibilities here..."
          rows={7}
          disabled={isAnalyzing}
          className="w-full p-4 bg-[#0b0f17] border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-all resize-y min-h-[150px] font-sans"
        />

        {isAnalyzing && isSlow && (
          <div className="p-3.5 bg-amber-950/50 border border-amber-800/60 rounded-xl text-amber-200 text-xs animate-fade-in flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>This is taking a bit longer than usual — server waking up from idle</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => onAnalyze(jobDescription.trim())}
              className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 self-end sm:self-auto min-h-[32px] flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isMinLength || isAnalyzing}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl min-h-[52px] font-heading ${
            isMinLength && !isAnalyzing
              ? 'bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white shadow-sky-500/20 active:scale-[0.99] glow-cyan'
              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing resume match against role...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-sky-200" />
              <span>Analyze Match & ATS Score</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default JobDescriptionInput;
