import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Cpu, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { redirect?: string; query?: string } | null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(name.trim(), email, password);
      } else {
        await login(email, password);
      }
      const redirect = state?.redirect || '/research';
      navigate(redirect, { state: state?.query ? { query: state.query } : undefined });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark grid-bg flex flex-col items-center justify-center px-4">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Cpu size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">Omnexis Research Agent <span className="text-gradient-blue">AI</span></span>
        </div>

        <div className="card glow-blue">
          <h1 className="text-xl font-bold text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {mode === 'login' ? 'Sign in to access your research' : 'Start researching for free — no credit card needed'}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Prathamesh Joshi"
                  className="input-field"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <Link to="/register" state={state} className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign up free</Link>
              </>
            ) : (
              <>Already have an account?{' '}
                <Link to="/login" state={state} className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign in</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() { return <AuthForm mode="login" />; }
export function RegisterPage() { return <AuthForm mode="register" />; }
