import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Shield, BarChart3, Brain, ChevronRight, Cpu, Globe, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const EXAMPLE_QUERIES = [
  "Impact of renewable energy adoption in India",
  "Quantum computing applications in drug discovery",
  "AI regulation landscape across G20 nations",
  "Global supply chain vulnerabilities post-COVID",
  "Mental health crisis in Gen Z: causes and interventions",
  "Semiconductor shortage: geopolitical implications",
];

const AGENTS = [
  { name: "Planner", model: "Llama 3.3 70B", icon: Brain, color: "text-violet-400", desc: "Breaks research into strategic subtasks" },
  { name: "Query Generator", model: "Nemotron 70B", icon: Search, color: "text-cyan-400", desc: "Optimizes search queries for maximum coverage" },
  { name: "Research Analyst", model: "Llama 3.3 70B", icon: BarChart3, color: "text-blue-400", desc: "Extracts insights from multiple sources" },
  { name: "Fact Verifier", model: "Nemotron 70B", icon: Shield, color: "text-green-400", desc: "Cross-validates evidence and assigns confidence" },
  { name: "Report Writer", model: "Llama 3.3 70B", icon: FileText, color: "text-amber-400", desc: "Synthesizes findings into professional reports" },
  { name: "Reviewer", model: "Nemotron 70B", icon: Sparkles, color: "text-pink-400", desc: "Refines clarity and verifies completeness" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [exampleIdx, setExampleIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect for placeholder
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const target = EXAMPLE_QUERIES[exampleIdx];

    if (isTyping) {
      if (displayText.length < target.length) {
        timeout = setTimeout(() => setDisplayText(target.slice(0, displayText.length + 1)), 50);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 30);
      } else {
        setExampleIdx((i) => (i + 1) % EXAMPLE_QUERIES.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, exampleIdx]);

  const handleStart = () => {
    if (!query.trim()) return;
    if (user) {
      navigate('/research', { state: { query } });
    } else {
      navigate('/login', { state: { redirect: '/research', query } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleStart();
  };

  const handleExampleClick = (q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-brand-dark grid-bg overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/3 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-brand-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Omnexis Research Agent <span className="text-gradient-blue">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button onClick={() => navigate('/history')} className="btn-ghost text-sm py-2 px-4 hidden sm:block">History</button>
              <button onClick={() => navigate('/research')} className="btn-primary text-sm py-2 px-4">
                New Research
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-ghost text-sm py-2 px-4">Sign In</button>
              <button onClick={() => navigate('/register')} className="btn-primary text-sm py-2 px-4">Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-card border border-brand-border rounded-full px-4 py-1.5 mb-8">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">Powered by NVIDIA NIM · 6 Specialized AI Agents</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 max-w-4xl">
          Professional Research<br />
          <span className="text-gradient-blue">Powered by Multi-Agent</span><br />
          <span className="text-gradient-green">NVIDIA AI</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10">
          Ask any complex research question. Six specialized AI agents collaborate in real-time
          to deliver publication-quality reports with verified facts and citations.
        </p>

        {/* Search bar */}
        <div className="w-full max-w-2xl">
          <div className="relative glass rounded-2xl p-1 glow-blue">
            <div className="flex items-center gap-3">
              <div className="pl-4">
                <Search size={20} className="text-slate-500" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={displayText + (isTyping ? '|' : '')}
                className="flex-1 bg-transparent py-4 pr-2 text-white placeholder-slate-500 focus:outline-none text-base md:text-lg"
              />
              <button
                onClick={handleStart}
                disabled={!query.trim()}
                className="btn-primary rounded-xl m-1 whitespace-nowrap flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:block">Start Research</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Example queries */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-slate-600 self-center">Try:</span>
            {EXAMPLE_QUERIES.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => handleExampleClick(q)}
                className="text-xs bg-brand-card border border-brand-border rounded-full px-3 py-1 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
              >
                {q.slice(0, 35)}{q.length > 35 ? '…' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-6 md:gap-12">
          {[
            { value: '6', label: 'AI Agents' },
            { value: '100%', label: 'Free' },
            { value: 'NVIDIA', label: 'NIM Powered' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gradient-blue">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Research Pipeline</h2>
          <p className="text-slate-500">Six specialized agents working in sequence to ensure accuracy</p>
        </div>

        {/* Pipeline visualization */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AGENTS.map((agent, i) => (
            <div key={agent.name} className="card group hover:border-cyan-500/30 transition-all duration-300">
              <div className="flex items-start gap-3 mb-3">
                <div className={`text-xs font-mono ${agent.color} opacity-50 mt-0.5`}>0{i + 1}</div>
                <agent.icon size={20} className={agent.color} />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{agent.name}</h3>
              <p className="text-slate-500 text-xs mb-2">{agent.desc}</p>
              <div className="text-xs font-mono text-slate-600 bg-brand-dark rounded px-2 py-0.5 inline-block">
                {agent.model}
              </div>
            </div>
          ))}
        </div>

        {/* Arrow flow (desktop) */}
        <div className="hidden md:flex items-center justify-center mt-6 text-slate-700 gap-2 text-sm">
          {['Query', 'Plan', 'Generate', 'Analyze', 'Verify', 'Write', 'Review', 'Report'].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className={i === 0 || i === 7 ? 'text-cyan-500 font-medium' : ''}>{s}</span>
              {i < 7 && <ChevronRight size={14} />}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 py-16 border-t border-brand-border/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Fact-Verified Results',
              desc: 'Every finding is cross-checked by a dedicated verification agent with confidence scoring.',
              color: 'text-green-400',
            },
            {
              icon: Zap,
              title: 'Real-Time Progress',
              desc: 'Watch each agent work live with detailed progress tracking and stage updates.',
              color: 'text-cyan-400',
            },
            {
              icon: Globe,
              title: 'Export & Share',
              desc: 'Download professional PDF reports or copy findings for immediate use.',
              color: 'text-violet-400',
            },
          ].map(f => (
            <div key={f.title} className="card text-center">
              <f.icon size={28} className={`${f.color} mx-auto mb-4`} />
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="relative z-10 px-4 py-20 text-center">
          <div className="max-w-xl mx-auto card glow-blue">
            <h2 className="text-2xl font-bold text-white mb-3">Start researching for free</h2>
            <p className="text-slate-500 mb-6 text-sm">No credit card required. Unlimited research powered by NVIDIA AI.</p>
            <button onClick={() => navigate('/register')} className="btn-primary w-full sm:w-auto">
              Create Free Account
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-brand-border/50 px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Cpu size={14} className="text-cyan-500" />
          <span className="text-sm font-semibold text-white">Omnexis Research Agent</span>
        </div>
        <p className="text-xs text-slate-600">Powered by NVIDIA NIM · Llama 3.3 70B · Nemotron 70B · Free MVP</p>
      </footer>
    </div>
  );
}
