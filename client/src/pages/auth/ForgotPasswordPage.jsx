import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your work email address.'); return; }
    setLoading(true);
    try {
      const data = await authService.forgotPassword(email.trim());
      if (data.success) {
        setSuccess(true);
        if (data.token) setResetToken(data.token);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Network error. Please check your connection and try again.');
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
                  <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
                  <p className="text-dark-400 text-sm">Enter the email address linked to your Dayflow account and we will send a reset link.</p>
                </div>
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-dark-300 mb-1.5 block">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.name@company.com" className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all" disabled={loading} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-400 text-dark-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer shadow-glow-teal-sm">
                    {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Sending Reset Link...</span></>) : <span>Send Reset Link</span>}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-teal-500/15 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-8 h-8 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Reset Link Generated!</h2>
                  <p className="text-dark-400 text-sm leading-relaxed">
                    A password reset link has been dispatched to <strong className="text-teal-400">{email}</strong>.
                  </p>
                </div>

                {resetToken && (
                  <div className="pt-2">
                    <Link
                      to={`/reset-password?token=${resetToken}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-dark-900 font-bold text-sm transition-all shadow-glow-teal-sm"
                    >
                      <span>Proceed to Set New Password</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                )}

                <p className="text-dark-500 text-xs pt-1">You can also check your email inbox to open the reset link.</p>
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
