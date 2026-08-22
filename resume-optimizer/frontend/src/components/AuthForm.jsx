import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function AuthForm({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (!supabase) {
      setError('Supabase client is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data?.user && data?.session) {
          setMessage('Account created successfully! Logging you in...');
          if (onAuthSuccess) onAuthSuccess(data.session);
        } else if (data?.user) {
          setMessage('Account created! Please check your email to confirm registration or sign in.');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data?.session) {
          if (onAuthSuccess) onAuthSuccess(data.session);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
      {/* Background Accent Pill */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-1.5 bg-[#06090e]/80 border border-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setError(null);
            setMessage(null);
          }}
          className={`py-2 text-xs font-bold rounded-xl transition-all font-heading flex items-center justify-center gap-1.5 ${
            !isSignUp
              ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setError(null);
            setMessage(null);
          }}
          className={`py-2 text-xs font-bold rounded-xl transition-all font-heading flex items-center justify-center gap-1.5 ${
            isSignUp
              ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>
      </div>

      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
          {isSignUp ? 'Start Optimizing Today' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-slate-400">
          {isSignUp
            ? 'Create a free account to analyze your resume and rewrite bullet points.'
            : 'Access your saved scans, keyword analysis, and bullet rewriter.'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-200 text-xs font-medium flex items-center gap-2.5 animate-scale-up">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-200 text-xs font-medium flex items-center gap-2.5 animate-scale-up">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-heading">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-3 bg-[#06090e]/90 border border-slate-800 focus:border-sky-500 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-sans"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-heading">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-3 bg-[#06090e]/90 border border-slate-800 focus:border-sky-500 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-all shadow-lg hover:shadow-sky-500/25 active:scale-[0.99] flex items-center justify-center gap-2 min-h-[48px] font-heading glow-cyan"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
            </>
          ) : (
            <>
              <span>{isSignUp ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>1 Free monthly scan included. No credit card required.</span>
      </div>
    </div>
  );
}

export default AuthForm;
