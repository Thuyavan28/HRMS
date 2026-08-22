import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Clock,
  Check,
  CheckCheck,
  Menu,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';

export const Navbar = ({ toggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Live Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('You have been logged out.');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-dark-800/90 backdrop-blur-md border-b border-dark-700 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Mobile Toggle & Live Time */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-dark-300 hover:text-slate-100 hover:bg-dark-700 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-dark-300 bg-dark-850 px-3 py-1.5 rounded-lg border border-dark-700">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-medium text-slate-200">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <span className="text-dark-500">|</span>
          <span className="font-mono text-teal-300">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Right side: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-dark-300 hover:text-slate-100 hover:bg-dark-750 border border-dark-700 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-dark-800 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-dark-800 border border-dark-600 rounded-2xl shadow-dropdown-dark overflow-hidden z-50 animate-scale-up">
              <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-dark-700/50">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-dark-750/70 transition-colors ${
                        !n.isRead ? 'bg-teal-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                            !n.isRead ? 'bg-teal-400' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-100">{n.title}</p>
                          <p className="text-[11px] text-dark-300 mt-0.5 leading-snug">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-dark-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-dark-400">
                    No new notifications right now.
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-dark-850 border-t border-dark-700 text-center">
                <Link
                  to={role === 'admin' ? '/admin/dashboard' : '/employee/notifications'}
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-teal-400 hover:text-teal-300"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-dark-750 hover:bg-dark-700 border border-dark-700 transition-colors cursor-pointer"
          >
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
              }
              alt={user?.fullName || 'User'}
              className="w-7 h-7 rounded-lg object-cover border border-teal-500/40"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-100 max-w-[110px] truncate leading-tight">
                {user?.fullName || 'User'}
              </span>
              <span className="text-[10px] text-teal-400 capitalize font-medium">
                {user?.role || 'Employee'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-dark-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-600 rounded-2xl shadow-dropdown-dark p-2 z-50 animate-scale-up">
              <div className="px-3 py-2 border-b border-dark-700 mb-1">
                <p className="text-xs font-semibold text-slate-100 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-dark-400 truncate">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 text-[10px] font-semibold border border-teal-500/20">
                  <Shield className="w-2.5 h-2.5" /> {user?.role?.toUpperCase()}
                </div>
              </div>

              {role === 'employee' ? (
                <Link
                  to="/employee/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-dark-300 hover:text-slate-100 hover:bg-dark-750 transition-colors"
                >
                  <User className="w-4 h-4 text-teal-400" /> My Profile
                </Link>
              ) : (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-dark-300 hover:text-slate-100 hover:bg-dark-750 transition-colors"
                >
                  <Shield className="w-4 h-4 text-teal-400" /> Admin Overview
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer mt-1"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
