import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarCheck,
  CreditCard,
  Award,
  Bell,
  Users,
  Building2,
  PieChart,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    toast.info('You have been signed out.');
    navigate('/login');
  };

  useEffect(() => {
    if (role === 'employee') {
      const fetchUnread = async () => {
        try {
          const res = await notificationService.getMyNotifications();
          if (res.success && res.data) {
            const count = (res.data.notifications || []).filter(n => !n.isRead).length;
            setUnreadCount(count);
          }
        } catch (_) {}
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 60000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const employeeNav = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/employee/profile', icon: User },
    { name: 'My Attendance', path: '/employee/attendance', icon: Clock },
    { name: 'Leave Requests', path: '/employee/leaves', icon: CalendarCheck },
    { name: 'My Payroll', path: '/employee/payroll', icon: CreditCard },
    { name: 'My Reviews', path: '/employee/reviews', icon: Award },
    { name: 'Notifications', path: '/employee/notifications', icon: Bell }
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Attendance', path: '/admin/attendance', icon: Clock },
    { name: 'Leave Requests', path: '/admin/leaves', icon: CalendarCheck },
    { name: 'Payroll', path: '/admin/payroll', icon: CreditCard },
    { name: 'Payroll Run', path: '/admin/payroll-run', icon: Layers },
    { name: 'Finance', path: '/admin/finance', icon: PieChart },
    { name: 'Time Mgmt', path: '/admin/time-management', icon: Calendar },
    { name: 'Reviews', path: '/admin/reviews', icon: Award }
  ];

  const navItems = role === 'admin' ? adminNav : employeeNav;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-dark-800 border-r border-dark-700 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Banner */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-dark-700">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-glow-teal-sm flex-shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-100 flex items-center gap-1.5">
                  Dayflow
                  {role === 'admin' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      ADMIN
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-dark-300 truncate">
                  Every workday, perfectly aligned.
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-glow-teal-sm">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-dark-400">
            {!isCollapsed ? (role === 'admin' ? 'HR Operations' : 'Employee Self-Service') : '•'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-teal-500 text-white font-semibold shadow-glow-teal-sm'
                      : 'text-dark-300 hover:text-slate-100 hover:bg-dark-750'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-dark-400 group-hover:text-teal-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}

                {/* Unread notification badge */}
                {item.path === '/employee/notifications' && unreadCount > 0 && (
                  <span className={`flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}

                {/* Collapsed Tooltip Indicator */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-dark-850 text-slate-100 text-xs rounded-lg border border-dark-600 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile / Sign Out / Collapse Controls */}
      <div className="p-3 border-t border-dark-700 bg-dark-850/50 space-y-2">
        {!isCollapsed && user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-dark-800 border border-dark-700">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-teal-500/50 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">{user.fullName}</p>
                <p className="text-[10px] text-dark-300 capitalize">{user.role} Portal</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-dark-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
              title="Sign Out / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : isCollapsed && user ? (
          <div className="flex flex-col items-center">
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-dark-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-dark-400 hover:text-slate-100 hover:bg-dark-700 transition-colors text-xs font-medium cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
