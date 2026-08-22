import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-glow-teal animate-bounce">
          <Briefcase className="w-7 h-7" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-extrabold text-lg text-slate-100 tracking-tight">Dayflow</span>
          <span className="text-xs text-teal-400 font-medium animate-pulse">
            Authenticating workspace session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect wrong-role users to their own proper dashboard
    const targetDashboard = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};
