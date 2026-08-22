import { useState } from 'react';
import { Sparkles, X, Check, RotateCw, AlertCircle, Wand2, Copy } from 'lucide-react';

function BulletRewriteModal({
  originalText,
  rewrites,
  isLoading,
  error,
  onSelectRewrite,
  onRetry,
  onClose,
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!originalText) return null;

  const handleCopyOption = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 max-h-[85vh] flex flex-col backdrop-blur-xl animate-scale-up border-slate-700/80"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#06090e]/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-heading">AI Bullet-Point Rewriter</h3>
              <p className="text-xs text-slate-400">Transform weak statements into metric-driven action points</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-2 rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          {/* Original Card */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-heading">
              Original Bullet Line
            </span>
            <div className="p-4 bg-[#06090e]/90 border border-slate-800 rounded-2xl text-slate-200 text-xs sm:text-sm font-mono leading-relaxed break-words">
              {originalText}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-extrabold text-white font-heading">
                Crafting tailored bullet options...
              </p>
              <p className="text-xs text-slate-400">Analyzing job role requirements & action verbs</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5 text-rose-200 text-xs sm:text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
              <button
                onClick={onRetry}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors min-h-[40px] flex items-center justify-center gap-2 font-heading"
              >
                <RotateCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}

          {/* AI Rewrites List */}
          {!isLoading && !error && rewrites && rewrites.length > 0 && (
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Suggested Tailored Rewrites ({rewrites.length})
              </span>

              <div className="space-y-4">
                {rewrites.map((rewrite, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-[#06090e]/90 border border-slate-800 hover:border-sky-500/40 rounded-2xl space-y-3 transition-all group shadow-md"
                  >
                    <p className="text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed">
                      {rewrite.text}
                    </p>

                    {rewrite.rationale && (
                      <div className="text-xs text-slate-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2">
                        <span className="text-sky-400 font-extrabold text-[10px] uppercase tracking-wider shrink-0 mt-0.5 font-heading">
                          Rationale:
                        </span>
                        <span>{rewrite.rationale}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => handleCopyOption(rewrite.text, idx)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                        title="Copy rewrite text"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => onSelectRewrite(rewrite.text)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 min-h-[40px] font-heading glow-cyan"
                      >
                        <Check className="w-4 h-4" />
                        Use this version
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#06090e]/95 border-t border-slate-800 flex justify-end shrink-0 sm:hidden">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulletRewriteModal;
