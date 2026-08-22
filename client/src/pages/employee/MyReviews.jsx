import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SatisfactionGauge } from '../../components/charts/SatisfactionGauge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';

export const MyReviews = () => {
  const toast = useToast();

  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getMyReviews();
      if (res.success && res.data) {
        setReviewsData(res.data);
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

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard className="md:col-span-2" />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }

  const { reviews = [], latestReview, performanceScore = 0, summary } = reviewsData || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Performance Overview Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-surface p-6 flex flex-col justify-between border-dark-700 bg-gradient-to-r from-dark-800 to-dark-850">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Performance & Growth Telemetry</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              My Performance Reviews
            </h1>
            <p className="text-xs text-dark-300 mt-1">
              Evaluations, qualitative feedback, and leadership assessments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-dark-700">
            <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700">
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Latest Rating</span>
              <p className="text-sm font-bold text-teal-400 mt-1">{summary?.latestRating || 'N/A'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700">
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Latest Period</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{summary?.latestPeriod || 'N/A'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700">
              <span className="text-[11px] text-dark-400 uppercase font-semibold">Total Cycles</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{summary?.totalReviews || 0} Reviews</p>
            </div>
          </div>
        </div>

        {/* Performance Score Radial Gauge */}
        <SatisfactionGauge score={performanceScore} title="Average Performance Index" />
      </div>

      {/* 2. Review History Table with Accordion Expansion */}
      <div className="card-surface overflow-hidden">
        <div className="p-5 border-b border-dark-700">
          <h3 className="text-base font-semibold text-slate-100">Performance Cycle History</h3>
          <p className="text-xs text-dark-300">Click any cycle row to expand detailed manager feedback</p>
        </div>

        <div className="divide-y divide-dark-700/60">
          {reviews.map((rev) => {
            const isExpanded = expandedRow === rev.id;
            return (
              <div key={rev.id} className="transition-colors hover:bg-dark-750/40">
                {/* Row Summary */}
                <div
                  onClick={() => toggleRow(rev.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-sm">
                      {rev.score}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {rev.period}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-dark-750 text-dark-300 font-normal">
                          {rev.reviewDate}
                        </span>
                      </h4>
                      <p className="text-xs text-dark-300 mt-0.5">
                        Reviewed by <span className="text-slate-200">{rev.reviewer}</span> ({rev.reviewerRole})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={rev.rating} />
                    <button className="p-1.5 rounded-lg text-dark-400 hover:text-slate-100 hover:bg-dark-700">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Feedback Panel */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 bg-dark-850/60 border-t border-dark-700/50 space-y-4 animate-slide-in">
                    <div>
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">
                        Manager Executive Feedback
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-dark-800 p-4 rounded-xl border border-dark-700">
                        "{rev.feedback}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-dark-800 border border-dark-700">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Key Strengths & Achievements
                        </span>
                        <p className="text-dark-300 leading-relaxed">{rev.strengths}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-dark-800 border border-dark-700">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                          <TrendingUp className="w-4 h-4" /> Growth Areas & Focus Goals
                        </span>
                        <p className="text-dark-300 leading-relaxed">{rev.improvements}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
