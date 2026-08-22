import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();

  let styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  if (['active', 'approved', 'present', 'paid', 'completed', 'published', 'exceptional', 'high'].includes(s)) {
    styles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (['pending', 'late', 'draft', 'in progress', 'exceeds expectations', 'warning'].includes(s)) {
    styles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (['inactive', 'rejected', 'absent', 'cancelled', 'deactivated', 'failed', 'low'].includes(s)) {
    styles = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  } else if (['processed', 'full-time', 'hybrid', 'remote', 'paid leave', 'sick leave', 'meets expectations'].includes(s)) {
    styles = 'bg-teal-500/15 text-teal-300 border-teal-500/30';
  } else if (['info', 'on-site', 'contractor', 'general'].includes(s)) {
    styles = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse"></span>
      {status}
    </span>
  );
};
