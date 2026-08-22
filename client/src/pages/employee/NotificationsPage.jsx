import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Calendar,
  CreditCard,
  Award,
  Clock,
  Filter
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const NotificationsPage = () => {
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to update notifications.');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      // quiet fail
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.isRead;
    return n.type === filterType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'leave':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'payroll':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'review':
        return <Award className="w-4 h-4 text-teal-400" />;
      default:
        return <Clock className="w-4 h-4 text-sky-400" />;
    }
  };

  if (loading) {
    return <SkeletonTable rows={6} cols={3} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-dark-700">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-dark-300 mt-1">
            System broadcasts, workflow alerts, and request updates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field py-2 text-xs"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="leave">Leave Alerts</option>
            <option value="payroll">Payroll Updates</option>
            <option value="review">Review Notices</option>
          </select>

          <button
            onClick={handleMarkAllRead}
            className="btn-secondary text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4 text-teal-400" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="card-surface divide-y divide-dark-700/60 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkSingleRead(item.id)}
              className={`p-5 flex items-start gap-4 transition-colors hover:bg-dark-750/50 cursor-pointer ${
                !item.isRead ? 'bg-teal-500/5' : ''
              }`}
            >
              <div className="p-3 rounded-xl bg-dark-850 border border-dark-700 flex-shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    {item.title}
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0 animate-pulse" />
                    )}
                  </h3>
                  <span className="text-[11px] text-dark-400 font-mono flex-shrink-0">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-xs text-dark-300 mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up! There are no notifications to display in this view."
            />
          </div>
        )}
      </div>
    </div>
  );
};
