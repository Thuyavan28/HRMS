import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

export const SatisfactionGauge = ({ score = 94.6, title = "Employee Satisfaction" }) => {
  const data = [{ name: 'Satisfaction', value: score, fill: '#00C896' }];

  return (
    <div className="card-surface p-5 flex flex-col items-center justify-center relative">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-300">
          {title}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
          Excellent
        </span>
      </div>

      <div className="w-full h-44 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#212B3B' }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
            {score}%
          </span>
          <span className="text-[11px] text-dark-300 font-medium">Index Score</span>
        </div>
      </div>

      <p className="text-xs text-dark-400 text-center mt-[-10px]">
        Based on real-time Q2 engagement pulses & team feedback
      </p>
    </div>
  );
};
