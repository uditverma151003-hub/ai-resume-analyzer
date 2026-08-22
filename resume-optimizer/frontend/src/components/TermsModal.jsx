import { X, FileText } from 'lucide-react';

function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] backdrop-blur-xl animate-scale-up border-slate-700/80"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#06090e]/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-heading">Terms of Service</h3>
              <p className="text-xs text-slate-400">Clear and transparent usage terms</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close terms modal"
            className="text-slate-400 hover:text-white p-2 rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-300 leading-relaxed font-sans flex-1">
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 font-heading">
              1. Acceptable Use
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Resume Optimizer is designed to help job seekers compare their professional resume text against target job postings. You agree to use this tool strictly for legitimate career and application enhancement purposes.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 font-heading">
              2. AI-Assisted Output & User Responsibility
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              All match scores, keyword gap analyses, and bullet-point rewrites are generated using Artificial Intelligence (Google Gemini). These recommendations are intended as guidance. You remain 100% responsible for verifying the accuracy, truthfulness, and appropriateness of any edits before submitting them to prospective employers.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 font-heading">
              3. Service Limits & Fair Usage
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Free user accounts include 1 full resume match scan per calendar month. We reserve the right to limit automated or excessive requests to prevent service abuse.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 font-heading">
              4. Disclaimer of Warranties
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              This service is provided on an "as is" and "as available" basis. While we strive to optimize your ATS keyword alignment, we do not guarantee interview invites or job offers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#06090e]/95 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 font-heading"
          >
            Close & Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;
