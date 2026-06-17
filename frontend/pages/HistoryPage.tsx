import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, Search, Trash2, ExternalLink, Clock, CheckCircle2,
  XCircle, Loader2, FileText, AlertCircle, RotateCcw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { HistoryItem } from '../types';

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') return (
    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
      <CheckCircle2 size={10} /> Done
    </span>
  );
  if (status === 'running') return (
    <span className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-400/10 rounded-full px-2 py-0.5">
      <Loader2 size={10} className="animate-spin" /> Running
    </span>
  );
  if (status === 'failed') return (
    <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 rounded-full px-2 py-0.5">
      <XCircle size={10} /> Failed
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-500/10 rounded-full px-2 py-0.5">
      <Clock size={10} /> Pending
    </span>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const LIMIT = 15;

  const load = async (q = search, p = page) => {
    setLoading(true);
    try {
      const res = await api.getHistory(q, LIMIT, p * LIMIT);
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    load(search, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this research session?')) return;
    setDeleting(id);
    try {
      await api.deleteSession(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setTotal(t => t - 1);
    } catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  const handleView = (item: HistoryItem) => {
    if (item.status === 'completed') navigate(`/report/${item.id}`);
    else if (item.status === 'running') navigate(`/research`);
  };

  return (
    <div className="min-h-screen bg-brand-dark grid-bg">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-600/4 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-brand-border/50 bg-brand-dark/90 backdrop-blur-sm">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Cpu size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Omnexis Research Agent</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/research')} className="btn-primary text-xs py-1.5 px-3">New Research</button>
          <button onClick={logout} className="btn-ghost text-xs py-1.5 px-3 text-slate-500">Sign out</button>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Research History</h1>
          <p className="text-slate-500 text-sm">{total} research session{total !== 1 ? 's' : ''} · {user?.name}</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search research topics…"
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
          <button type="submit" className="btn-ghost py-2.5 px-4 text-sm">Search</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); load('', 0); }} className="btn-ghost py-2.5 px-3 text-slate-500">
              <RotateCcw size={14} />
            </button>
          )}
        </form>

        {/* List */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 size={32} className="text-cyan-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading history…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 card">
            <FileText size={40} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No research yet</h3>
            <p className="text-slate-600 text-sm mb-5">
              {search ? 'No results matching your search.' : 'Start your first research session to see it here.'}
            </p>
            <button onClick={() => navigate('/research')} className="btn-primary text-sm">
              Start Research
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="card group hover:border-cyan-500/20 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <StatusBadge status={item.status} />
                      {item.confidence_score != null && item.status === 'completed' && (
                        <span className="text-xs text-slate-600 bg-brand-dark rounded-full px-2 py-0.5">
                          {Math.round(item.confidence_score * 100)}% confidence
                        </span>
                      )}
                    </div>

                    <h3 className="text-white text-sm font-medium leading-snug mb-1 pr-2">
                      {item.query}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {item.completed_at && (
                        <span>
                          {Math.round((new Date(item.completed_at).getTime() - new Date(item.created_at).getTime()) / 1000)}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'completed' && (
                      <button
                        onClick={() => handleView(item)}
                        className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        title="View report"
                      >
                        <ExternalLink size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                      title="Delete"
                    >
                      {deleting === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                {/* Running progress */}
                {item.status === 'running' && (
                  <div className="mt-3 h-1 bg-brand-dark rounded-full overflow-hidden">
                    <div
                      className="h-full progress-shimmer rounded-full"
                      style={{ width: `${item.progress || 10}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => { const p = page - 1; setPage(p); load(search, p); }}
              disabled={page === 0}
              className="btn-ghost text-sm py-2 px-4 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600">
              {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
            </span>
            <button
              onClick={() => { const p = page + 1; setPage(p); load(search, p); }}
              disabled={(page + 1) * LIMIT >= total}
              className="btn-ghost text-sm py-2 px-4 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
