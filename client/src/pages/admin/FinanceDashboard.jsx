import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  PieChart,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { CashFlowAreaChart } from '../../components/charts/CashFlowAreaChart';
import { ExpensePieChart } from '../../components/charts/ExpensePieChart';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const FinanceDashboard = () => {
  const toast = useToast();

  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFinanceDashboard();
      if (res.success && res.data) {
        setFinance(res.data);
      }
    } catch (err) {
      toast.error('Failed to load financial telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const transactionColumns = [
    {
      header: 'Transaction ID & Description',
      key: 'title',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-100 block">{val}</span>
          <span className="text-[10px] text-dark-300 font-mono">Ref: {row.id}</span>
        </div>
      )
    },
    {
      header: 'Category',
      key: 'category',
      render: (val) => <span className="text-slate-200">{val}</span>
    },
    {
      header: 'Date',
      key: 'date',
      render: (val) => <span className="text-dark-300 font-mono text-xs">{val}</span>
    },
    {
      header: 'Amount',
      key: 'amount',
      render: (val, row) => (
        <span
          className={`font-mono font-bold text-xs ${
            row.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {row.type === 'Income' ? '+' : '-'}₹${val?.toLocaleString()}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard height="h-64" />
          <SkeletonCard height="h-64" />
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  const { summary, cashFlow = [], expenseCategories = [], departmentSpending = [], recentTransactions = [] } = finance || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="card-surface p-6 border-dark-700 bg-gradient-to-r from-dark-800 via-dark-800 to-teal-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Corporate Financial Health & Spending</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Financial & Payroll Analytics
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Track revenue inflows, department budgets, vendor expenses, and net profit margins
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Monthly Revenue"
          value={`₹${summary?.totalRevenue?.toLocaleString() || 0}`}
          subtitle="Gross customer SaaS recurring"
          change={summary?.revenueChange}
          icon={DollarSign}
          iconBg="bg-teal-500/15 text-teal-400 border-teal-500/30"
        />
        <StatCard
          title="Operating Expenses"
          value={`₹${summary?.totalExpenses?.toLocaleString() || 0}`}
          subtitle="Tech, facilities & operations"
          change={summary?.expenseChange}
          icon={CreditCard}
          iconBg="bg-rose-500/15 text-rose-400 border-rose-500/30"
        />
        <StatCard
          title="Net Corporate Profit"
          value={`₹${summary?.netProfit?.toLocaleString() || 0}`}
          subtitle="Operating profit after payroll"
          change={summary?.profitChange}
          icon={TrendingUp}
          iconBg="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        />
        <StatCard
          title="Payroll Spending"
          value={`₹${summary?.payrollSpending?.toLocaleString() || 0}`}
          subtitle="Total workforce disbursement"
          change={summary?.payrollChange}
          icon={FileText}
          iconBg="bg-sky-500/15 text-sky-400 border-sky-500/30"
        />
      </div>

      {/* 3. Cash Flow Chart & Expense Categories Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowAreaChart data={cashFlow} />
        <ExpensePieChart data={expenseCategories} />
      </div>

      {/* 4. Department Spending Breakdown */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dark-700">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400" /> Departmental Budget Allocation & Utilization
            </h3>
            <p className="text-xs text-dark-300">Fiscal budget vs actual spend per department</p>
          </div>
        </div>

        <div className="space-y-3">
          {departmentSpending.map((dept, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-dark-850 border border-dark-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-100">{dept.department}</span>
                <div className="flex items-center gap-4">
                  <span className="text-dark-300">
                    Actual: <span className="font-bold text-slate-200">₹{dept.actual.toLocaleString()}</span> / Budget: ₹{dept.budget.toLocaleString()}
                  </span>
                  <span className="font-mono font-bold text-teal-400">{dept.utilization}%</span>
                </div>
              </div>

              {/* Utilization bar */}
              <div className="w-full h-2 bg-dark-750 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dept.utilization > 95
                      ? 'bg-amber-400'
                      : dept.utilization > 80
                      ? 'bg-teal-500'
                      : 'bg-sky-400'
                  }`}
                  style={{ width: `${Math.min(dept.utilization, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Financial Transactions Table */}
      <DataTable
        title="Recent Ledger Transactions"
        subtitle="Audited inflows and outflows for the current operating cycle"
        columns={transactionColumns}
        data={recentTransactions}
        pageSize={5}
      />
    </div>
  );
};
