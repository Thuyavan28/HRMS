import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Layers,
  Edit2,
  Download,
  Filter
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const PayrollManagement = () => {
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  // Edit Payroll Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    basic: 0,
    hra: 0,
    transport: 0,
    medical: 0,
    status: 'Processed'
  });
  const [saving, setSaving] = useState(false);

  const fetchPayroll = async (monthCode) => {
    try {
      setLoading(true);
      const res = await adminService.getPayroll({ monthCode });
      if (res.success && res.data) {
        setRecords(res.data.records || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      toast.error('Failed to load company payroll.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(selectedMonth);
  }, [selectedMonth]);

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    setEditFormData({
      basic: rec.basic,
      hra: rec.hra,
      transport: rec.transport,
      medical: rec.medical,
      status: rec.status
    });
  };

  const handleSavePayroll = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      setSaving(true);
      const gross = Number(editFormData.basic) + Number(editFormData.hra) + Number(editFormData.transport) + Number(editFormData.medical);
      const taxDeduction = Math.round(gross * 0.15);
      const pfDeduction = Math.round(Number(editFormData.basic) * 0.12);
      const netSalary = gross - taxDeduction - pfDeduction;

      const res = await adminService.updatePayroll(editingRecord.id, {
        ...editFormData,
        gross,
        taxDeduction,
        pfDeduction,
        netSalary
      });

      if (res.success) {
        toast.success(res.message || 'Payroll record updated.');
        setEditingRecord(null);
        fetchPayroll(selectedMonth);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payroll.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkProcessed = async (recordId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Pending' ? 'Processed' : 'Paid';
      const res = await adminService.updatePayroll(recordId, { status: nextStatus });
      if (res.success) {
        toast.success(`Payroll marked as ${nextStatus}.`);
        fetchPayroll(selectedMonth);
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const columns = [
    {
      header: 'Employee Name & Department',
      key: 'employeeName',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-100 block">{val}</span>
          <span className="text-[10px] text-dark-300">
            {row.department} • {row.designation} (ID: {row.employeeId})
          </span>
        </div>
      )
    },
    {
      header: 'Basic Salary',
      key: 'basic',
      render: (val) => <span className="font-mono text-xs text-slate-200">${val?.toLocaleString()}</span>
    },
    {
      header: 'Allowances (HRA/Transport/Med)',
      key: 'hra',
      render: (_, row) => (
        <span className="font-mono text-xs text-dark-300">
          +${((row.hra || 0) + (row.transport || 0) + (row.medical || 0)).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Gross Total',
      key: 'gross',
      render: (val) => <span className="font-mono text-xs text-slate-200">${val?.toLocaleString()}</span>
    },
    {
      header: 'Deductions (Tax/PF)',
      key: 'taxDeduction',
      render: (_, row) => (
        <span className="font-mono text-xs text-rose-400">
          -${((row.taxDeduction || 0) + (row.pfDeduction || 0)).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Net Take-Home',
      key: 'netSalary',
      render: (val) => (
        <span className="font-bold text-teal-400 font-mono text-xs">
          ₹${val?.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Actions',
      key: 'id',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' && (
            <button
              onClick={() => handleMarkProcessed(row.id, row.status)}
              className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-xs font-semibold cursor-pointer"
            >
              Mark Processed
            </button>
          )}
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg bg-dark-750 hover:bg-dark-700 text-teal-400 border border-dark-600 cursor-pointer"
            title="Edit Compensation Items"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  if (loading && !records.length) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={8} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="card-surface p-6 border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Payroll Management & Disbursement
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Calculate gross salaries, statutory tax withholdings, and execute payroll batches
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field py-2 text-xs font-semibold"
          >
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
            <option value="2026-05">May 2026</option>
          </select>

          <Link
            to="/admin/payroll-run"
            className="btn-primary text-xs font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <Layers className="w-4 h-4" /> Bulk Payroll Run
          </Link>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Disbursed"
          value={`₹${summary?.totalDisbursed?.toLocaleString() || 0}`}
          subtitle="Net funds distributed to accounts"
          icon={CreditCard}
          iconBg="bg-teal-500/15 text-teal-400 border-teal-500/30"
        />
        <StatCard
          title="Total Gross Compensation"
          value={`₹${summary?.totalGross?.toLocaleString() || 0}`}
          subtitle="Pre-tax corporate payroll obligation"
          icon={DollarSign}
          iconBg="bg-sky-500/15 text-sky-400 border-sky-500/30"
        />
        <StatCard
          title="Taxes & PF Withheld"
          value={`₹${summary?.totalTaxesWithheld?.toLocaleString() || 0}`}
          subtitle="Statutory compliance deductions"
          icon={Clock}
          iconBg="bg-amber-500/15 text-amber-400 border-amber-500/30"
        />
        <StatCard
          title="Processed Staff"
          value={`${summary?.totalEmployeesProcessed || 0} Staff`}
          subtitle={`${summary?.pendingProcessingCount || 0} pending processing`}
          icon={CheckCircle}
          iconBg="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        />
      </div>

      {/* 3. Payroll Register Table */}
      <DataTable
        title="Monthly Payroll Ledger"
        subtitle={`Viewing calculated compensation records for ${selectedMonth}`}
        columns={columns}
        data={records}
        filterKey="status"
        filterOptions={[
          { label: 'Processed', value: 'Processed' },
          { label: 'Paid', value: 'Paid' },
          { label: 'Pending', value: 'Pending' }
        ]}
        pageSize={10}
      />

      {/* 4. Edit Compensation Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Adjust Salary Components"
        subtitle={`Employee: ${editingRecord?.employeeName} (${editingRecord?.month})`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePayroll}
              disabled={saving}
              className="btn-primary text-xs font-semibold"
            >
              {saving ? 'Saving...' : 'Save Adjustments'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSavePayroll} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Basic Pay ($)
              </label>
              <input
                type="number"
                value={editFormData.basic}
                onChange={(e) => setEditFormData({ ...editFormData, basic: Number(e.target.value) })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                HRA Allowance ($)
              </label>
              <input
                type="number"
                value={editFormData.hra}
                onChange={(e) => setEditFormData({ ...editFormData, hra: Number(e.target.value) })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Transport Allowance ($)
              </label>
              <input
                type="number"
                value={editFormData.transport}
                onChange={(e) => setEditFormData({ ...editFormData, transport: Number(e.target.value) })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Medical Allowance ($)
              </label>
              <input
                type="number"
                value={editFormData.medical}
                onChange={(e) => setEditFormData({ ...editFormData, medical: Number(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              Disbursement Status
            </label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              className="input-field"
            >
              <option value="Pending">Pending</option>
              <option value="Processed">Processed</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
