import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-850 border border-dark-600 p-3 rounded-xl shadow-dropdown-dark text-xs">
        <p className="font-semibold text-slate-200 mb-2">{label} Trend</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-dark-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-bold text-slate-100">{item.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const TeamKpiChart = ({ data = [], title = "Team KPI Performance & Attendance Trends" }) => {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-dark-300">Monthly velocity and satisfaction index</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-teal-400">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Productivity
          </span>
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Attendance
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Satisfaction
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#212B3B" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#212B3B' }}
            />
            <YAxis
              domain={[75, 100]}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="productivity"
              name="Productivity"
              stroke="#00C896"
              strokeWidth={3}
              dot={{ r: 4, fill: '#00C896', strokeWidth: 2, stroke: '#0D1117' }}
              activeDot={{ r: 6, fill: '#00C896', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="attendanceRate"
              name="Attendance Rate"
              stroke="#38BDF8"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#38BDF8' }}
            />
            <Line
              type="monotone"
              dataKey="satisfaction"
              name="Satisfaction"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 3, fill: '#F59E0B' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
