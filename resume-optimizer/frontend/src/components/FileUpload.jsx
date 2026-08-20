import { useState, useRef } from 'react';

function FileUpload({ onFileSelect, isLoading, error }) {
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

  const displayError = validationError || error;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
            : displayError
            ? 'border-rose-500/60 bg-rose-950/20'
            : 'border-slate-700 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-slate-900'
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
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <div className="text-slate-300 font-medium">
              Parsing <span className="font-semibold text-white">{selectedFile?.name}</span>...
            </div>
            <p className="text-xs text-slate-500">Extracting raw text from resume</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div>
              <p className="text-base font-semibold text-white">
                Drop your resume here, or <span className="text-indigo-400 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF (.pdf) and Word (.docx) files up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="mt-4 p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-3 text-rose-200 text-sm animate-fade-in">
          <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <span className="font-semibold block text-rose-300">Upload Failed</span>
            {displayError}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
