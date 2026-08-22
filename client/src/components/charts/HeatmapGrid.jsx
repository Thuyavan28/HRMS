import React from 'react';

export const HeatmapGrid = ({
  data = [],
  title = "Weekly Clock-in Intensity Heatmap"
}) => {
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  const getColor = (val = 0) => {
    if (val === 0) return 'bg-dark-850 text-dark-500';
    if (val < 15) return 'bg-teal-950 text-teal-300 border border-teal-800/40';
    if (val < 25) return 'bg-teal-900 text-teal-200 border border-teal-700/50';
    if (val < 35) return 'bg-teal-700 text-slate-100 border border-teal-600/60';
    return 'bg-teal-500 text-dark-900 font-bold shadow-glow-teal-sm';
  };

  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-dark-300">Concurrent active employees by hourly slots</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-dark-400">
          <span>Low</span>
          <span className="w-3 h-3 rounded bg-teal-950 border border-teal-800/40"></span>
          <span className="w-3 h-3 rounded bg-teal-700"></span>
          <span className="w-3 h-3 rounded bg-teal-500"></span>
          <span>Peak</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[450px]">
          {/* Header Hour Slots */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-dark-300">
            <div className="text-left pl-2">Day</div>
            {timeSlots.map((slot) => (
              <div key={slot}>{slot}</div>
            ))}
          </div>

          {/* Days Grid Rows */}
          <div className="space-y-2">
            {data.map((row) => (
              <div key={row.day} className="grid grid-cols-7 gap-2 items-center text-center text-xs">
                <div className="text-left pl-2 font-medium text-slate-200">{row.day}</div>
                {timeSlots.map((slot) => {
                  const val = row[slot] || 0;
                  return (
                    <div
                      key={slot}
                      className={`h-9 rounded-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${getColor(
                        val
                      )}`}
                      title={`${row.day} @ ${slot}: ${val} active employees`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
