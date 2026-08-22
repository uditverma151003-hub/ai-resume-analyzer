import { useState } from 'react';
import { FileCheck2, RotateCcw, Copy, Check, Eye } from 'lucide-react';

function ParsedResult({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    if (result.extractedText) {
      navigator.clipboard.writeText(result.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineCount = result.extractedText ? result.extractedText.split('\n').filter(Boolean).length : 0;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2.5 font-heading">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span>Parsed Resume: <span className="text-white font-mono">{result.filename}</span></span>
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Text length: <strong className="text-sky-400">{result.textLength.toLocaleString()}</strong> chars</span>
            <span>•</span>
            <span>Lines extracted: <strong className="text-emerald-400">{lineCount}</strong></span>
          </div>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 transition-all min-h-[44px] shrink-0 font-heading active:scale-95 shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          Clear / Upload Different File
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-[#06090e]/90 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-2 font-semibold">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            Extracted Plain Text Preview
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1 font-sans min-h-[28px]"
              title="Copy extracted text to clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 text-[10px] uppercase font-bold">Read-only</span>
          </div>
        </div>

        <textarea
          readOnly
          value={result.extractedText}
          rows={14}
          className="w-full p-5 bg-[#06090e]/90 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y min-h-[260px] border-none"
        />
      </div>
    </div>
  );
}

export default ParsedResult;
