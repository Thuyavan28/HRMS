import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      const msg = 'Please enter your work email address.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!password) {
      const msg = 'Please enter your password.';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login({ email: email.trim(), password });
      if (res.success && res.data) {
        toast.success(`Welcome back, ${res.data.user.fullName}!`);
        const targetRoute = res.data.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        navigate(targetRoute, { replace: true });
      } else {
        const msg = res.message || 'Authentication failed. Please verify your credentials.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Invalid email or password. Please verify your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      setLoading(true);
      setError('');
      const res = await login({ email: demoEmail, password: demoPassword });
      if (res.success && res.data) {
        toast.success(`Signed in as ${res.data.user.fullName} (${res.data.user.role.toUpperCase()})`);
        const targetRoute = res.data.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        navigate(targetRoute, { replace: true });
      } else {
        const msg = res.message || 'Demo login failed.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Demo login failed. Please check credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500 text-white shadow-glow-teal mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Dayflow HRMS</h1>
          <p className="text-xs text-dark-300 mt-1">Every workday, perfectly aligned.</p>
        </div>

        {/* Login Card */}
        <div className="card-surface p-8 backdrop-blur-xl border-dark-700/80 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-100">Sign In to Your Workspace</h2>
            <p className="text-xs text-dark-300 mt-1">
              Enter your corporate email and password to access your HR portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Work Email Address or Employee ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. user@email.com or EMP-001"
                  className="input-field pl-10 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-dark-300">Password</label>
                <span className="text-[11px] text-teal-400/80 hover:text-teal-300 cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••••••"
                  className="input-field pl-10 text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-glow-teal-sm"
            >
              <span>{loading ? 'Verifying in Database...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Invitation Onboarding Banner */}
          <div className="mt-6 pt-5 border-t border-dark-700">
            <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <div className="text-[11px]">
                  <span className="font-semibold text-slate-200 block">New team member?</span>
                  <span className="text-dark-400">Received an HR invitation link?</span>
                </div>
              </div>
              <Link
                to="/signup"
                className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-bold whitespace-nowrap"
              >
                Sign Up / Activate →
              </Link>
            </div>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-dark-700 space-y-2">
            <div className="flex items-center gap-1.5 text-dark-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Instant Demo Credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@dayflow.com', 'Admin@1234')}
                className="p-2 rounded-xl bg-dark-850 hover:bg-dark-750 border border-dark-700 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
                      Ananya Krishnan
                    </p>
                    <p className="text-[10px] text-dark-400 font-mono">HR Admin Role</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.morgan@dayflow.com', 'Employee@1234')}
                className="p-2 rounded-xl bg-dark-850 hover:bg-dark-750 border border-dark-700 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-teal-400">
                      Arjun Sharma
                    </p>
                    <p className="text-[10px] text-dark-400 font-mono">Employee Role</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
