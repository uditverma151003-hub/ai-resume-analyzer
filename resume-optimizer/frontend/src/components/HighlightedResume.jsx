import { useMemo } from 'react';
import { FileText, Sparkles, Wand2, Check, Hash } from 'lucide-react';

function HighlightedResume({
  resumeText,
  matchedKeywords = [],
  editedLineIndices = new Set(),
  onLineClick,
}) {
  // Helper to render keyword highlights safely inside a single line chunk
  const renderHighlightedLineText = (lineText) => {
    if (!lineText) return '';
    if (!matchedKeywords || matchedKeywords.length === 0) return lineText;

    const validKeywords = matchedKeywords
      .filter((kw) => typeof kw === 'string' && kw.trim().length > 0)
      .sort((a, b) => b.length - a.length);

    if (validKeywords.length === 0) return lineText;

    const escapedKeywords = validKeywords.map((kw) =>
      kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    const parts = lineText.split(regex);
    const keywordSet = new Set(validKeywords.map((kw) => kw.toLowerCase()));

    return parts.map((part, index) => {
      if (keywordSet.has(part.toLowerCase())) {
        return (
          <mark
            key={index}
            className="bg-emerald-950/90 text-emerald-200 border border-emerald-700/80 font-bold px-1.5 py-0.5 rounded-md inline-block my-0.5 shadow-sm"
          >
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Split resume into lines
  const lines = useMemo(() => {
    if (!resumeText) return [];
    return resumeText.split('\n');
  }, [resumeText]);

  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
      {/* Header bar */}
      <div className="bg-[#06090e]/95 px-5 sm:px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-white font-heading block">
              Interactive Resume Line Editor
            </span>
            <span className="text-[11px] text-slate-400">Tap bullet points below to optimize with AI rewrites</span>
          </div>
        </div>

        <span className="text-xs text-sky-400 font-bold flex items-center gap-1.5 font-heading">
          <Wand2 className="w-3.5 h-3.5" />
          Tap any bullet line for instant AI options
        </span>
      </div>

      {/* Editor Content */}
      <div className="p-3 sm:p-5 bg-[#06090e]/90 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed max-h-[520px] overflow-y-auto space-y-1">
        {lines.map((line, lineIdx) => {
          const isNonEmpty = line.trim().length > 0;
          const isEdited = editedLineIndices.has(lineIdx);
          const isEligibleForRewrite = line.trim().length >= 10;

          if (!isNonEmpty) {
            return (
              <div key={lineIdx} className="h-3 flex items-center text-slate-700 text-[10px]">
                <span className="w-8 select-none text-slate-700 font-mono">{String(lineIdx + 1).padStart(2, '0')}</span>
              </div>
            );
          }

          return (
            <div
              key={lineIdx}
              onClick={() => isEligibleForRewrite && onLineClick && onLineClick(line, lineIdx)}
              className={`group relative rounded-2xl px-3 py-2.5 transition-all duration-200 flex items-start justify-between gap-3 min-h-[42px] ${
                isEligibleForRewrite
                  ? 'hover:bg-sky-950/40 cursor-pointer border border-transparent hover:border-sky-500/40 active:bg-sky-950/60'
                  : 'cursor-default'
              } ${isEdited ? 'bg-sky-950/50 border border-sky-800/80' : ''}`}
            >
              {/* Line Number Gutter */}
              <span className="w-8 shrink-0 text-slate-600 font-mono text-xs select-none pt-0.5">
                {String(lineIdx + 1).padStart(2, '0')}
              </span>

              {/* Text Body */}
              <div className="flex-1 break-words leading-relaxed">
                {renderHighlightedLineText(line)}
              </div>

              {/* Line Action Pills */}
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                {isEdited && (
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800 shadow-sm flex items-center gap-1 font-heading">
                    <Check className="w-3 h-3 text-sky-400" />
                    Edited
                  </span>
                )}

                {isEligibleForRewrite && (
                  <span className="opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md transition-opacity flex items-center gap-1.5 font-heading">
                    <Sparkles className="w-3 h-3 text-sky-200" />
                    AI Rewrite
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HighlightedResume;
