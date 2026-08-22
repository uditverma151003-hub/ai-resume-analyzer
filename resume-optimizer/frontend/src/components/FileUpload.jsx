import { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, RotateCw, Clock, FileType, CheckCircle2 } from 'lucide-react';

function FileUpload({ onFileSelect, isLoading, isSlow, error }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setValidationError(null);
    if (!file) return;

    const allowedExtensions = ['.pdf', '.docx'];
    const fileName = file.name.toLowerCase();
    const isAllowedExt = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowedExt) {
      setValidationError('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size exceeds 5MB limit. Please upload a smaller document.');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    if (selectedFile) {
      onFileSelect(selectedFile);
    } else {
      fileInputRef.current?.click();
    }
  };

  const displayError = validationError || error;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative glass-panel rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-sky-400 bg-sky-950/40 scale-[1.01] shadow-2xl glow-cyan'
            : displayError
            ? 'border-rose-500/60 bg-rose-950/20'
            : 'hover:border-sky-500/50 hover:bg-slate-900/90'
        } ${isLoading ? 'pointer-events-none opacity-85' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          id="resume-file-input"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-5">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
              <FileText className="w-6 h-6 text-sky-400 absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <div className="text-slate-200 font-bold text-base px-2 font-heading">
                Parsing <span className="text-white font-mono">{selectedFile?.name || 'Resume'}</span>...
              </div>
              <p className="text-xs text-slate-400">Extracting structure, sections, and bullet content...</p>
            </div>

            {isSlow && (
              <div className="mt-2 p-3.5 bg-amber-950/60 border border-amber-800/80 rounded-2xl text-amber-200 text-xs max-w-md animate-scale-up flex items-center gap-2.5 shadow-lg">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Server is waking up from idle state — please hang tight for a few seconds</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl group-hover:scale-105 transition-transform">
              <UploadCloud className="w-10 h-10 animate-float-slow" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-heading">
                Upload your Resume
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Drag and drop your file here, or <span className="text-sky-400 font-bold underline underline-offset-4">browse files</span>
              </p>
            </div>

            {/* Supported file formats pill tags */}
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 font-mono">
                <FileType className="w-3.5 h-3.5 text-rose-400" />
                PDF (.pdf)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 font-mono">
                <FileType className="w-3.5 h-3.5 text-sky-400" />
                DOCX (.docx)
              </span>
              <span className="text-slate-500 text-xs">• Max 5MB</span>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200 text-sm animate-scale-up shadow-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <span className="font-bold block text-rose-300 font-heading">Upload Failed</span>
              <span className="text-xs text-rose-200/90">{displayError}</span>
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="self-end sm:self-center px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 min-h-[36px] font-heading shadow-md active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
