import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Search,
  Filter,
  User
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const LeaveManagement = () => {
  const toast = useToast();

  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Modal Action State
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLeaves();
      if (res.success && res.data) {
        setLeaves(res.data.leaves || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      toast.error('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openActionModal = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setAdminComment(type === 'approve' ? 'Approved by HR Operations.' : 'Request rejected.');
  };

  const handleConfirmAction = async () => {
    if (!selectedLeave || !actionType) return;

    try {
      setProcessing(true);
      let res;
      if (actionType === 'approve') {
        res = await adminService.approveLeave(selectedLeave.id, adminComment);
      } else {
        res = await adminService.rejectLeave(selectedLeave.id, adminComment);
      }

      if (res.success) {
        toast.success(res.message || `Leave request ${actionType}d.`);
        setSelectedLeave(null);
        setActionType(null);
        fetchLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      header: 'Employee & Department',
      key: 'employeeName',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-100 block">{val}</span>
          <span className="text-[10px] text-dark-300">
            {row.department} • (ID: {row.employeeId})
          </span>
        </div>
      )
    },
    {
      header: 'Leave Type',
      key: 'leaveType',
      render: (val) => (
        <span className="font-semibold text-teal-300 flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5" /> {val}
        </span>
      )
    },
    {
      header: 'Absence Period',
      key: 'fromDate',
      render: (_, row) => (
        <div>
          <span className="text-xs font-semibold text-slate-200 block">
            {row.fromDate} to {row.toDate}
          </span>
          <span className="text-[10px] text-dark-400 font-mono">{row.duration} day(s) duration</span>
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
              Note: {row.adminComment}
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
      key: 'id',
      render: (_, row) => (
        <div>
          {row.status === 'Pending' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openActionModal(row, 'approve')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => openActionModal(row, 'reject')}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-dark-400">
              {row.status === 'Approved' ? 'Approved' : 'Rejected'} by {row.reviewedBy || 'HR'}
            </span>
          )}
        </div>
      )
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
            Leave & Absence Management
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Review employee time-off requests, authorize leaves, and update balance entitlements
          </p>
        </div>
      </div>

      {/* 2. KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Total Requests</span>
          <span className="text-2xl font-black text-slate-100 block mt-1">
            {summary?.total || 0}
          </span>
        </div>
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Pending Review</span>
          <span className="text-2xl font-black text-amber-400 block mt-1">
            {summary?.pending || 0}
          </span>
        </div>
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Approved</span>
          <span className="text-2xl font-black text-emerald-400 block mt-1">
            {summary?.approved || 0}
          </span>
        </div>
        <div className="card-surface p-4 text-center border-dark-700">
          <span className="text-[11px] text-dark-400 uppercase font-semibold">Rejected</span>
          <span className="text-2xl font-black text-rose-400 block mt-1">
            {summary?.rejected || 0}
          </span>
        </div>
      </div>

      {/* 3. Leave Requests Table */}
      <DataTable
        title="Leave Applications Directory"
        subtitle="All incoming and historical company-wide leave requests"
        columns={columns}
        data={leaves}
        filterKey="status"
        filterOptions={[
          { label: 'Pending', value: 'Pending' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Rejected', value: 'Rejected' },
          { label: 'Cancelled', value: 'Cancelled' }
        ]}
        pageSize={10}
      />

      {/* 4. Action Confirmation Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => {
          setSelectedLeave(null);
          setActionType(null);
        }}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
        subtitle={`Employee: ${selectedLeave?.employeeName} (${selectedLeave?.leaveType} - ${selectedLeave?.duration} day(s))`}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setSelectedLeave(null);
                setActionType(null);
              }}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              disabled={processing}
              className={`text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                actionType === 'approve'
                  ? 'btn-primary'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              {processing
                ? 'Updating...'
                : actionType === 'approve'
                ? 'Confirm Approval'
                : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-dark-850 border border-dark-700 text-xs space-y-1">
            <p className="text-dark-300">
              <span className="font-semibold text-slate-200">Dates:</span> {selectedLeave?.fromDate} to {selectedLeave?.toDate}
            </p>
            <p className="text-dark-300">
              <span className="font-semibold text-slate-200">Remarks:</span> {selectedLeave?.remarks}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              HR Review Remarks / Justification
            </label>
            <textarea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              className="input-field"
              placeholder="Add review feedback visible to the employee..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
