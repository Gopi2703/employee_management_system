import React, { useState } from 'react';
import { 
  Bell, Sun, Moon, Shield, UserCheck, Briefcase, 
  Menu, ChevronDown, LogOut, User as UserIcon, CheckCircle2, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onToggleSidebar: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onToggleSidebar, onOpenLogin }) => {
  const { user, employee, role, theme, toggleTheme, logout, switchRole } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const formatTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Executive Dashboard & Analytics';
      case 'employees': return 'Employee Directory & Records';
      case 'departments': return 'Department & Org Hierarchy';
      case 'attendance': return 'Daily Attendance & Shifts';
      case 'leaves': return 'Leave Management & Balances';
      case 'payroll': return 'Payroll & Payslip Administration';
      case 'performance': return 'Performance Reviews & Appraisals';
      case 'documents': return 'Employee Document Center';
      case 'database': return 'MySQL Database Architecture & Schema';
      case 'audit': return 'System Security & Audit Trail';
      default: return 'Employee Management System';
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return { label: 'Admin', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50', icon: Shield };
      case 'hr':
        return { label: 'HR Manager', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50', icon: Briefcase };
      default:
        return { label: 'Employee', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50', icon: UserCheck };
    }
  };

  const badge = getRoleBadge(role);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 md:px-6 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-3">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
            {formatTabTitle(currentTab)}
          </h1>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Organization Human Resource & Operations Workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher for seamless demonstration/testing */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <span className="px-2 text-slate-400">Demo Role:</span>
          <button
            id="btn-switch-admin"
            onClick={() => switchRole('admin')}
            className={`px-2.5 py-1 rounded transition-all ${
              role === 'admin'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
          <button
            id="btn-switch-hr"
            onClick={() => switchRole('hr')}
            className={`px-2.5 py-1 rounded transition-all ${
              role === 'hr'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            HR Manager
          </button>
          <button
            id="btn-switch-employee"
            onClick={() => switchRole('employee')}
            className={`px-2.5 py-1 rounded transition-all ${
              role === 'employee'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Employee
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Notifications</span>
                <span className="rounded bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                  2 Pending
                </span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="mt-0.5 rounded-full bg-amber-500/10 p-1 text-amber-600">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">Leave Approval Pending</p>
                    <p className="text-[11px] text-slate-500">Marcus Chen requested 2 days of Casual Leave</p>
                    <span className="text-[10px] text-slate-400">2 hours ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">September Payroll Dispatched</p>
                    <p className="text-[11px] text-slate-500">Payroll cycles finalized with direct bank credits</p>
                    <span className="text-[10px] text-slate-400">Today, 08:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Account menu */}
        {user ? (
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 pr-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={employee?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={employee ? `${employee.first_name} ${employee.last_name}` : user.username}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
              />
              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">
                  {employee ? `${employee.first_name} ${employee.last_name}` : user.username}
                </p>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.2 text-[10px] font-medium ${badge.color}`}>
                    <BadgeIcon className="h-2.5 w-2.5" />
                    {badge.label}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50">
                <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {employee ? `${employee.first_name} ${employee.last_name}` : user.username}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <p className="mt-1 text-[10px] text-slate-400">Employee Code: {employee?.emp_code || 'EMP-ADMIN'}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenLogin();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    Switch User / Log In
                  </button>
                  <button
                    id="btn-logout"
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            id="btn-open-login"
            onClick={onOpenLogin}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
