import { Sparkles, X, Check, RotateCw, AlertCircle, Wand2 } from 'lucide-react';

function BulletRewriteModal({
  originalText,
  rewrites,
  isLoading,
  error,
  onSelectRewrite,
  onRetry,
  onClose,
}) {
  if (!originalText) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 max-h-[85vh] flex flex-col backdrop-blur-md"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0b0f17]/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">Bullet-Point Rewriter</h3>
              <p className="text-xs text-slate-400">Tailored action phrasing for impact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          {/* Original Card */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
              Original Bullet Line
            </span>
            <div className="p-4 bg-[#0b0f17] border border-slate-800 rounded-2xl text-slate-300 text-xs sm:text-sm font-mono leading-relaxed break-words">
              {originalText}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-8 sm:py-10 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-200 font-heading">
                Generating tailored bullet options...
              </p>
              <p className="text-xs text-slate-500">Creating metric-driven, 100% truthful phrasing</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-300 text-xs sm:text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
              <button
                onClick={onRetry}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors min-h-[44px] flex items-center justify-center gap-2 font-heading"
              >
                <RotateCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          )}

          {/* AI Rewrites List */}
          {!isLoading && !error && rewrites && rewrites.length > 0 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Suggested Tailored Rewrites ({rewrites.length})
              </span>

              <div className="space-y-4">
                {rewrites.map((rewrite, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 bg-[#0b0f17] border border-slate-800 hover:border-sky-500/40 rounded-2xl space-y-3 transition-all group shadow-sm"
                  >
                    <p className="text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed">
                      {rewrite.text}
                    </p>

                    {rewrite.rationale && (
                      <div className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2">
                        <span className="text-sky-400 font-bold text-[10px] uppercase tracking-wider shrink-0 mt-0.5 font-heading">
                          Rationale:
                        </span>
                        <span>{rewrite.rationale}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onSelectRewrite(rewrite.text)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 min-h-[44px] font-heading"
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

        {/* Mobile-friendly Footer dismiss */}
        <div className="p-3 bg-[#0b0f17]/90 border-t border-slate-800 flex justify-end shrink-0 sm:hidden">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulletRewriteModal;
