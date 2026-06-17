import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Cpu, ChevronDown, ChevronUp, Copy, Download, Plus,
  CheckCircle2, AlertCircle, BookOpen, BarChart3, List, FileWarning, Link2, Star
} from 'lucide-react';
import { api } from '../utils/api';
import { ResearchReport } from '../types';

function ConfidenceMeter({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? '#00FF88' : pct >= 60 ? '#00D4FF' : '#FFBB33';
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1A2D4A" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${pct} 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div>
        <div className="text-white font-semibold text-sm">Confidence Score</div>
        <div className="text-slate-500 text-xs">
          {pct >= 80 ? 'High confidence — well-supported findings' :
           pct >= 60 ? 'Moderate confidence — verify key claims' :
           'Lower confidence — treat as preliminary'}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-0"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-cyan-400" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {open && <div className="mt-4 border-t border-brand-border pt-4">{children}</div>}
    </div>
  );
}

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    api.getReport(sessionId)
      .then(r => { setReport(r); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [sessionId]);

  const handleCopy = () => {
    if (!report) return;
    const text = [
      `OMNEXIS_RESEARCH_AGENT AI REPORT`,
      `Query: ${report.query}`,
      `Confidence: ${Math.round(report.confidence_score * 100)}%`,
      `\n## EXECUTIVE SUMMARY\n${report.executive_summary}`,
      `\n## KEY FINDINGS\n${report.key_findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}`,
      `\n## DETAILED ANALYSIS\n${Object.entries(report.detailed_analysis).map(([k, v]) => `### ${k}\n${v}`).join('\n\n')}`,
      `\n## LIMITATIONS\n${report.limitations.map(l => `- ${l}`).join('\n')}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPDF = () => {
    if (!sessionId) return;
    const url = api.getPdfUrl(sessionId);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnexis-research-agent-report-${sessionId.slice(0, 8)}.pdf`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading report…</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-bold mb-2">Report not found</h2>
          <p className="text-slate-500 text-sm mb-6">{error || 'The report may still be processing.'}</p>
          <button onClick={() => navigate('/research')} className="btn-primary">New Research</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark grid-bg">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-500/4 rounded-full blur-3xl" />
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
          <button onClick={handleCopy} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
            {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleDownloadPDF} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Download size={14} /> PDF
          </button>
          <button onClick={() => navigate('/research')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Plus size={14} /> New
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* Report header */}
        <div className="card mb-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-green-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Research Complete</div>
              <h1 className="text-white font-bold text-lg leading-tight">{report.query}</h1>
              <div className="text-xs text-slate-600 mt-1">
                {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {report.completed_at && ` · Generated in ${Math.round((new Date(report.completed_at).getTime() - new Date(report.created_at).getTime()) / 1000)}s`}
              </div>
            </div>
          </div>

          <div className="border-t border-brand-border pt-4">
            <ConfidenceMeter score={report.confidence_score} />
          </div>
        </div>

        {/* Executive Summary */}
        <Section title="Executive Summary" icon={BookOpen}>
          <p className="text-slate-300 text-sm leading-relaxed">{report.executive_summary}</p>
        </Section>

        {/* Key Findings */}
        <Section title="Key Findings" icon={Star}>
          <ul className="space-y-3">
            {report.key_findings.map((finding, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-xs font-mono text-cyan-500 mt-0.5 shrink-0 w-5">#{i + 1}</span>
                <span className="text-slate-300 text-sm leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Detailed Analysis */}
        <Section title="Detailed Analysis" icon={BarChart3}>
          <div className="space-y-5">
            {Object.entries(report.detailed_analysis).map(([sectionTitle, content]) => (
              <div key={sectionTitle}>
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                  {sectionTitle}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed pl-3">{content}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Limitations */}
        <Section title="Limitations & Caveats" icon={FileWarning} defaultOpen={false}>
          <ul className="space-y-2">
            {report.limitations.map((lim, i) => (
              <li key={i} className="flex gap-2 text-slate-400 text-sm">
                <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                {lim}
              </li>
            ))}
          </ul>
        </Section>

        {/* References */}
        <Section title="References & Sources" icon={Link2} defaultOpen={false}>
          <div className="space-y-2">
            {report.references.map((ref, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-brand-dark">
                <span className="text-xs font-mono text-slate-600 mt-0.5 w-5 shrink-0">[{i + 1}]</span>
                <div>
                  <div className="text-sm text-slate-300">{ref.title}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{ref.source} · {ref.type}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Bottom actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <button onClick={handleDownloadPDF} className="btn-primary flex items-center justify-center gap-2">
            <Download size={16} /> Download PDF
          </button>
          <button onClick={handleCopy} className="btn-ghost flex items-center justify-center gap-2">
            {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Report'}
          </button>
          <button onClick={() => navigate('/research')} className="btn-ghost flex items-center justify-center gap-2">
            <Plus size={16} /> New Research
          </button>
        </div>

        {/* NVIDIA attribution */}
        <div className="text-center mt-8 text-xs text-slate-700">
          Generated by Omnexis Research Agent · NVIDIA NIM · Llama 3.3 70B & Nemotron 70B
        </div>
      </div>
    </div>
  );
}
