import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Brain, Globe, BarChart3, Shield, FileText, Sparkles, CheckCircle2, Loader2, XCircle, Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

const STAGES = [
  { key: 'planning', label: 'Planning Research', icon: Brain, color: 'text-violet-400', desc: 'Planner Agent breaking down your query into subtasks…' },
  { key: 'querying', label: 'Generating Queries', icon: Globe, color: 'text-cyan-400', desc: 'Query Generator creating optimized search strategies…' },
  { key: 'analyzing', label: 'Analyzing Sources', icon: BarChart3, color: 'text-blue-400', desc: 'Research Analyst extracting key insights and patterns…' },
  { key: 'verifying', label: 'Verifying Findings', icon: Shield, color: 'text-green-400', desc: 'Fact Verification Agent cross-checking evidence…' },
  { key: 'writing', label: 'Writing Report', icon: FileText, color: 'text-amber-400', desc: 'Report Writer synthesizing findings into structured report…' },
  { key: 'reviewing', label: 'Reviewing Results', icon: Sparkles, color: 'text-pink-400', desc: 'Reviewer Agent refining clarity and completeness…' },
];

type StageStatus = 'pending' | 'active' | 'done' | 'error';

export default function ResearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { query?: string } | null;
  const { user } = useAuth();

  const [query, setQuery] = useState(state?.query || '');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>('planning');
  const [stageStatuses, setStageStatuses] = useState<Record<string, StageStatus>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-start if query passed from landing
  useEffect(() => {
    if (state?.query && !isRunning && !sessionId) {
      setTimeout(() => handleStart(state.query!), 300);
    }
  }, []);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleStart = async (q?: string) => {
    const resQuery = q || query;
    if (!resQuery.trim()) return;
    setQuery(resQuery);
    setError('');
    setIsRunning(true);
    setDone(false);
    setProgress(0);
    setCurrentStage('planning');
    setStageStatuses({ planning: 'active' });

    try {
      const res = await api.startResearch(resQuery);
      const sid = res.session_id;
      setSessionId(sid);

      // Poll for progress
      pollingRef.current = setInterval(async () => {
        try {
          const status = await api.getStatus(sid);
          setProgress(status.progress || 0);
          const stage = status.current_stage;
          setCurrentStage(stage);

          // Update stage statuses
          const stageKeys = STAGES.map(s => s.key);
          const currentIdx = stageKeys.indexOf(stage);
          const newStatuses: Record<string, StageStatus> = {};
          stageKeys.forEach((k, i) => {
            if (i < currentIdx) newStatuses[k] = 'done';
            else if (i === currentIdx) newStatuses[k] = status.status === 'failed' ? 'error' : 'active';
            else newStatuses[k] = 'pending';
          });
          setStageStatuses(newStatuses);

          if (status.status === 'completed') {
            setProgress(100);
            STAGES.forEach(s => { newStatuses[s.key] = 'done'; });
            setStageStatuses(newStatuses);
            setDone(true);
            setIsRunning(false);
            if (pollingRef.current) clearInterval(pollingRef.current);
            setTimeout(() => navigate(`/report/${sid}`), 800);
          } else if (status.status === 'failed') {
            setError('Research pipeline failed. Please try again.');
            setIsRunning(false);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'Failed to start research');
      setIsRunning(false);
    }
  };

  const activeStage = STAGES.find(s => s.key === currentStage);

  return (
    <div className="min-h-screen bg-brand-dark grid-bg">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-brand-border/50">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Cpu size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-base">Omnexis Research Agent <span className="text-gradient-blue">AI</span></span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm hidden sm:block">{user?.name}</span>
          <button onClick={() => navigate('/history')} className="btn-ghost text-sm py-2 px-3">History</button>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Deep Research Engine</h1>
          <p className="text-slate-500 text-sm">6 NVIDIA AI agents collaborate to generate your research report</p>
        </div>

        {/* Query input (only when not running) */}
        {!isRunning && !done && (
          <div className="card mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">Research Query</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  placeholder="e.g. Impact of AI on healthcare in developing countries"
                  className="input-field pl-9"
                />
              </div>
              <button
                onClick={() => handleStart()}
                disabled={!query.trim()}
                className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-40"
              >
                Research <ArrowRight size={16} />
              </button>
            </div>
            {error && (
              <div className="mt-3 text-red-400 text-sm flex items-center gap-2">
                <XCircle size={14} /> {error}
              </div>
            )}
          </div>
        )}

        {/* Research running */}
        {(isRunning || done) && (
          <>
            {/* Query display */}
            <div className="card mb-4">
              <div className="flex items-start gap-3">
                <Search size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Research Query</div>
                  <div className="text-white font-medium">{query}</div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="card mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">
                  {done ? 'Research Complete!' : `${activeStage?.label || 'Processing'}…`}
                </span>
                <span className="text-sm font-mono text-cyan-400">{progress}%</span>
              </div>
              <div className="h-2 bg-brand-dark rounded-full overflow-hidden">
                <div
                  className="h-full progress-shimmer rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {activeStage && !done && (
                <p className="text-xs text-slate-600 mt-2">{activeStage.desc}</p>
              )}
              {done && (
                <p className="text-xs text-green-400 mt-2">All agents completed · Redirecting to report…</p>
              )}
            </div>

            {/* Agent stages */}
            <div className="card">
              <div className="text-sm font-medium text-slate-400 mb-4">Agent Pipeline</div>
              <div className="space-y-3">
                {STAGES.map((stage, i) => {
                  const status = stageStatuses[stage.key] || 'pending';
                  return (
                    <div key={stage.key} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      status === 'active' ? 'bg-brand-dark border border-cyan-500/30' :
                      status === 'done' ? 'bg-brand-dark/50' : ''
                    }`}>
                      {/* Status icon */}
                      <div className="shrink-0">
                        {status === 'done' && <CheckCircle2 size={18} className="text-green-400" />}
                        {status === 'active' && <Loader2 size={18} className="text-cyan-400 animate-spin" />}
                        {status === 'error' && <XCircle size={18} className="text-red-400" />}
                        {status === 'pending' && (
                          <div className="w-[18px] h-[18px] rounded-full border border-slate-700 flex items-center justify-center">
                            <span className="text-slate-700 text-xs font-mono">{i + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* Stage info */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${
                          status === 'done' ? 'text-slate-400' :
                          status === 'active' ? 'text-white' :
                          'text-slate-600'
                        }`}>
                          {stage.label}
                        </div>
                        {status === 'active' && (
                          <div className="text-xs text-slate-500 mt-0.5">{stage.desc}</div>
                        )}
                      </div>

                      {/* Icon */}
                      <stage.icon size={16} className={`shrink-0 ${
                        status === 'pending' ? 'text-slate-700' :
                        status === 'done' ? 'text-slate-600' :
                        stage.color
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Start state empty */}
        {!isRunning && !done && !query && (
          <div className="text-center mt-8 text-slate-600">
            <Brain size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter a research topic above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
