import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconBg = 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  className = ''
}) => {
  const isPositive = typeof change === 'number' ? change >= 0 : true;

  return (
    <div className={`card-surface p-5 hover:border-dark-600 transition-all group ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-300">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconBg} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{value}</h2>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {change !== undefined && change !== null && (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(change)}%
          </span>
        )}
        {subtitle && <span className="text-dark-400 truncate">{subtitle}</span>}
      </div>
    </div>
  );
};
