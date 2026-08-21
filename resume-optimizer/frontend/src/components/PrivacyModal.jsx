import { X, ShieldCheck, Database, Lock } from 'lucide-react';

function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">Privacy Policy</h3>
              <p className="text-xs text-slate-400">How we handle and protect your data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-300 leading-relaxed font-sans flex-1">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
              1. Information We Collect
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              We collect your account email address (for authentication and scan limits), raw text extracted from uploaded resume documents, and job description texts you submit for analysis.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
              2. How Your Data Is Processed (Google Gemini API)
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              To calculate ATS match scores and generate bullet rewrites, resume and job description text is securely transmitted to Google’s Gemini API. Your content is processed strictly in accordance with Google's API Privacy Terms and is not sold or shared with advertisers.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
              3. Data Storage & Security
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Account data and past scan history are securely stored in Supabase with row-level security (RLS), ensuring only you can access your scan history.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
              4. Data Deletion Requests
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              You own your data. To request full deletion of your account and scan history, simply contact us at <span className="text-sky-400 font-medium">privacy@resumeoptimizer.app</span> and we will process your deletion promptly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyModal;
