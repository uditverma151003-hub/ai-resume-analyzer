import { FileCheck2, RotateCcw } from 'lucide-react';

function ParsedResult({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-2xl">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-200 flex items-center gap-2 font-heading">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            Parsed Resume: <span className="text-white font-mono">{result.filename}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Extracted text length: <span className="font-semibold text-sky-400 font-mono">{result.textLength.toLocaleString()}</span> chars
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors min-h-[44px] shrink-0 font-heading"
        >
          <RotateCcw className="w-4 h-4" />
          Clear / Change File
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="bg-[#0b0f17]/90 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Extracted Resume Plain Text</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] uppercase font-bold">Read-only preview</span>
        </div>
        <textarea
          readOnly
          value={result.extractedText}
          rows={16}
          className="w-full p-5 bg-slate-900 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y min-h-[300px]"
        />
      </div>
    </div>
  );
}

export default ParsedResult;

