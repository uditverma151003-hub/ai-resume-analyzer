import { useMemo } from 'react';
import { FileText, Sparkles, Wand2, Check } from 'lucide-react';

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
            className="bg-emerald-950/80 text-emerald-200 border border-emerald-700/60 font-semibold px-1.5 py-0.5 rounded inline-block my-0.5"
          >
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Split resume into lines and prepare rendered rows
  const lines = useMemo(() => {
    if (!resumeText) return [];
    return resumeText.split('\n');
  }, [resumeText]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="bg-[#0b0f17]/90 px-5 sm:px-6 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
            Interactive Resume Line Editor
          </span>
        </div>
        <span className="text-xs text-sky-400 font-semibold flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5" />
          Tap any bullet line to generate AI rewrites
        </span>
      </div>

      <div className="p-4 sm:p-5 bg-slate-900/90 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed max-h-[500px] overflow-y-auto space-y-1">
        {lines.map((line, lineIdx) => {
          const isNonEmpty = line.trim().length > 0;
          const isEdited = editedLineIndices.has(lineIdx);
          const isEligibleForRewrite = line.trim().length >= 10;

          if (!isNonEmpty) {
            return <div key={lineIdx} className="h-4" />;
          }

          return (
            <div
              key={lineIdx}
              onClick={() => isEligibleForRewrite && onLineClick && onLineClick(line, lineIdx)}
              className={`group relative rounded-xl px-3.5 py-2.5 transition-all duration-150 flex items-start justify-between gap-3 min-h-[40px] ${
                isEligibleForRewrite
                  ? 'hover:bg-sky-950/30 cursor-pointer border border-transparent hover:border-sky-500/40 active:bg-sky-950/50'
                  : 'cursor-default'
              } ${isEdited ? 'bg-sky-950/40 border border-sky-800/60' : ''}`}
            >
              <div className="flex-1 break-words">
                {renderHighlightedLineText(line)}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isEdited && (
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800 shadow-sm flex items-center gap-1">
                    <Check className="w-3 h-3 text-sky-400" />
                    Edited
                  </span>
                )}

                {isEligibleForRewrite && (
                  <span className="opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-sky-500 text-white shadow-sm transition-opacity flex items-center gap-1 font-heading">
                    <Sparkles className="w-3 h-3" />
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

