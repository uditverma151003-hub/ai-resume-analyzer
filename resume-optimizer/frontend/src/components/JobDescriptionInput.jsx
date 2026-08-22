import { useState } from 'react';
import { Target, Sparkles, Clock, AlertCircle, RotateCw, FileCode2, Briefcase } from 'lucide-react';

const SAMPLE_JOB_PRESETS = [
  {
    title: 'Senior Software Engineer',
    text: `Role Summary: We are seeking a Senior Software Engineer with expertise in React, Node.js, TypeScript, PostgreSQL, and AWS cloud infrastructure. Responsibilities include building scalable web applications, optimizing API performance, writing comprehensive unit and integration tests, and collaborating across agile engineering squads. Requirements: 5+ years of full-stack software development experience, strong understanding of CI/CD pipelines, Docker containerization, RESTful microservices, and system architecture. Experience with performance profiling, Git version control, and leading code reviews is highly preferred.`,
  },
  {
    title: 'Product Manager',
    text: `Role Summary: Looking for a Lead Product Manager to drive customer roadmap, metrics analytics, and cross-functional product execution. Key qualifications include market strategy analysis, user story definition, A/B experimentation, data-driven decisions using SQL and Mixpanel, agile Scrum sprint management, user research synthesis, stakeholder communication, and ROI prioritization. Minimum 4+ years of product management experience delivering B2B SaaS software products.`,
  },
  {
    title: 'Data Scientist / AI Engineer',
    text: `Role Summary: Joining as a Data Scientist & AI Engineer to build machine learning models, natural language processing pipelines, and data pipelines. Must be proficient in Python, PyTorch/TensorFlow, scikit-learn, SQL, data visualization, feature engineering, statistical modeling, pandas, numpy, and deploying ML models to production via REST APIs. Master's degree in CS/Data Science or 3+ years of applied machine learning experience required.`,
  },
];

function JobDescriptionInput({ onAnalyze, isAnalyzing, isSlow, error }) {
  const [jobDescription, setJobDescription] = useState('');

  const charCount = jobDescription.trim().length;
  const minRequired = 50;
  const isMinLength = charCount >= minRequired;
  const charProgress = Math.min(100, Math.round((charCount / minRequired) * 100));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMinLength && !isAnalyzing) {
      onAnalyze(jobDescription.trim());
    }
  };

  const handleApplyPreset = (presetText) => {
    setJobDescription(presetText);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Top Header & Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <label htmlFor="job-description-input" className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2.5 font-heading">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Target className="w-5 h-5" />
            </div>
            <span>Target Job Description</span>
          </label>

          {/* Character counter badge */}
          <div className="flex items-center gap-2">
            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
              <div
                className={`h-full transition-all duration-300 ${isMinLength ? 'bg-emerald-400' : 'bg-sky-500'}`}
                style={{ width: `${charProgress}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition-colors ${
                isMinLength
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}
            >
              {charCount} / 50 min chars
            </span>
          </div>
        </div>

        {/* Quick Fill Sample Role Presets */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold font-heading">
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            <span>Quick Fill Sample Job Preset:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_JOB_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset.text)}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-95 min-h-[32px] font-sans"
              >
                + {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          id="job-description-input"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the target job posting requirements, key skills, responsibilities, and qualifications here..."
          rows={7}
          disabled={isAnalyzing}
          className="w-full p-4.5 bg-[#06090e]/90 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all resize-y min-h-[160px] font-sans leading-relaxed"
        />

        {isAnalyzing && isSlow && (
          <div className="p-3.5 bg-amber-950/60 border border-amber-800/80 rounded-2xl text-amber-200 text-xs animate-scale-up flex items-center gap-2.5 shadow-lg">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Server is processing complex match vectors — hang tight...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200 text-xs sm:text-sm animate-scale-up">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => onAnalyze(jobDescription.trim())}
              className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 self-end sm:self-auto min-h-[36px] flex items-center gap-1.5 font-heading shadow-md active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        )}

        {/* Primary Analyze Button */}
        <button
          onClick={handleSubmit}
          disabled={!isMinLength || isAnalyzing}
          className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl min-h-[56px] font-heading ${
            isMinLength && !isAnalyzing
              ? 'bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white shadow-sky-500/25 active:scale-[0.99] glow-cyan cursor-pointer'
              : 'bg-slate-800/70 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Calculating Precision ATS Score & Keyword Gaps...</span>
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
