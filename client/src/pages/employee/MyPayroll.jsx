import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { payrollService } from '../../services/payrollService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const MyPayroll = () => {
  const toast = useToast();

  const [payrollData, setPayrollData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchPayroll = async (monthCode) => {
    try {
      setLoading(true);
      const res = await payrollService.getMyPayroll(monthCode);
      if (res.success && res.data) {
        setPayrollData(res.data);
        if (!selectedMonth && res.data.currentRecord) {
          setSelectedMonth(res.data.currentRecord.monthCode);
        }
      }
    } catch (err) {
      toast.error('Failed to load payroll data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(selectedMonth);
  }, [selectedMonth]);

  const handleDownload = async (monthCode) => {
    try {
      setDownloading(true);
      toast.info('Generating official PDF payslip...');
      await payrollService.downloadPayslip(monthCode || selectedMonth);
      toast.success('Payslip downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download payslip PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const current = payrollData?.currentRecord;

  const historyColumns = [
    {
      header: 'Pay Period',
      key: 'month',
      render: (val) => (
        <span className="font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-400" />
          {val}
        </span>
      )
    },
    {
      header: 'Disbursement Date',
      key: 'paymentDate',
      render: (val) => <span className="text-dark-300 font-mono text-xs">{val || '—'}</span>
    },
    {
      header: 'Gross Pay',
      key: 'gross',
      render: (val) => <span className="font-mono text-xs text-slate-200">${val?.toLocaleString()}</span>
    },
    {
      header: 'Net Take-Home',
      key: 'netSalary',
      render: (val) => (
        <span className="font-bold text-teal-400 font-mono text-xs">
          ${val?.toLocaleString()} USD
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Payslip',
      key: 'monthCode',
      render: (val) => (
        <button
          onClick={() => handleDownload(val)}
          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold cursor-pointer px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> PDF Slip
        </button>
      )
    }
  ];

  if (loading && !payrollData) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-dark-800 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard height="h-64" />
          <SkeletonCard height="h-64" />
        </div>
        <SkeletonTable rows={4} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Month Selector & PDF Download Header */}
      <div className="card-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-dark-700 bg-gradient-to-r from-dark-800 to-dark-850">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            My Salary & Compensation
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Itemized earnings, tax withholdings, and verifiable monthly payslips
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field py-2 text-xs font-semibold bg-dark-850 cursor-pointer"
          >
            {payrollData?.availableMonths?.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Download Payslip Button */}
          <button
            onClick={() => handleDownload(selectedMonth)}
            disabled={downloading || !current}
            className="btn-primary text-xs font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Exporting PDF...' : 'Download Payslip (PDF)'}
          </button>
        </div>
      </div>

      {/* 2. Current Month Detailed Breakdown Cards */}
      {current ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Breakdown */}
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-700">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Monthly Earnings Breakdown
              </h3>
              <span className="text-xs font-semibold text-slate-300">{current.month}</span>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-dark-700/50">
              <div className="flex justify-between py-1.5">
                <span className="text-dark-300">Basic Salary</span>
                <span className="font-bold text-slate-100">${current.basic?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-dark-300">House Rent Allowance (HRA)</span>
                <span className="font-bold text-slate-100">${current.hra?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-dark-300">Transport Allowance</span>
                <span className="font-bold text-slate-100">${current.transport?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-dark-300">Medical Allowance</span>
                <span className="font-bold text-slate-100">${current.medical?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 pt-3 font-semibold text-sm border-t border-dark-700">
                <span className="text-slate-100">Total Gross Earnings</span>
                <span className="text-teal-400">${current.gross?.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* Deductions & Net Take-Home */}
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-700">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Statutory Deductions & Net
              </h3>
              <StatusBadge status={current.status} />
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-dark-700/50">
              <div className="flex justify-between py-1.5">
                <span className="text-dark-300">Income Tax Deduction</span>
                <span className="font-bold text-rose-400">-${current.taxDeduction?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-dark-300">Provident Fund (PF) Contribution</span>
                <span className="font-bold text-rose-400">-${current.pfDeduction?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 pt-3 font-semibold text-sm border-t border-dark-700">
                <span className="text-slate-100">Total Deductions</span>
                <span className="text-rose-400">
                  -${((current.taxDeduction || 0) + (current.pfDeduction || 0)).toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Net Payout Banner */}
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between mt-4">
              <div>
                <span className="text-[11px] text-dark-300 uppercase font-semibold">
                  Net Disbursed Take-Home
                </span>
                <p className="text-2xl font-black text-teal-400 mt-0.5">
                  ${current.netSalary?.toLocaleString()} USD
                </p>
              </div>
              <div className="text-right text-[11px] text-dark-300">
                <span>Direct ACH Transfer</span>
                <p className="text-slate-200 font-medium">{current.paymentDate || 'End of month'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Payslip History Table */}
      <DataTable
        title="Payslip Archive & History"
        subtitle="All historical monthly payslips available for audit and download"
        columns={historyColumns}
        data={payrollData?.records || []}
        pageSize={10}
      />
    </div>
  );
};
