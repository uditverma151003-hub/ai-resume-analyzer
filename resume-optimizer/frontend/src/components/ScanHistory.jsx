import { useState, useEffect } from 'react';

function ScanHistory({ token, apiUrl, onSessionExpired }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/scans/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        if (onSessionExpired) onSessionExpired();
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch scan history');
      }

      setScans(data.history || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to server to fetch scan history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, apiUrl]);

  const getScoreBadgeClass = (score) => {
    if (score === null || score === undefined) return 'bg-slate-800 text-slate-400 border-slate-700';
    if (score >= 75) return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
    if (score >= 50) return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
    return 'bg-rose-950/60 text-rose-300 border-rose-800/80';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Past Scan History
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {scans.length} {scans.length === 1 ? 'scan' : 'scans'} total
        </span>
      </div>

      {loading && (
        <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          Loading scan history...
        </div>
      )}

      {error && !loading && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center justify-between gap-3 text-rose-300 text-xs font-medium">
          <span>{error}</span>
          <button
            onClick={fetchHistory}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded text-xs font-semibold transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && scans.length === 0 && (
        <div className="py-8 text-center space-y-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 p-4">
          <div className="w-10 h-10 rounded-full bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-slate-300">
            No scans yet — upload a resume to get started
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Your match analysis history will be safely saved here after your first upload.
          </p>
        </div>
      )}

      {!loading && !error && scans.length > 0 && (
        <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto pr-1">
          {scans.map((scan) => (
            <div key={scan.id} className="py-3 flex items-center justify-between text-xs gap-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-semibold text-slate-200 truncate">
                  {scan.resume_filename || 'Resume'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {scan.created_at ? new Date(scan.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Unknown date'}
                </p>
              </div>

              <div className={`px-2.5 py-1 rounded-full border text-xs font-bold shrink-0 ${getScoreBadgeClass(scan.overallScore)}`}>
                {scan.overallScore !== null ? `${scan.overallScore}/100` : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScanHistory;

