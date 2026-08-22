import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';

const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;
  return score;
};

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken]);

  const strength = getStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-teal-500'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token.trim()) {
      setError('Please provide your reset token or use the link received in your email.');
      return;
    }
    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (strength < 4) {
      setError('Password must be at least 8 characters with one uppercase letter, one number, and one special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), password })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'linear-gradient(135deg,#0A0F1A 0%,#0D1929 50%,#0A1628 100%)'}}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-dark-900 font-black text-sm">D</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Dayflow</span>
          </div>
          <p className="text-dark-400 text-xs">HUMAN RESOURCE MANAGEMENT</p>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 md:p-8">
            {!success ? (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-teal-500/15 rounded-xl flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6 text-teal-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">Set New Password</h1>
                  <p className="text-dark-400 text-sm">Choose a strong new password for your Dayflow account.</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-rose-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {!initialToken && (
                    <div>
                      <label className="text-xs font-semibold text-dark-300 mb-1.5 block">Reset Token / Key</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={token}
                          onChange={e => setToken(e.target.value)}
                          placeholder="Paste the reset token from your email"
                          className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-dark-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 font-mono transition-all"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-dark-300 mb-1.5 block">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 chars, uppercase, number, special"
                        className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-dark-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all"
                        disabled={loading}
                        required
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div className={`h-full ${strengthColor} rounded-full transition-all`} style={{width:`${strength * 25}%`}} />
                        </div>
                        <span className="text-xs text-dark-400">{strengthLabel}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-dark-300 mb-1.5 block">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all"
                        disabled={loading}
                        required
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-rose-400 mt-1">Passwords do not match</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-teal-400 mt-1">Passwords match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-dark-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer shadow-glow-teal-sm"
                  >
                    {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Resetting Password...</span></>) : <span>Reset Password</span>}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-16 h-16 bg-teal-500/15 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-8 h-8 text-teal-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Password Reset Successful!</h2>
                <p className="text-dark-400 text-sm">Your password has been updated in the database. Redirecting you to sign in...</p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 text-dark-900 font-bold text-xs"
                  >
                    Sign In Now &rarr;
                  </Link>
                </div>
              </div>
            )}
            <div className="mt-6 pt-5 border-t border-dark-700 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-teal-400 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

