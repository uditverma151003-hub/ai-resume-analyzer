import { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import HighlightedResume from './HighlightedResume';
import BulletRewriteModal from './BulletRewriteModal';

function ResultsDashboard({ analysis, resumeText, onReset, token }) {
  const [currentResumeText, setCurrentResumeText] = useState(resumeText);
  const [editedLineIndices, setEditedLineIndices] = useState(() => new Set());

  // Rewrite Modal state
  const [activeLine, setActiveLine] = useState(null); // { index, text }
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrites, setRewrites] = useState([]);
  const [rewriteError, setRewriteError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  if (!analysis) return null;

  const { overallScore = 0, categoryScores = {}, matchedKeywords = [], missingKeywords = [], summary = '' } = analysis;

  // Determine score color band styling (0-49 red, 50-74 amber, 75-100 green)
  const scoreTheme = useMemo(() => {
    if (overallScore >= 75) {
      return {
        badgeBg: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300',
        bigNumberText: 'text-emerald-400',
        strokeColor: '#10b981',
        fillColor: '#10b981',
        label: 'Strong Match',
      };
    }
    if (overallScore >= 50) {
      return {
        badgeBg: 'bg-amber-950/40 border-amber-800/60 text-amber-300',
        bigNumberText: 'text-amber-400',
        strokeColor: '#f59e0b',
        fillColor: '#f59e0b',
        label: 'Moderate Match',
      };
    }
    return {
      badgeBg: 'bg-rose-950/40 border-rose-800/60 text-rose-300',
      bigNumberText: 'text-rose-400',
      strokeColor: '#f43f5e',
      fillColor: '#f43f5e',
      label: 'Low Match',
    };
  }, [overallScore]);

  // Format Recharts radar data
  const radarData = useMemo(() => [
    { subject: 'Skills', score: categoryScores.skillsMatch ?? 0, fullMark: 100 },
    { subject: 'Experience', score: categoryScores.experienceMatch ?? 0, fullMark: 100 },
    { subject: 'Keywords', score: categoryScores.keywordMatch ?? 0, fullMark: 100 },
  ], [categoryScores]);

  // Sort missing keywords by importance (High -> Medium -> Low)
  const sortedMissingKeywords = useMemo(() => {
    const order = { high: 1, medium: 2, low: 3 };
    return [...(missingKeywords || [])].sort((a, b) => {
      const impA = order[a.importance?.toLowerCase()] || 4;
      const impB = order[b.importance?.toLowerCase()] || 4;
      return impA - impB;
    });
  }, [missingKeywords]);

  const getMissingKeywordStyle = (importance) => {
    switch (importance?.toLowerCase()) {
      case 'high':
        return 'bg-rose-950/60 text-rose-200 border-rose-800/80';
      case 'medium':
        return 'bg-amber-950/60 text-amber-200 border-amber-800/80';
      case 'low':
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700';
    }
  };

  const fetchBulletRewrites = async (bulletText) => {
    setIsRewriting(true);
    setRewriteError(null);
    setRewrites([]);

    try {
      const res = await fetch(`${apiUrl}/api/resume/rewrite-bullet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bulletText,
          jobDescription: summary || 'Target Job Qualifications & Skills',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate bullet rewrites.');
      }

      setRewrites(data.rewrites || []);
    } catch (err) {
      setRewriteError(err.message || 'An unexpected error occurred during rewrite generation.');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleLineClick = (lineText, lineIdx) => {
    setActiveLine({ index: lineIdx, text: lineText });
    fetchBulletRewrites(lineText);
  };

  const handleSelectRewrite = (newText) => {
    if (!activeLine) return;

    const lines = currentResumeText.split('\n');
    lines[activeLine.index] = newText;

    const updatedResumeText = lines.join('\n');
    setCurrentResumeText(updatedResumeText);

    setEditedLineIndices((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(activeLine.index);
      return nextSet;
    });

    setActiveLine(null);
  };

  const handleCloseModal = () => {
    setActiveLine(null);
    setIsRewriting(false);
    setRewriteError(null);
    setRewrites([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Top Header & Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Match Analysis Dashboard
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${scoreTheme.badgeBg}`}>
              {scoreTheme.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual breakdown of resume alignment against job requirements
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold rounded-xl border border-slate-700 transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Analyze Another Role
        </button>
      </div>

      {/* MATCH SCORE SECTION — Big Score Callout + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Big Overall Score Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Overall Match Score
          </div>

          <div className={`text-6xl sm:text-7xl font-extrabold tracking-tight my-2 font-mono ${scoreTheme.bigNumberText}`}>
            {overallScore}
            <span className="text-2xl text-slate-500 font-sans font-normal ml-1">/100</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-4 max-w-[200px]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${overallScore}%`,
                backgroundColor: scoreTheme.strokeColor,
              }}
            />
          </div>

          <p className="text-xs text-slate-400 max-w-[220px]">
            Calculated across skills, work experience, and job keyword frequency
          </p>
        </div>

        {/* Recharts Radar Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[300px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Category Radar Match
            </h3>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Skills: <strong className="text-white">{categoryScores.skillsMatch ?? 0}%</strong></span>
              <span>Exp: <strong className="text-white">{categoryScores.experienceMatch ?? 0}%</strong></span>
              <span>Keywords: <strong className="text-white">{categoryScores.keywordMatch ?? 0}%</strong></span>
            </div>
          </div>

          <div className="w-full h-[230px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke={scoreTheme.strokeColor}
                  fill={scoreTheme.fillColor}
                  fillOpacity={0.4}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY CALLOUT CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Executive Summary Assessment
          </h3>
        </div>
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
          {summary}
        </p>
      </div>

      {/* KEYWORD GAP LIST SECTION — Matched & Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Matched Keywords ({matchedKeywords.length})
            </h3>
            <span className="text-xs text-slate-500">Found in resume</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-emerald-950/50 text-emerald-300 border border-emerald-800/80 text-xs font-medium rounded-lg shadow-sm"
                >
                  ✓ {keyword}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No exact matching keywords found.</p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Missing Keywords ({sortedMissingKeywords.length})
            </h3>
            <span className="text-xs text-slate-500">Sorted by importance</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {sortedMissingKeywords.length > 0 ? (
              sortedMissingKeywords.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 border text-xs font-medium rounded-lg flex items-center gap-2 shadow-sm ${getMissingKeywordStyle(item.importance)}`}
                >
                  <span>{item.keyword}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-black/30 border border-white/10">
                    {item.importance}
                  </span>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No critical missing keywords identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* RESUME TEXT WITH INTERACTIVE BULLET REWRITING */}
      {currentResumeText && (
        <HighlightedResume
          resumeText={currentResumeText}
          matchedKeywords={matchedKeywords}
          editedLineIndices={editedLineIndices}
          onLineClick={handleLineClick}
        />
      )}

      {/* BULLET REWRITE MODAL */}
      {activeLine && (
        <BulletRewriteModal
          originalText={activeLine.text}
          rewrites={rewrites}
          isLoading={isRewriting}
          error={rewriteError}
          onSelectRewrite={handleSelectRewrite}
          onRetry={() => fetchBulletRewrites(activeLine.text)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default ResultsDashboard;
