import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Filter,
  UserCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { HeatmapGrid } from '../../components/charts/HeatmapGrid';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const AttendanceManagement = () => {
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [timeData, setTimeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const [attRes, timeRes] = await Promise.all([
        adminService.getAttendance(),
        adminService.getTimeManagementDashboard()
      ]);

      if (attRes.success && attRes.data) {
        setRecords(attRes.data.records || []);
        setSummary(attRes.data.summary || null);
      }
      if (timeRes.success && timeRes.data) {
        setTimeData(timeRes.data);
      }
    } catch (err) {
      toast.error('Failed to load company attendance telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const columns = [
    {
      header: 'Employee Name & Department',
      key: 'employeeName',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={
              row.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
            }
            alt={val}
            className="w-7 h-7 rounded-full object-cover border border-teal-500/40"
          />
          <div>
            <span className="font-bold text-slate-100 block">{val}</span>
            <span className="text-[10px] text-dark-300">
              {row.department} (ID: {row.employeeId})
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Date',
      key: 'date',
      render: (val) => (
        <span className="text-slate-200 font-mono text-xs flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-teal-400" />
          {val}
        </span>
      )
    },
    {
      header: 'Clock In',
      key: 'checkIn',
      render: (val) => <span className="font-mono text-xs text-slate-200">{val || '—'}</span>
    },
    {
      header: 'Clock Out',
      key: 'checkOut',
      render: (val) => <span className="font-mono text-xs text-slate-200">{val || '—'}</span>
    },
    {
      header: 'Total Tracked',
      key: 'workHours',
      render: (val) => (
        <span className="px-2 py-0.5 rounded bg-dark-750 font-mono text-[11px] text-teal-300 border border-dark-600">
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard height="h-64" />
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="card-surface p-6 border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Company Attendance & Timesheet Logs
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Global employee check-ins, shift adherence, and time distribution metrics
          </p>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="On-Time Arrival Rate"
          value={`${summary?.onTimeRate || 94.5}%`}
          subtitle="Compliance baseline"
          icon={CheckCircle}
          iconBg="bg-teal-500/15 text-teal-400 border-teal-500/30"
        />
        <StatCard
          title="Present Today"
          value={`${summary?.presentToday || 0} Staff`}
          subtitle="Active on shift"
          icon={UserCheck}
          iconBg="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        />
        <StatCard
          title="Late Check-ins Today"
          value={`${summary?.lateToday || 0} Staff`}
          subtitle="Exceeded grace buffer"
          icon={AlertTriangle}
          iconBg="bg-amber-500/15 text-amber-400 border-amber-500/30"
        />
        <StatCard
          title="Absent Today"
          value={`${summary?.absentToday || 0} Staff`}
          subtitle="Unlogged roster slots"
          icon={XCircle}
          iconBg="bg-rose-500/15 text-rose-400 border-rose-500/30"
        />
      </div>

      {/* 3. Heatmap Grid */}
      <HeatmapGrid data={timeData?.weeklyHeatmap || []} />

      {/* 4. Company Attendance Table */}
      <DataTable
        title="Company Punch Register"
        subtitle="Individual timesheet records for all organizational members"
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
    </div>
  );
};
