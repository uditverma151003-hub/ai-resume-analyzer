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
  Target,
  Copy,
  Check,
  Filter,
  BarChart3,
  Layers,
  Wand2
} from 'lucide-react';
import HighlightedResume from './HighlightedResume';
import BulletRewriteModal from './BulletRewriteModal';

function ResultsDashboard({ analysis, resumeText, onReset, token, onSessionExpired }) {
  const [currentResumeText, setCurrentResumeText] = useState(resumeText);
  const [editedLineIndices, setEditedLineIndices] = useState(() => new Set());
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'keywords' | 'editor'
  const [keywordFilter, setKeywordFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [copiedKeyword, setCopiedKeyword] = useState(null);

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
        badgeBg: 'bg-emerald-950/80 border-emerald-800/90 text-emerald-300',
        bigNumberText: 'text-emerald-400',
        strokeColor: '#10b981',
        fillColor: '#10b981',
        glowClass: 'glow-emerald',
        label: 'Strong Role Match',
        description: 'Excellent ATS optimization! Your resume strongly matches the job requirements.',
      };
    }
    if (overallScore >= 50) {
      return {
        badgeBg: 'bg-amber-950/80 border-amber-800/90 text-amber-300',
        bigNumberText: 'text-amber-400',
        strokeColor: '#f59e0b',
        fillColor: '#f59e0b',
        glowClass: '',
        label: 'Moderate Role Match',
        description: 'Good foundation. Adding missing key skills below will significantly boost your interview callback rate.',
      };
    }
    return {
      badgeBg: 'bg-rose-950/80 border-rose-800/90 text-rose-300',
      bigNumberText: 'text-rose-400',
      strokeColor: '#f43f5e',
      fillColor: '#f43f5e',
      glowClass: '',
      label: 'Needs Key Keyword Alignment',
      description: 'Significant keyword gap detected. Incorporating target terms and tailored bullet rewrites is recommended.',
    };
  }, [overallScore]);

  // Format Recharts radar data
  const radarData = useMemo(() => [
    { subject: 'Skills', score: categoryScores.skillsMatch ?? 0, fullMark: 100 },
    { subject: 'Experience', score: categoryScores.experienceMatch ?? 0, fullMark: 100 },
    { subject: 'Keywords', score: categoryScores.keywordMatch ?? 0, fullMark: 100 },
  ], [categoryScores]);

  // Filter missing keywords
  const sortedMissingKeywords = useMemo(() => {
    const order = { high: 1, medium: 2, low: 3 };
    let list = [...(missingKeywords || [])].sort((a, b) => {
      const impA = order[a.importance?.toLowerCase()] || 4;
      const impB = order[b.importance?.toLowerCase()] || 4;
      return impA - impB;
    });

    if (keywordFilter !== 'all') {
      list = list.filter((kw) => kw.importance?.toLowerCase() === keywordFilter);
    }
    return list;
  }, [missingKeywords, keywordFilter]);

  const getMissingKeywordStyle = (importance) => {
    switch (importance?.toLowerCase()) {
      case 'high':
        return 'bg-rose-950/70 text-rose-200 border-rose-800/90 hover:border-rose-500';
      case 'medium':
        return 'bg-amber-950/70 text-amber-200 border-amber-800/90 hover:border-amber-500';
      case 'low':
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:border-slate-500';
    }
  };

  const copyKeywordToClipboard = (keywordText) => {
    navigator.clipboard.writeText(keywordText);
    setCopiedKeyword(keywordText);
    setTimeout(() => setCopiedKeyword(null), 2000);
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
    setEditedLineIndices((prev) => new Set(prev).add(activeLine.index));
    setActiveLine(null);
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-5xl mx-auto">
      {/* Action Header Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-heading">
              Optimization Control Room
            </h2>
            <p className="text-xs text-slate-400">ATS Insights & Interactive Bullet Rewriter</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 min-h-[40px] font-heading"
          >
            {isExporting && exportingFormat === 'pdf' ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => handleExport('txt')}
            disabled={isExporting}
            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-700 active:scale-95 flex items-center gap-2 min-h-[40px] font-heading"
          >
            {isExporting && exportingFormat === 'txt' ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            )}
            <span>Export TXT</span>
          </button>

          <button
            onClick={onReset}
            className="px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-2xl text-xs font-semibold transition-all border border-slate-800 min-h-[40px] flex items-center gap-1.5 font-heading"
            title="Start new analysis"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {exportError && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-200 text-xs font-medium flex items-center gap-2.5 animate-scale-up">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{exportError}</span>
        </div>
      )}

      {/* OVERALL MATCH SCORE HERO CARD */}
      <div className={`glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden ${scoreTheme.glowClass}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Big Radial Gauge & Score */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-3 border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-6 lg:pb-0 lg:pr-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer Ring Ambient Glow */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800/80"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={scoreTheme.strokeColor}
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * overallScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold font-mono tracking-tight ${scoreTheme.bigNumberText}`}>
                  {overallScore}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">out of 100</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className={`inline-block px-3 py-1 rounded-full border text-xs font-extrabold font-heading ${scoreTheme.badgeBg}`}>
                {scoreTheme.label}
              </span>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{scoreTheme.description}</p>
            </div>
          </div>

          {/* Recharts Radar Chart */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-heading">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                Dimensional Match Breakdown
              </h3>
              <span className="text-xs text-slate-400 font-mono">3 Core Pillars</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke={scoreTheme.strokeColor}
                    fill={scoreTheme.fillColor}
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score pills */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/80">
              <div className="p-2.5 rounded-2xl bg-[#06090e]/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block font-heading">Skills</span>
                <span className="text-sm font-extrabold font-mono text-white">{categoryScores.skillsMatch ?? 0}%</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#06090e]/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block font-heading">Experience</span>
                <span className="text-sm font-extrabold font-mono text-white">{categoryScores.experienceMatch ?? 0}%</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#06090e]/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block font-heading">Keywords</span>
                <span className="text-sm font-extrabold font-mono text-white">{categoryScores.keywordMatch ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEGMENTED NAVIGATION TABS */}
      <div className="grid grid-cols-3 p-1.5 glass-panel rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 text-xs font-extrabold rounded-xl transition-all font-heading flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-lg glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Overview & Summary</span>
          <span className="sm:hidden">Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('keywords')}
          className={`py-3 text-xs font-extrabold rounded-xl transition-all font-heading flex items-center justify-center gap-2 ${
            activeTab === 'keywords'
              ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-lg glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span className="hidden sm:inline">Keyword Gap Analysis</span>
          <span className="sm:hidden">Keywords</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`py-3 text-xs font-extrabold rounded-xl transition-all font-heading flex items-center justify-center gap-2 ${
            activeTab === 'editor'
              ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-lg glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span className="hidden sm:inline">Interactive Bullet Editor</span>
          <span className="sm:hidden">Editor</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SUMMARY */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {summary && (
            <div className="glass-panel p-6 rounded-3xl space-y-3 shadow-xl">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-heading">
                <Info className="w-4 h-4 text-sky-400" />
                Executive ATS Assessment Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#06090e]/80 p-4 rounded-2xl border border-slate-800/80">
                {summary}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords Box */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-heading">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Matched Keywords ({matchedKeywords.length})
                </h4>
                <span className="text-[11px] text-emerald-400 font-bold font-mono">Present in Resume</span>
              </div>

              {matchedKeywords.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No direct keyword matches detected.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchedKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs font-medium shadow-sm"
                    >
                      ✓ {typeof kw === 'string' ? kw : kw.keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Top Missing Keywords preview Box */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-2 font-heading">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Top Missing Keywords ({missingKeywords.length})
                </h4>
                <button
                  onClick={() => setActiveTab('keywords')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-bold underline"
                >
                  View All Gaps
                </button>
              </div>

              {missingKeywords.length === 0 ? (
                <p className="text-xs text-slate-400">Great job! No key role keywords are missing.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.slice(0, 10).map((kw, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium ${getMissingKeywordStyle(kw.importance)}`}
                    >
                      + {kw.keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEYWORD GAP ANALYSIS */}
      {activeTab === 'keywords' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-heading">
                <Target className="w-5 h-5 text-sky-400" />
                Missing ATS Keywords & Skills Gap Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any keyword to copy to clipboard for quick placement.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-[#06090e]/90 p-1 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase px-2 font-heading flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" />
                Filter:
              </span>
              {['all', 'high', 'medium', 'low'].map((f) => (
                <button
                  key={f}
                  onClick={() => setKeywordFilter(f)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase transition-all font-heading ${
                    keywordFilter === f
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedMissingKeywords.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-400">
                No missing keywords matching filter criteria.
              </div>
            ) : (
              sortedMissingKeywords.map((kw, idx) => (
                <div
                  key={idx}
                  onClick={() => copyKeywordToClipboard(kw.keyword)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group shadow-sm ${getMissingKeywordStyle(kw.importance)}`}
                  title="Click to copy keyword"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <span className="font-bold text-xs block truncate font-heading">{kw.keyword}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 block">
                      Importance: {kw.importance || 'Medium'}
                    </span>
                  </div>

                  <button className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 transition-colors shrink-0 text-slate-200">
                    {copiedKeyword === kw.keyword ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE RESUME LINE EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-4 animate-fade-in">
          <HighlightedResume
            resumeText={currentResumeText}
            matchedKeywords={matchedKeywords.map(k => typeof k === 'string' ? k : k.keyword)}
            editedLineIndices={editedLineIndices}
            onLineClick={handleLineClick}
          />
        </div>
      )}

      {/* BULLET REWRITE MODAL */}
      <BulletRewriteModal
        originalText={activeLine?.text}
        rewrites={rewrites}
        isLoading={isRewriting}
        error={rewriteError}
        onSelectRewrite={handleSelectRewrite}
        onRetry={() => activeLine && fetchBulletRewrites(activeLine.text)}
        onClose={() => setActiveLine(null)}
      />
    </div>
  );
}

export default ResultsDashboard;
