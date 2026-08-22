import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Clock,
  CalendarCheck,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { attendanceService } from '../../services/attendanceService';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { StatCard } from '../../components/common/StatCard';
import { useToast } from '../../context/ToastContext';

export const EmployeeDashboard = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePunch = async () => {
    if (!data?.punchState) return;

    try {
      setPunching(true);
      if (!data.punchState.isCheckedIn) {
        const res = await attendanceService.checkIn();
        if (res.success) {
          toast.success(res.message);
          fetchDashboard();
        }
      } else if (!data.punchState.isCheckedOut) {
        const res = await attendanceService.checkOut();
        if (res.success) {
          toast.success(res.message);
          fetchDashboard();
        }
      } else {
        toast.info('You have already completed attendance check-in and check-out for today.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Attendance action failed.';
      toast.error(msg);
    } finally {
      setPunching(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-dark-800 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonTable rows={4} cols={3} />
          </div>
          <SkeletonCard height="h-80" />
        </div>
      </div>
    );
  }

  const { employee, todayDate, punchState, attendanceSummary, leaveBalances, upcomingSchedule, recentActivity } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Dynamic Greeting & Live Punch Banner */}
      <div className="card-surface p-6 bg-gradient-to-r from-dark-800 via-dark-800 to-teal-950/40 border-dark-700/80 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{todayDate}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Good day, {employee?.fullName || 'Colleague'}
            </h1>
            <p className="text-xs text-dark-300 mt-1">
              {employee?.designation} • {employee?.department} (ID: {employee?.employeeId})
            </p>
          </div>

          {/* Punch Button & State Widget */}
          <div className="flex items-center gap-4 bg-dark-850/80 p-3.5 rounded-2xl border border-dark-700 backdrop-blur-md">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-dark-400 block">Today's Punch Status</span>
              <span className="text-xs font-bold text-slate-200">
                {punchState?.isCheckedOut
                  ? `Checked Out (${punchState.checkOutTime})`
                  : punchState?.isCheckedIn
                  ? `Checked In (${punchState.checkInTime})`
                  : 'Not Clocked In'}
              </span>
            </div>

            <button
              onClick={handlePunch}
              disabled={punching || (punchState?.isCheckedIn && punchState?.isCheckedOut)}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                punchState?.isCheckedOut
                  ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                  : punchState?.isCheckedIn
                  ? 'bg-amber-500 hover:bg-amber-600 text-dark-900 shadow-amber-500/20'
                  : 'bg-teal-500 hover:bg-teal-600 text-white shadow-glow-teal-sm'
              }`}
            >
              <Clock className="w-4 h-4" />
              {punching
                ? 'Registering...'
                : punchState?.isCheckedOut
                ? 'Completed Today'
                : punchState?.isCheckedIn
                ? 'Punch Check Out'
                : 'Punch Check In'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Access Shortcut Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/employee/profile"
          className="card-surface p-4 hover:border-teal-500/50 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100 group-hover:text-teal-400 transition-colors">
                My Profile
              </p>
              <p className="text-[10px] text-dark-400">View details</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-dark-400 group-hover:text-teal-400 transition-colors" />
        </Link>

        <Link
          to="/employee/attendance"
          className="card-surface p-4 hover:border-teal-500/50 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100 group-hover:text-teal-400 transition-colors">
                Attendance
              </p>
              <p className="text-[10px] text-dark-400">Punches & logs</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-dark-400 group-hover:text-teal-400 transition-colors" />
        </Link>

        <Link
          to="/employee/leaves"
          className="card-surface p-4 hover:border-teal-500/50 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100 group-hover:text-teal-400 transition-colors">
                Leave Requests
              </p>
              <p className="text-[10px] text-dark-400">Apply & history</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-dark-400 group-hover:text-teal-400 transition-colors" />
        </Link>

        <Link
          to="/employee/payroll"
          className="card-surface p-4 hover:border-teal-500/50 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100 group-hover:text-teal-400 transition-colors">
                My Payslip
              </p>
              <p className="text-[10px] text-dark-400">Salary & taxes</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-dark-400 group-hover:text-teal-400 transition-colors" />
        </Link>
      </div>

      {/* 3. Attendance Summary KPIs & Leave Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Present Days (Month)"
          value={`${attendanceSummary?.presentDays || 0} Days`}
          subtitle="Registered on-time workdays"
          icon={CheckCircle}
          iconBg="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        />
        <StatCard
          title="Late Check-ins"
          value={`${attendanceSummary?.lateDays || 0} Times`}
          subtitle="Punches after shift grace buffer"
          icon={AlertTriangle}
          iconBg="bg-amber-500/15 text-amber-400 border-amber-500/30"
        />
        <StatCard
          title="Absent Days"
          value={`${attendanceSummary?.absentDays || 0} Days`}
          subtitle="Unscheduled work absences"
          icon={XCircle}
          iconBg="bg-rose-500/15 text-rose-400 border-rose-500/30"
        />
      </div>

      {/* 4. Leave Balances Pills */}
      <div className="card-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Leave Quota Balances</h3>
            <p className="text-xs text-dark-300">Remaining accrued leave entitlement for 2026</p>
          </div>
          <Link
            to="/employee/leaves"
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
          >
            Apply for leave →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 text-center">
            <span className="text-[11px] text-dark-400 uppercase font-semibold">Annual Leave</span>
            <span className="text-xl font-bold text-teal-400 block mt-1">
              {leaveBalances?.annual || 0} <span className="text-xs text-dark-400 font-normal">days</span>
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 text-center">
            <span className="text-[11px] text-dark-400 uppercase font-semibold">Sick Leave</span>
            <span className="text-xl font-bold text-sky-400 block mt-1">
              {leaveBalances?.sick || 0} <span className="text-xs text-dark-400 font-normal">days</span>
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 text-center">
            <span className="text-[11px] text-dark-400 uppercase font-semibold">Monthly Off</span>
            <span className="text-xl font-bold text-amber-400 block mt-1">
              {leaveBalances?.monthly || 0} <span className="text-xs text-dark-400 font-normal">days</span>
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 text-center">
            <span className="text-[11px] text-dark-400 uppercase font-semibold">Casual Daily</span>
            <span className="text-xl font-bold text-indigo-400 block mt-1">
              {leaveBalances?.daily || 0} <span className="text-xs text-dark-400 font-normal">days</span>
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 text-center">
            <span className="text-[11px] text-dark-400 uppercase font-semibold">Hourly Permission</span>
            <span className="text-xl font-bold text-emerald-400 block mt-1">
              {leaveBalances?.hourly || 0} <span className="text-xs text-dark-400 font-normal">hrs</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5. Two-column Layout: Upcoming Schedule & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Schedule */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" /> Upcoming Schedule & Holidays
            </h3>
            <span className="text-xs text-dark-400">Team Calendar</span>
          </div>

          <div className="space-y-3">
            {upcomingSchedule?.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between hover:border-dark-600 transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                  <p className="text-[11px] text-teal-400 mt-0.5">{item.time}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-dark-750 text-slate-300 font-medium border border-dark-600">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" /> Recent Workspace Activity
            </h3>
            <span className="text-xs text-dark-400">Real-time</span>
          </div>

          <div className="space-y-3">
            {recentActivity?.length > 0 ? (
              recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-dark-850 border border-dark-700 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-dark-750 text-teal-400 flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-100">{act.title}</p>
                    <p className="text-[11px] text-dark-300 truncate mt-0.5">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-dark-400 flex-shrink-0">{act.time}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-dark-400 py-4 text-center">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
