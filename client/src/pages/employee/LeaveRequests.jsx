import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Trash2
} from 'lucide-react';
import { leaveService } from '../../services/leaveService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const LeaveRequests = () => {
  const toast = useToast();

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: 'Paid',
    fromDate: '',
    toDate: '',
    remarks: ''
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveService.getMyLeaves();
      if (res.success && res.data) {
        setLeaves(res.data.leaves || []);
        setBalances(res.data.balances || null);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      toast.error('Failed to load leave records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Compute duration dynamically
  const calculatedDuration = () => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    if (end < start) return 0;
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const duration = calculatedDuration();

    if (duration <= 0) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await leaveService.applyLeave({
        ...formData,
        duration
      });

      if (res.success) {
        toast.success(res.message || 'Leave application submitted.');
        setIsApplyModalOpen(false);
        setFormData({ leaveType: 'Paid', fromDate: '', toDate: '', remarks: '' });
        fetchLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;

    try {
      const res = await leaveService.cancelLeave(leaveId);
      if (res.success) {
        toast.success('Leave request cancelled.');
        fetchLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave request.');
    }
  };

  const columns = [
    {
      header: 'Leave Type',
      key: 'leaveType',
      render: (val) => (
        <span className="font-bold text-slate-100 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-teal-400" />
          {val} Leave
        </span>
      )
    },
    {
      header: 'Duration & Dates',
      key: 'fromDate',
      render: (_, row) => (
        <div>
          <span className="text-slate-200 text-xs font-semibold block">
            {row.fromDate} to {row.toDate}
          </span>
          <span className="text-[11px] text-teal-400 font-mono">{row.duration} day(s)</span>
        </div>
      )
    },
    {
      header: 'Reason / Remarks',
      key: 'remarks',
      render: (val, row) => (
        <div className="max-w-xs">
          <p className="text-xs text-slate-300 truncate" title={val}>
            {val}
          </p>
          {row.adminComment && (
            <p className="text-[10px] text-dark-400 mt-0.5 truncate" title={row.adminComment}>
              HR Note: {row.adminComment}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div>
          {row.status === 'Pending' ? (
            <button
              onClick={() => handleCancel(row.id)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Cancel
            </button>
          ) : (
            <span className="text-[11px] text-dark-400">Locked</span>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Page Header & Apply Action */}
      <div className="card-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-dark-700 bg-gradient-to-r from-dark-800 to-dark-850">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Leave Requests & Quotas
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Apply for planned time off and track management approvals in real-time
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="btn-primary text-xs font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {/* 2. Leave Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Annual Leave</span>
          <span className="text-2xl font-black text-teal-400 block mt-1">
            {balances?.annual ?? 0} <span className="text-xs font-normal text-dark-400">days</span>
          </span>
        </div>
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Sick Leave</span>
          <span className="text-2xl font-black text-sky-400 block mt-1">
            {balances?.sick ?? 0} <span className="text-xs font-normal text-dark-400">days</span>
          </span>
        </div>
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Monthly Off</span>
          <span className="text-2xl font-black text-amber-400 block mt-1">
            {balances?.monthly ?? 0} <span className="text-xs font-normal text-dark-400">days</span>
          </span>
        </div>
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Casual Leave</span>
          <span className="text-2xl font-black text-indigo-400 block mt-1">
            {balances?.daily ?? 0} <span className="text-xs font-normal text-dark-400">days</span>
          </span>
        </div>
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Hourly Quota</span>
          <span className="text-2xl font-black text-emerald-400 block mt-1">
            {balances?.hourly ?? 0} <span className="text-xs font-normal text-dark-400">hrs</span>
          </span>
        </div>
      </div>

      {/* 3. Leave Requests History Table */}
      <DataTable
        title="Leave Request History"
        subtitle="Chronological log of all submitted leave applications"
        columns={columns}
        data={leaves}
        filterKey="status"
        filterOptions={[
          { label: 'Pending', value: 'Pending' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Rejected', value: 'Rejected' }
        ]}
        pageSize={10}
      />

      {/* 4. Apply for Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Time Off"
        subtitle="Submit your leave application for manager approval"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={submitting}
              className="btn-primary text-xs font-semibold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </>
        }
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              Leave Category
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="input-field"
              required
            >
              <option value="Paid">Paid Annual Leave</option>
              <option value="Sick">Sick / Medical Leave</option>
              <option value="Casual">Casual Personal Day</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Auto-computed duration preview badge */}
          {formData.fromDate && formData.toDate && (
            <div className="p-3 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-between text-xs">
              <span className="text-dark-300 font-medium">Calculated Absence:</span>
              <span className="font-bold text-teal-400 text-sm">
                {calculatedDuration()} Calendar Day(s)
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              Remarks & Reason for Absence
            </label>
            <textarea
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="input-field"
              placeholder="Provide context for your manager (e.g., family travel, dental appointment, etc.)"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
