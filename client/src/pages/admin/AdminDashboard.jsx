import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  TrendingDown,
  UserPlus,
  CalendarCheck,
  Award,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SatisfactionGauge } from '../../components/charts/SatisfactionGauge';
import { TeamKpiChart } from '../../components/charts/TeamKpiChart';
import { EmploymentStatusBarChart } from '../../components/charts/EmploymentStatusBarChart';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const employeeColumns = [
    {
      header: 'Employee',
      key: 'fullName',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}
            alt={val}
            className="w-8 h-8 rounded-full object-cover border border-teal-500/40"
          />
          <div>
            <span className="font-bold text-slate-100 block">{val}</span>
            <span className="text-[10px] text-dark-300">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'ID',
      key: 'employeeId',
      render: (val) => <span className="font-mono text-xs text-dark-300">{val}</span>
    },
    {
      header: 'Department',
      key: 'department',
      render: (val) => <span className="text-slate-200">{val}</span>
    },
    {
      header: 'Designation',
      key: 'designation',
      render: (val) => <span className="text-dark-300">{val}</span>
    },
    {
      header: 'Work Mode',
      key: 'workType',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Action',
      key: 'id',
      render: (val, row) => (
        <Link
          to={`/admin/employees/${row.employeeId || val}`}
          className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
        >
          Manage →
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard height="h-72" />
          </div>
          <SkeletonCard height="h-72" />
        </div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  const { kpis, teamKpiTrend, employmentStatusData, leaveSummary, recentEmployees } = dashboardData || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Admin Header */}
      <div className="card-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-dark-700 bg-gradient-to-r from-dark-800 via-dark-800 to-teal-950/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive HR Intelligence & Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Dayflow Operations Center
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Real-time workforce performance, payroll execution, and organizational metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/employees"
            className="btn-primary text-xs font-semibold flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Manage Employees
          </Link>
          <Link
            to="/admin/leaves"
            className="btn-secondary text-xs font-semibold flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" /> Pending Leaves ({leaveSummary?.pendingApprovals || 0})
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={`${kpis?.totalEmployees || 0} Staff`}
          subtitle={`${kpis?.activeEmployees || 0} currently active`}
          change={kpis?.employeeChange}
          icon={Users}
          iconBg="bg-teal-500/15 text-teal-400 border-teal-500/30"
        />
        <StatCard
          title="Monthly Payroll"
          value={`$${kpis?.totalPayrolls?.toLocaleString() || '0'}`}
          subtitle="Net monthly disbursement"
          change={kpis?.payrollChange}
          icon={CreditCard}
          iconBg="bg-sky-500/15 text-sky-400 border-sky-500/30"
        />
        <StatCard
          title="Turnover Rate"
          value={`${kpis?.turnoverRate || 0}%`}
          subtitle="Annualized churn"
          change={kpis?.turnoverChange}
          icon={TrendingDown}
          iconBg="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        />
        <StatCard
          title="Job Applicants"
          value={`${kpis?.jobApplicants || 0} Active`}
          subtitle="Open candidate pipelines"
          change={kpis?.applicantsChange}
          icon={UserPlus}
          iconBg="bg-amber-500/15 text-amber-400 border-amber-500/30"
        />
      </div>

      {/* 3. Visual Charts Grid (Line Chart + Satisfaction Gauge + Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamKpiChart data={teamKpiTrend || []} />
        </div>
        <div>
          <SatisfactionGauge score={kpis?.employeeSatisfaction || 94.6} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmploymentStatusBarChart data={employmentStatusData || []} />
        </div>

        {/* Leave & Operational Summary Widget */}
        <div className="card-surface p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">Leave Operations</h3>
            <p className="text-xs text-dark-300 mb-4">Current absence and leave status overview</p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between">
                <span className="text-xs text-dark-300">Pending Review Requests</span>
                <span className="text-base font-bold text-amber-400">
                  {leaveSummary?.pendingApprovals || 0}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between">
                <span className="text-xs text-dark-300">On Leave Today</span>
                <span className="text-base font-bold text-teal-400">
                  {leaveSummary?.onLeaveToday || 0} Staff
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between">
                <span className="text-xs text-dark-300">Upcoming Approved Leaves</span>
                <span className="text-base font-bold text-sky-400">
                  {leaveSummary?.upcomingLeaves || 0} Leaves
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/leaves"
            className="w-full btn-secondary text-xs text-center justify-center mt-4"
          >
            Open Leave Management →
          </Link>
        </div>
      </div>

      {/* 4. Recent Employees Table */}
      <DataTable
        title="Active Employee Directory"
        subtitle="Recently updated and onboarded team members"
        columns={employeeColumns}
        data={recentEmployees || []}
        pageSize={5}
      />
    </div>
  );
};
