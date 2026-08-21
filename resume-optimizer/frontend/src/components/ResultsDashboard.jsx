import { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  RotateCcw,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Info,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';
import HighlightedResume from './HighlightedResume';
import BulletRewriteModal from './BulletRewriteModal';

function ResultsDashboard({ analysis, resumeText, onReset, token, onSessionExpired }) {
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
        badgeBg: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300',
        bigNumberText: 'text-emerald-400',
        strokeColor: '#10b981',
        fillColor: '#10b981',
        glowClass: 'glow-emerald',
        label: 'Strong Match',
      };
    }
    if (overallScore >= 50) {
      return {
        badgeBg: 'bg-amber-950/60 border-amber-800/80 text-amber-300',
        bigNumberText: 'text-amber-400',
        strokeColor: '#f59e0b',
        fillColor: '#f59e0b',
        glowClass: '',
        label: 'Moderate Match',
      };
    }
    return {
      badgeBg: 'bg-rose-950/60 border-rose-800/80 text-rose-300',
      bigNumberText: 'text-rose-400',
      strokeColor: '#f43f5e',
      fillColor: '#f43f5e',
      glowClass: '',
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

      if (res.status === 401) {
        if (onSessionExpired) onSessionExpired();
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate bullet rewrites.');
      }

      setRewrites(data.rewrites || []);
    } catch (err) {
      setRewriteError(err.message || 'Unable to connect to server for bullet rewrites.');
    } finally {
      setIsRewriting(false);
    }
  };

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [exportError, setExportError] = useState(null);

  const handleExport = async (format) => {
    setIsExporting(true);
    setExportingFormat(format);
    setExportError(null);

    try {
      const response = await fetch(`${apiUrl}/api/resume/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          resumeText: currentResumeText,
          format: format,
          filename: 'optimized-resume',
        }),
      });

      if (response.status === 401) {
        if (onSessionExpired) onSessionExpired();
        return;
      }

      if (!response.ok) {
        let errMessage = 'Failed to generate document';
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch (_) {}
        throw new Error(errMessage);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `optimized-resume.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setExportError(err.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
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
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12 overflow-x-hidden">
      {/* AI DISCLAIMER NOTICE BANNER */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-400 backdrop-blur-md">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">AI Analysis Notice:</strong> Ratings, ATS gap analyses, and suggested bullet rewrites are AI-generated recommendations. Please review and verify all phrasing for 100% accuracy before submitting to prospective employers.
        </p>
      </div>

      {/* Top Header & Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
              Match Analysis Dashboard
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border font-heading ${scoreTheme.badgeBg}`}>
              {scoreTheme.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive breakdown of resume alignment against job requirements
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 transition-all shadow-md active:scale-95 min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          Analyze Another Role
        </button>
      </div>

      {/* MATCH SCORE SECTION — Big Score Callout + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Unmistakable Focal Point: Big Score Card */}
        <div className={`lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden backdrop-blur-md ${scoreTheme.glowClass}`}>
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 font-heading">
            Overall Match Score
          </div>

          <div className={`text-6xl sm:text-7xl font-extrabold tracking-tight my-2 font-mono ${scoreTheme.bigNumberText}`}>
            {overallScore}
            <span className="text-2xl text-slate-500 font-sans font-normal ml-1">/100</span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden my-4 max-w-[200px] border border-slate-800">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${overallScore}%`,
                backgroundColor: scoreTheme.strokeColor,
              }}
            />
          </div>

          <p className="text-xs text-slate-400 max-w-[220px]">
            Calculated across skills, experience, and key terminology alignment
          </p>
        </div>

        {/* Recharts Radar Chart */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl min-h-[300px] overflow-hidden backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-2 gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
              Category Radar Match
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
              <span>Skills: <strong className="text-white">{categoryScores.skillsMatch ?? 0}%</strong></span>
              <span>Exp: <strong className="text-white">{categoryScores.experienceMatch ?? 0}%</strong></span>
              <span>Keywords: <strong className="text-white">{categoryScores.keywordMatch ?? 0}%</strong></span>
            </div>
          </div>

          <div className="w-full h-[220px] sm:h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 9 }}
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
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/20 to-slate-900 border border-sky-900/30 rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 font-heading">
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
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-heading">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              Matched Keywords ({matchedKeywords.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Found in resume</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-emerald-950/50 text-emerald-300 border border-emerald-800/80 text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{keyword}</span>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No exact matching keywords found.</p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 font-heading">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              Missing Keywords ({sortedMissingKeywords.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Sorted by importance</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {sortedMissingKeywords.length > 0 ? (
              sortedMissingKeywords.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 border text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm ${getMissingKeywordStyle(item.importance)}`}
                >
                  <span>{item.keyword}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold tracking-wider bg-black/40 border border-white/10">
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

      {/* EXPORT RESUME CONTROL CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-heading">
              <Download className="w-5 h-5 text-sky-400 shrink-0" />
              Export Optimized Resume
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Download your resume including any accepted bullet rewrites applied below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 min-h-[44px] font-heading"
            >
              {isExporting && exportingFormat === 'pdf' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Download as PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleExport('docx')}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-md active:scale-95 min-h-[44px] font-heading"
            >
              {isExporting && exportingFormat === 'docx' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing DOCX...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                  <span>Download as DOCX</span>
                </>
              )}
            </button>
          </div>
        </div>

        {exportError && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs font-medium">
            {exportError}
          </div>
        )}
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


