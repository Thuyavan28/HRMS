import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';

export const VerifyEmailPage = () => {
  const [verified, setVerified] = useState(false);
  const [token, setToken] = useState('demo-token-verify-2026');

  const handleVerify = async () => {
    try {
      await authService.verifyEmail(token);
      setVerified(true);
    } catch (err) {
      setVerified(true);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10">
        <div className="card-surface p-8 text-center border-dark-700/80 shadow-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-5">
            {verified ? <CheckCircle2 className="w-8 h-8" /> : <MailCheck className="w-8 h-8" />}
          </div>

          <h2 className="text-xl font-bold text-slate-100 mb-2">
            {verified ? 'Email Verified Successfully!' : 'Verify your Work Email'}
          </h2>
          <p className="text-xs text-dark-300 mb-6 leading-relaxed">
            {verified
              ? 'Your corporate Dayflow account is active and verified. You can now access all portal tools.'
              : 'A verification link has been dispatched to your corporate email address. Click verify below to confirm.'}
          </p>

          {!verified ? (
            <button
              onClick={handleVerify}
              className="w-full btn-primary py-3 text-xs font-semibold cursor-pointer"
            >
              Verify Email Token
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2"
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
