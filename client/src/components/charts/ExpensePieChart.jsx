import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-dark-850 border border-dark-600 p-2.5 rounded-xl shadow-dropdown-dark text-xs">
        <p className="text-dark-300">{name}</p>
        <p className="font-bold text-slate-100">${value.toLocaleString()} USD</p>
      </div>
    );
  }
  return null;
};

export const ExpensePieChart = ({ data = [], title = "Expense Allocation by Category" }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="card-surface p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-dark-300">Total expenditure breakdown</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="h-52 w-full md:w-1/2 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#00C896'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-dark-400">Total</span>
            <span className="text-sm font-bold text-slate-100">${(total / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full md:w-1/2 space-y-2 text-xs">
          {data.map((item, idx) => {
            const percent = total ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-dark-300 truncate max-w-[130px]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-slate-100">${item.value.toLocaleString()}</span>
                  <span className="text-dark-400 text-[11px] w-8 text-right">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
