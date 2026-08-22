import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  Star,
  CheckCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const AdminReviews = () => {
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Review Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    period: 'Q3 2026 (Jul - Sep)',
    score: 90,
    strengths: '',
    improvements: '',
    feedback: ''
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const [revRes, empRes] = await Promise.all([
        adminService.getReviews(),
        adminService.getEmployees()
      ]);

      if (revRes.success && revRes.data) {
        setReviews(revRes.data.reviews || []);
        setSummary(revRes.data.summary || null);
      }
      if (empRes.success && empRes.data) {
        setEmployees(empRes.data.employees || []);
        if (empRes.data.employees?.length > 0 && !formData.employeeId) {
          setFormData((prev) => ({ ...prev, employeeId: empRes.data.employees[0].employeeId }));
        }
      }
    } catch (err) {
      toast.error('Failed to load performance reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await adminService.createReview({
        ...formData,
        score: Number(formData.score)
      });

      if (res.success) {
        toast.success(res.message || 'Performance review published.');
        setIsAddModalOpen(false);
        setFormData({
          employeeId: employees[0]?.employeeId || '',
          period: 'Q3 2026 (Jul - Sep)',
          score: 90,
          strengths: '',
          improvements: '',
          feedback: ''
        });
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish review.');
    } finally {
      setSubmitting(false);
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
            {row.department} (ID: {row.employeeId})
          </span>
        </div>
      )
    },
    {
      header: 'Evaluation Period',
      key: 'period',
      render: (val) => <span className="text-slate-200 font-semibold">{val}</span>
    },
    {
      header: 'Reviewer',
      key: 'reviewer',
      render: (val, row) => (
        <span className="text-dark-300 text-xs">
          {val} ({row.reviewerRole})
        </span>
      )
    },
    {
      header: 'Score',
      key: 'score',
      render: (val) => (
        <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold font-mono text-xs">
          {val} / 100
        </span>
      )
    },
    {
      header: 'Rating Assessment',
      key: 'rating',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Review Date',
      key: 'reviewDate',
      render: (val) => <span className="text-dark-400 font-mono text-xs">{val}</span>
    }
  ];

  if (loading && !reviews.length) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={6} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="card-surface p-6 border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Performance Reviews & Talent Assessment
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            Conduct quarterly appraisals, evaluate KPIs, and track leadership feedback
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary text-xs font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Performance Review
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Average Company Score"
          value={`${summary?.averageCompanyScore || 0}%`}
          subtitle="Across all active departments"
          icon={Award}
          iconBg="bg-teal-500/15 text-teal-400 border-teal-500/30"
        />
        <StatCard
          title="Total Appraisals"
          value={`${summary?.totalReviews || 0} Reviews`}
          subtitle="Conducted cycles"
          icon={UserCheck}
          iconBg="bg-sky-500/15 text-sky-400 border-sky-500/30"
        />
        <StatCard
          title="Exceptional Performers"
          value={`${summary?.exceptionalCount || 0} Staff`}
          subtitle="Scored 95+ index"
          icon={Star}
          iconBg="bg-amber-500/15 text-amber-400 border-amber-500/30"
        />
        <StatCard
          title="Exceeds Expectations"
          value={`${summary?.exceedsCount || 0} Staff`}
          subtitle="Scored 85-94 index"
          icon={TrendingUp}
          iconBg="bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        />
      </div>

      {/* 3. Performance Reviews Table */}
      <DataTable
        title="Appraisal Records"
        subtitle="All evaluated employee reviews"
        columns={columns}
        data={reviews}
        pageSize={10}
      />

      {/* 4. Add Review Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publish Performance Appraisal"
        subtitle="Record assessment score and management feedback"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateReview}
              disabled={submitting}
              className="btn-primary text-xs font-semibold flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Publish Review'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateReview} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Select Employee
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="input-field"
                required
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.fullName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">
                Review Period
              </label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="input-field"
                placeholder="Q3 2026"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-dark-300">
                Evaluation Score (0 - 100)
              </label>
              <span className="font-mono font-bold text-teal-400 text-sm">
                {formData.score} / 100
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              Key Strengths & High-Impact Contributions
            </label>
            <input
              type="text"
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              className="input-field"
              placeholder="e.g. Excellent system architecture, zero critical bugs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              Areas for Growth & Target Goals
            </label>
            <input
              type="text"
              value={formData.improvements}
              onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              className="input-field"
              placeholder="e.g. Expand mentoring for junior team members"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-1.5">
              Detailed Executive Feedback
            </label>
            <textarea
              rows={3}
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              className="input-field"
              placeholder="Comprehensive performance assessment notes..."
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
