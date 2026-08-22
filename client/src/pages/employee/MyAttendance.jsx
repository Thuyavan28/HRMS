import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  List,
  Grid
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const MyAttendance = () => {
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getMyAttendance();
      if (res.success && res.data) {
        setRecords(res.data.records || []);
        setSummary(res.data.summary || null);
        setTodayStatus(res.data.todayStatus || null);
      }
    } catch (err) {
      toast.error('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handlePunch = async () => {
    try {
      setPunching(true);
      if (!todayStatus?.checkIn) {
        const res = await attendanceService.checkIn();
        if (res.success) {
          toast.success(res.message);
          fetchAttendance();
        }
      } else if (!todayStatus?.checkOut) {
        const res = await attendanceService.checkOut();
        if (res.success) {
          toast.success(res.message);
          fetchAttendance();
        }
      } else {
        toast.info('Attendance already clocked out for today.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Attendance action failed.');
    } finally {
      setPunching(false);
    }
  };

  const columns = [
    {
      header: 'Date',
      key: 'date',
      render: (val) => (
        <span className="font-semibold text-slate-100 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-teal-400" />
          {val}
        </span>
      )
    },
    {
      header: 'Check In',
      key: 'checkIn',
      render: (val) => (
        <span className="text-slate-200 font-mono text-xs">{val || '—'}</span>
      )
    },
    {
      header: 'Check Out',
      key: 'checkOut',
      render: (val) => (
        <span className="text-slate-200 font-mono text-xs">{val || '—'}</span>
      )
    },
    {
      header: 'Working Hours',
      key: 'workHours',
      render: (val) => (
        <span className="px-2.5 py-1 rounded bg-dark-750 font-mono text-[11px] text-teal-300 border border-dark-600">
          {val}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={8} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Live Punch Action Panel */}
      <div className="card-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-dark-700 bg-gradient-to-r from-dark-800 to-dark-850">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            My Attendance & Timesheets
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Personal punch clock records and cumulative work hour telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-dark-850 p-1 rounded-xl border border-dark-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-teal-500 text-white' : 'text-dark-300 hover:text-slate-100'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-teal-500 text-white' : 'text-dark-300 hover:text-slate-100'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>

          {/* Punch Button */}
          <button
            onClick={handlePunch}
            disabled={punching || (todayStatus?.checkIn && todayStatus?.checkOut)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              todayStatus?.checkOut
                ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                : todayStatus?.checkIn
                ? 'bg-amber-500 hover:bg-amber-600 text-dark-900 shadow-amber-500/20'
                : 'bg-teal-500 hover:bg-teal-600 text-white shadow-glow-teal-sm'
            }`}
          >
            <Clock className="w-4 h-4" />
            {punching
              ? 'Registering...'
              : todayStatus?.checkOut
              ? 'Checked Out Today'
              : todayStatus?.checkIn
              ? `Check Out (${todayStatus.checkIn})`
              : 'Clock In Now'}
          </button>
        </div>
      </div>

      {/* 2. Attendance Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${summary?.attendanceRate || 0}%`}
          subtitle="Monthly compliance rate"
          icon={CheckCircle}
          iconBg="bg-teal-500/15 text-teal-400 border-teal-500/30"
        />
        <StatCard
          title="Total Workdays"
          value={`${summary?.totalDays || 0} Days`}
          subtitle="Past 30 operational days"
          icon={Calendar}
          iconBg="bg-sky-500/15 text-sky-400 border-sky-500/30"
        />
        <StatCard
          title="Late Arrivals"
          value={`${summary?.lateCount || 0} Days`}
          subtitle="Late punch recordings"
          icon={AlertTriangle}
          iconBg="bg-amber-500/15 text-amber-400 border-amber-500/30"
        />
        <StatCard
          title="Absences"
          value={`${summary?.absentCount || 0} Days`}
          subtitle="Unlogged working days"
          icon={XCircle}
          iconBg="bg-rose-500/15 text-rose-400 border-rose-500/30"
        />
      </div>

      {/* 3. Table or Calendar View */}
      {viewMode === 'table' ? (
        <DataTable
          title="Attendance History"
          subtitle="Your complete punch timestamps and computed work hours"
          columns={columns}
          data={records}
          filterKey="status"
          filterOptions={[
            { label: 'Present', value: 'Present' },
            { label: 'Late', value: 'Late' },
            { label: 'Absent', value: 'Absent' }
          ]}
          pageSize={10}
        />
      ) : (
        /* Calendar Grid View */
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-700">
            <div>
              <h3 className="text-base font-bold text-slate-100">Monthly Attendance Calendar</h3>
              <p className="text-xs text-dark-300">Daily punch status overview</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-dark-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
            {records.slice(0, 28).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-dark-850 border border-dark-700 hover:border-dark-600 transition-all flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-200">
                    {new Date(rec.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'numeric',
                      day: 'numeric'
                    })}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      rec.status === 'Present'
                        ? 'bg-emerald-400'
                        : rec.status === 'Late'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                </div>

                <div className="text-[10px] space-y-0.5 mt-2">
                  <p className="text-dark-300 font-mono">In: {rec.checkIn || '—'}</p>
                  <p className="text-dark-300 font-mono">Out: {rec.checkOut || '—'}</p>
                </div>

                <div className="mt-2 pt-1 border-t border-dark-750 text-[10px] font-semibold text-teal-400">
                  {rec.workHours}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
