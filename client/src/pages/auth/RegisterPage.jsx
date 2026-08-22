import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Lock, Mail, User, BadgeCheck, ArrowRight, AlertCircle, Check, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic Password Validation Criteria
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    return {
      hasMinLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };
  }, [formData.password]);

  const strengthScore = useMemo(() => {
    const { hasMinLength, hasUppercase, hasNumber, hasSpecial } = passwordCriteria;
    return [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  }, [passwordCriteria]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (strengthScore < 4) {
      setErrorMsg('Please satisfy all password security requirements.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await register({
        fullName: formData.fullName,
        employeeId: formData.employeeId,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (res.success) {
        toast.success(`Account created! Welcome to Dayflow, ${res.user.fullName}`);
        navigate(res.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', {
          replace: true
        });
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Dayflow</h1>
          <p className="text-xs text-dark-300 mt-1">Every workday, perfectly aligned.</p>
        </div>

        {/* Register Card */}
        <div className="card-surface p-8 backdrop-blur-xl border-dark-700/80 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-100">Create workspace account</h2>
            <p className="text-xs text-dark-300 mt-1">Join your organization's Dayflow HR Portal</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Jordan Lee"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                  Employee ID
                </label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="EMP-1234"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.role === 'employee'
                      ? 'bg-teal-500/10 border-teal-500/50 text-teal-300'
                      : 'bg-dark-850 border-dark-700 text-dark-300 hover:bg-dark-750'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="employee"
                    checked={formData.role === 'employee'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <User className="w-4 h-4" />
                  <div>
                    <span className="text-xs font-bold block">Employee</span>
                    <span className="text-[10px] opacity-80">Standard Access</span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.role === 'admin'
                      ? 'bg-teal-500/10 border-teal-500/50 text-teal-300'
                      : 'bg-dark-850 border-dark-700 text-dark-300 hover:bg-dark-750'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <Shield className="w-4 h-4" />
                  <div>
                    <span className="text-xs font-bold block">HR Admin</span>
                    <span className="text-[10px] opacity-80">Full Management</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
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

                {/* Strength Meter Bar */}
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
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Creating workspace account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-dark-300">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
