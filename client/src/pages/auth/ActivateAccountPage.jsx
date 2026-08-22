import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Lock,
  Mail,
  User,
  BadgeCheck,
  ArrowRight,
  AlertCircle,
  Check,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Info
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

export const ActivateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const toast = useToast();

  const [token, setToken] = useState(tokenParam);
  const [invitationData, setInvitationData] = useState(null);
  const [validating, setValidating] = useState(!!tokenParam);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validate Invitation Token
  const checkToken = async (tok) => {
    if (!tok) {
      setInvitationData(null);
      setValidating(false);
      return;
    }

    try {
      setValidating(true);
      setTokenError('');
      const res = await authService.validateInvitation(tok);
      if (res.success && res.data) {
        setInvitationData(res.data);
      } else {
        setTokenError(res.message || 'Invalid or expired invitation token.');
        setInvitationData(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired invitation token.';
      setTokenError(msg);
      setInvitationData(null);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      checkToken(tokenParam);
    }
  }, [tokenParam]);

  // Dynamic Password Validation Criteria
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    const { hasMinLength, hasUppercase, hasNumber, hasSpecial } = passwordCriteria;
    return [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  }, [passwordCriteria]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    if (strengthScore < 4) {
      setSubmitError('Please satisfy all password security requirements.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');

      // Critical Security: Even if any client tries to send an altered role,
      // the backend strictly resolves the role from the trusted invitation database record.
      const res = await authService.activateAccount({
        token,
        password,
        confirmPassword
      });

      if (res.success && res.data) {
        toast.success(`Account activated! Welcome to Dayflow, ${res.data.user.fullName}`);
        await refreshUser();

        // Redirect based on authoritative role from backend response
        const targetRoute = res.data.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
        navigate(targetRoute, { replace: true });
      } else {
        setSubmitError(res.message || 'Account activation failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Activation failed. Please check your token or credentials.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualTokenSubmit = (e) => {
    e.preventDefault();
    if (token.trim()) {
      checkToken(token.trim());
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-4 py-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500 text-white shadow-glow-teal mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Dayflow HRMS</h1>
          <p className="text-xs text-dark-300 mt-1">Every workday, perfectly aligned.</p>
        </div>

        {/* Activation Card */}
        <div className="card-surface p-8 backdrop-blur-xl border-dark-700/80 shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Invitation-Based Onboarding</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">Activate Your Account</h2>
            <p className="text-xs text-dark-300 mt-1">
              Complete your profile setup using the secure HR invitation link
            </p>
          </div>

          {/* 1. Step: Enter Token manually if no valid invitation loaded */}
          {!invitationData && !validating && (
            <div className="space-y-4">
              {tokenError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{tokenError}</span>
                </div>
              )}

              <form onSubmit={handleManualTokenSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                    Invitation Activation Token
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your 64-char invitation token..."
                      className="input-field pl-10 font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Verify Invitation Token</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Demo Invitation Shortcut for quick testing */}
              <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 text-xs space-y-2">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-400" /> Sample Pending Invitation (Test Link):
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-dark-300 truncate">
                    Priya Sharma (Employee Role)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setToken('demo-invite-token-emp-2026');
                      checkToken('demo-invite-token-emp-2026');
                    }}
                    className="px-2.5 py-1 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-bold hover:bg-teal-500/25 cursor-pointer whitespace-nowrap"
                  >
                    Load Sample Invite
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Validating Loading State */}
          {validating && (
            <div className="py-8 space-y-3 text-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs font-semibold text-slate-200">
                Verifying cryptographic invitation token...
              </p>
              <p className="text-[11px] text-dark-400">
                Retrieving trusted employee record and authoritative role from HR database
              </p>
            </div>
          )}

          {/* 2. Step: Active Setup Form with READ-ONLY Trusted Metadata */}
          {invitationData && !validating && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Pre-filled Trusted Metadata (Strictly Read-Only) */}
              <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-dark-750">
                  <span className="text-[11px] text-dark-400 uppercase font-semibold">
                    Verified Invitation Identity
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Token Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-dark-400 text-[10px] uppercase block">Employee Name</span>
                    <span className="font-bold text-slate-100">{invitationData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-dark-400 text-[10px] uppercase block">Employee ID</span>
                    <span className="font-mono font-bold text-teal-300">{invitationData.employeeId}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-dark-400 text-[10px] uppercase block">Registered Work Email</span>
                    <span className="font-mono text-slate-200 text-xs">{invitationData.email}</span>
                  </div>
                </div>

                {/* STRICT READ-ONLY ROLE BADGE */}
                <div className="pt-2 border-t border-dark-750 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-dark-400 uppercase font-semibold block">
                      Assigned Account Role
                    </span>
                    <span className="text-[10px] text-dark-400">
                      Authoritatively assigned by {invitationData.createdBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-750 border border-dark-600 text-teal-300 text-xs font-extrabold uppercase tracking-wide">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{invitationData.role}</span>
                  </div>
                </div>
              </div>

              {/* Password Creation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                    Create Password
                  </label>
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

                <div>
                  <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="p-3 rounded-xl bg-dark-850 border border-dark-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-dark-300">Password Strength:</span>
                    <span
                      className={`font-semibold ${
                        strengthScore === 4
                          ? 'text-emerald-400'
                          : strengthScore >= 2
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {strengthScore === 4 ? 'Strong' : strengthScore >= 2 ? 'Medium' : 'Weak'}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 1 ? (strengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-dark-700'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 2 ? (strengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-dark-700'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 3 ? (strengthScore === 4 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-dark-700'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore === 4 ? 'bg-emerald-400' : 'bg-dark-700'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasMinLength ? 'text-emerald-400' : 'text-dark-400'}`}>
                      <Check className="w-3 h-3" /> Min 8 characters
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasUppercase ? 'text-emerald-400' : 'text-dark-400'}`}>
                      <Check className="w-3 h-3" /> 1 uppercase letter
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-400' : 'text-dark-400'}`}>
                      <Check className="w-3 h-3" /> 1 number
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? 'text-emerald-400' : 'text-dark-400'}`}>
                      <Check className="w-3 h-3" /> 1 special character
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-glow-teal-sm"
              >
                {submitting ? (
                  <span>Activating Workspace Account...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Activate Account & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-dark-300 border-t border-dark-700 pt-4">
            Already activated your account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold">
              Sign In to Dayflow
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
