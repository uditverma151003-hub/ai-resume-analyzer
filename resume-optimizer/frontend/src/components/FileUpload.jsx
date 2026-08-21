import { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, RotateCw, Clock } from 'lucide-react';

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
      setValidationError('Invalid file type. Only PDF (.pdf) and Word (.docx) files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size exceeds 5MB limit. Please upload a smaller file.');
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
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-sky-400 bg-sky-950/30 scale-[1.01]'
            : displayError
            ? 'border-rose-500/60 bg-rose-950/20'
            : 'border-slate-800 bg-slate-900/60 hover:border-sky-500/40 hover:bg-slate-900/90'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
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
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="w-12 h-12 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
            <div className="text-slate-300 font-medium text-sm sm:text-base px-2">
              Parsing <span className="font-semibold text-white font-mono">{selectedFile?.name}</span>...
            </div>
            <p className="text-xs text-slate-500">Extracting raw document text...</p>

            {isSlow && (
              <div className="mt-3 p-3 bg-amber-950/50 border border-amber-800/60 rounded-xl text-amber-200 text-xs max-w-md animate-fade-in flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>This is taking a bit longer than usual — server waking up from idle</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-md">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-bold text-white font-heading">
                Drop your resume file here, or <span className="text-sky-400 underline underline-offset-4">browse</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports PDF (.pdf) and Word (.docx) files up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200 text-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-rose-300 font-heading">Upload Failed</span>
              <span className="text-xs">{displayError}</span>
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="self-end sm:self-center px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 min-h-[36px]"
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
