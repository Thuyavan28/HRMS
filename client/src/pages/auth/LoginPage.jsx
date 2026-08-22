import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your work email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await login(email, password);

      if (res.success) {
        toast.success(`Welcome back, ${res.user.fullName}!`);
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate(res.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', {
            replace: true
          });
        }
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('Sign in failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 text-white shadow-glow-teal mb-4">
            <Briefcase className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Dayflow</h1>
          <p className="text-sm text-dark-300 mt-1.5">Every workday, perfectly aligned.</p>
        </div>

        {/* Auth Card */}
        <div className="card-surface p-8 backdrop-blur-xl border-dark-700/80 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-100">Welcome back</h2>
            <p className="text-xs text-dark-300 mt-1">Sign in to your Dayflow workspace account</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-dark-300">Password</label>
                <span className="text-[11px] text-teal-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-dark-700">
            <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" /> One-Click Demo Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('alex.morgan@dayflow.com', 'Employee@1234')}
                className="px-3 py-2 text-left rounded-lg bg-dark-850 hover:bg-dark-750 border border-dark-700 hover:border-teal-500/50 transition-all text-xs cursor-pointer group"
              >
                <span className="font-semibold text-slate-200 block group-hover:text-teal-400">
                  Alex Morgan
                </span>
                <span className="text-[10px] text-dark-400">Employee Role</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@dayflow.com', 'Admin@1234')}
                className="px-3 py-2 text-left rounded-lg bg-dark-850 hover:bg-dark-750 border border-dark-700 hover:border-teal-500/50 transition-all text-xs cursor-pointer group"
              >
                <span className="font-semibold text-slate-200 block group-hover:text-teal-400">
                  Eleanor Vance
                </span>
                <span className="text-[10px] text-dark-400">HR Admin Role</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-dark-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-semibold">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
