function ParsedResult({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Parsed File: <span className="text-white font-mono">{result.filename}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Extracted character count: <span className="font-semibold text-indigo-400">{result.textLength.toLocaleString()}</span> chars
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Clear / Upload another
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Extracted Raw Text</span>
          <span>Read-only</span>
        </div>
        <textarea
          readOnly
          value={result.extractedText}
          rows={16}
          className="w-full p-4 bg-slate-900 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none resize-y min-h-[300px]"
        />
      </div>
    </div>
  );
}

export default ParsedResult;
