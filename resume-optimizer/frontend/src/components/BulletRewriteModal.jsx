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
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-sm sm:text-base font-bold text-white">Bullet-Point Rewriter</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Original Card */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Original Line
            </span>
            <div className="p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs sm:text-sm font-mono leading-relaxed break-words">
              {originalText}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-8 sm:py-10 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-300">
                Rewriting bullet point tailored to role...
              </p>
              <p className="text-xs text-slate-500">Generating 2-3 tailored, truthful options</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
              <button
                onClick={onRetry}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center gap-2"
              >
                Try again
              </button>
            </div>
          )}

          {/* AI Rewrites List */}
          {!isLoading && !error && rewrites && rewrites.length > 0 && (
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                AI Suggested Tailored Rewrites ({rewrites.length})
              </span>

              <div className="space-y-4">
                {rewrites.map((rewrite, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl space-y-3 transition-all hover:bg-slate-950/80 group"
                  >
                    <p className="text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed">
                      {rewrite.text}
                    </p>

                    {rewrite.rationale && (
                      <div className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                        <span className="text-indigo-400 font-bold text-[10px] uppercase tracking-wider shrink-0 mt-0.5">Rationale:</span>
                        <span>{rewrite.rationale}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onSelectRewrite(rewrite.text)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95 min-h-[44px]"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
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
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex justify-end shrink-0 sm:hidden">
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

