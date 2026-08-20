import { useState, useEffect } from 'react';

function ScanHistory({ token, apiUrl }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/scans/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch scan history');
        }

        setScans(data.history || []);
      } catch (err) {
        setError(err.message || 'Unable to load scan history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token, apiUrl]);

  const getScoreBadgeClass = (score) => {
    if (score === null || score === undefined) return 'bg-slate-800 text-slate-400 border-slate-700';
    if (score >= 75) return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
    if (score >= 50) return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
    return 'bg-rose-950/60 text-rose-300 border-rose-800/80';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
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
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {!loading && !error && scans.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4">
          No past scans found. Run your first resume scan above!
        </p>
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
