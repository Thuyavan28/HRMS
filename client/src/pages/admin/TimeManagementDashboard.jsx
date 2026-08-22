import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  Activity,
  Calendar,
  Zap,
  TrendingUp,
  Sparkles,
  Users,
  ShieldAlert
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { HeatmapGrid } from '../../components/charts/HeatmapGrid';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const TimeManagementDashboard = () => {
  const toast = useToast();

  const [timeData, setTimeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTimeData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getTimeManagementDashboard();
      if (res.success && res.data) {
        setTimeData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load time management analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard height="h-64" />
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  const { summary, weeklyHeatmap = [], shiftSchedules = [], productivityTrends = [], liveCheckInFeed = [] } = timeData || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="card-surface p-6 border-dark-700 bg-gradient-to-r from-dark-800 via-dark-800 to-teal-950/30">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Workforce Scheduling & Productivity Intelligence</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Time Management & Telemetry
        </h1>
        <p className="text-xs text-dark-300 mt-1">
          Shift roster adherence, overtime hours distribution, and concurrent punch telemetry
        </p>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Tracked Hours"
          value={`${summary?.totalTrackedHours || 0} hrs`}
          subtitle="Cumulative month-to-date"
          icon={Clock}
          iconBg="bg-teal-500/15 text-teal-400 border-teal-500/30"
        />
        <StatCard
          title="Productivity Score"
          value={`${summary?.productivityScore || 0}%`}
          subtitle="Calculated focus metrics"
          icon={Zap}
          iconBg="bg-sky-500/15 text-sky-400 border-sky-500/30"
        />
        <StatCard
          title="Overtime Logged"
          value={`${summary?.overtimeHours || 0} hrs`}
          subtitle="Extended shift volume"
          icon={TrendingUp}
          iconBg="bg-amber-500/15 text-amber-400 border-amber-500/30"
        />
        <StatCard
          title="Clocked In Right Now"
          value={`${summary?.activeClockedInNow || 0} Active`}
          subtitle="Live concurrent punches"
          icon={Users}
          iconBg="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        />
      </div>

      {/* 3. Heatmap Grid Component */}
      <HeatmapGrid data={weeklyHeatmap} />

      {/* 4. Shift Rosters & Live Check-in Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift Rosters */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" /> Active Shift Roster Schedules
          </h3>
          <div className="space-y-3">
            {shiftSchedules.map((shift, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-100">{shift.shiftName}</p>
                  <p className="text-[11px] text-teal-400 font-mono mt-0.5">{shift.timing}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-200 block">
                    {shift.assignedEmployees} Staff
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {shift.compliance}% Compliance
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Punch Activity Stream */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" /> Live Clock-in / Clock-out Activity Stream
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {liveCheckInFeed.map((punch, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <div>
                    <span className="font-bold text-slate-200 block">
                      Employee ID: {punch.employeeId}
                    </span>
                    <span className="text-[10px] text-dark-400">
                      In: {punch.checkIn || '—'} | Out: {punch.checkOut || 'Active'}
                    </span>
                  </div>
                </div>
                <StatusBadge status={punch.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
