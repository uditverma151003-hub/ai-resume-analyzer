import { useMemo } from 'react';

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
            className="bg-emerald-950/80 text-emerald-200 border border-emerald-700/60 font-semibold px-1 py-0.5 rounded inline-block my-0.5"
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-slate-950/90 px-4 sm:px-5 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive Resume Viewer
          </span>
        </div>
        <span className="text-xs text-indigo-400 font-medium">
          Tap or click any bullet line to AI rewrite
        </span>
      </div>

      <div className="p-3 sm:p-4 bg-slate-900/90 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed max-h-[500px] overflow-y-auto space-y-1">
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
              className={`group relative rounded px-3 py-2 transition-all duration-150 flex items-start justify-between gap-3 min-h-[38px] ${
                isEligibleForRewrite
                  ? 'hover:bg-indigo-950/40 cursor-pointer border border-transparent hover:border-indigo-500/40 active:bg-indigo-950/60'
                  : 'cursor-default'
              } ${isEdited ? 'bg-indigo-950/30 border border-indigo-800/60' : ''}`}
            >
              <div className="flex-1 break-words">
                {renderHighlightedLineText(line)}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isEdited && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 shadow-sm">
                    Edited
                  </span>
                )}

                {isEligibleForRewrite && (
                  <span className="opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white shadow-sm transition-opacity">
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
