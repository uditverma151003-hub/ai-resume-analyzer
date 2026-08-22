import { useState, useEffect } from 'react';
import { History, RotateCw, FolderOpen, FileText, Search, Clock } from 'lucide-react';

function ScanHistory({ token, apiUrl, onSessionExpired }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (score >= 75) return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/90';
    if (score >= 50) return 'bg-amber-950/80 text-amber-300 border-amber-800/90';
    return 'bg-rose-950/80 text-rose-300 border-rose-800/90';
  };

  const filteredScans = scans.filter((scan) =>
    (scan.resume_filename || 'Resume').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl backdrop-blur-md animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-heading">Past Scan History</h3>
            <p className="text-xs text-slate-400 font-mono">
              {scans.length} {scans.length === 1 ? 'scan record' : 'scan records'} saved
            </p>
          </div>
        </div>

        {scans.length > 3 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename..."
              className="pl-8 pr-3 py-1.5 bg-[#06090e]/90 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all w-full sm:w-48 font-sans"
            />
          </div>
        )}
      </div>

      {loading && (
        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2.5">
          <span className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          Loading saved match history...
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-center justify-between gap-3 text-rose-300 text-xs font-medium">
          <span>{error}</span>
          <button
            onClick={fetchHistory}
            className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 font-heading"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && scans.length === 0 && (
        <div className="py-8 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl bg-[#06090e]/60 p-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <FolderOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-extrabold text-slate-200 font-heading">
            No past scans yet — upload a resume to begin
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Your match analysis history and score reports will be securely stored here after your first analysis.
          </p>
        </div>
      )}

      {!loading && !error && filteredScans.length > 0 && (
        <div className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto pr-1 font-sans">
          {filteredScans.map((scan) => (
            <div key={scan.id} className="py-3 flex items-center justify-between text-xs gap-3 hover:bg-slate-900/40 px-2 rounded-xl transition-colors">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-bold text-slate-200 truncate flex items-center gap-2 font-heading">
                  <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{scan.resume_filename || 'Resume'}</span>
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>
                    {scan.created_at ? new Date(scan.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Unknown date'}
                  </span>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full border text-xs font-extrabold shrink-0 font-mono shadow-sm ${getScoreBadgeClass(scan.overallScore)}`}>
                {scan.overallScore !== null ? `${scan.overallScore} / 100` : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScanHistory;
