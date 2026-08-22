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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState('');

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
      setLoadingStep('Connecting to database...');
      
      // Simulate step progression for visual feedback
      const stepTimer1 = setTimeout(() => setLoadingStep('Verifying credentials...'), 800);
      const stepTimer2 = setTimeout(() => setLoadingStep('Authenticating session...'), 2000);
      
      const res = await login({ email: email.trim(), password });
      
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      
      if (res.success && res.data) {
        setLoadingStep('Welcome! Redirecting to dashboard...');
        toast.success(`Welcome back, ${res.data.user.fullName}!`);
        // Brief delay to show success state
        await new Promise(r => setTimeout(r, 600));
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
      setLoadingStep('');
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      setLoading(true);
      setError('');
      setLoadingStep('Loading demo credentials...');
      const stepTimer = setTimeout(() => setLoadingStep('Authenticating demo session...'), 800);
      
      const res = await login({ email: demoEmail, password: demoPassword });
      clearTimeout(stepTimer);
      
      if (res.success && res.data) {
        setLoadingStep(`Signed in as ${res.data.user.fullName}!`);
        toast.success(`Signed in as ${res.data.user.fullName} (${res.data.user.role.toUpperCase()})`);
        await new Promise(r => setTimeout(r, 600));
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
      setLoadingStep('');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-dark-900 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(13, 17, 23, 0.8), rgba(13, 17, 23, 0.95)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')`
      }}
    >
      {/* Full-Screen Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-sm auth-loader-overlay">
          <div className="relative flex items-center justify-center mb-6">
            <div className="auth-loader-ring" />
            <div className="auth-loader-spinner" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-200 mb-1.5">{loadingStep || 'Authenticating...'}</p>
            <div className="flex items-center justify-center gap-1 text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 auth-dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 auth-dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 auth-dot-3" />
            </div>
            <p className="text-[10px] text-dark-400 mt-3">Securely verifying with Neon PostgreSQL</p>
          </div>
        </div>
      )}

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

        </div>
      </div>
    </div>
  );
};
