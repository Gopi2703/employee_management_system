import React from 'react';
import { 
  LayoutDashboard, Users, Building2, CalendarCheck, 
  PlaneTakeoff, CreditCard, Award, FileText, Database, 
  ShieldAlert, X, Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { role } = useAuth();

  const navigationItems = [
    {
      section: 'Core Modules',
      items: [
        { id: 'dashboard', label: 'Dashboard & Reports', icon: LayoutDashboard, roles: ['admin', 'hr', 'employee'] },
        { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'hr', 'employee'] },
        { id: 'departments', label: 'Departments', icon: Building2, roles: ['admin', 'hr'] },
      ]
    },
    {
      section: 'Time & Leave',
      items: [
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'hr', 'employee'] },
        { id: 'leaves', label: 'Leave Requests', icon: PlaneTakeoff, roles: ['admin', 'hr', 'employee'] },
      ]
    },
    {
      section: 'Compensation & Growth',
      items: [
        { id: 'payroll', label: role === 'employee' ? 'My Payslips' : 'Payroll Management', icon: CreditCard, roles: ['admin', 'hr', 'employee'] },
        { id: 'performance', label: 'Performance Reviews', icon: Award, roles: ['admin', 'hr', 'employee'] },
        { id: 'documents', label: 'Document Vault', icon: FileText, roles: ['admin', 'hr', 'employee'] },
      ]
    },
    {
      section: 'System & Architecture',
      items: [
        { id: 'database', label: 'MySQL Schema & Setup', icon: Database, roles: ['admin', 'hr', 'employee'] },
        { id: 'audit', label: 'Audit Logs', icon: ShieldAlert, roles: ['admin'] },
      ]
    }
  ];

  const handleSelect = (tabId: string) => {
    onSelectTab(tabId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Enterprise EMS
              </span>
              <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                HR & Payroll Portal
              </span>
            </div>
          </div>
          <button
            id="btn-close-sidebar"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-5">
          {navigationItems.map(group => {
            const visibleItems = group.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.section} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.section}
                </p>
                <div className="space-y-0.5 pt-1">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        id={`nav-${item.id}`}
                        onClick={() => handleSelect(item.id)}
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom system status badge */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Database Engine</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              MySQL 8.0 Relational Model
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
              <span className="rounded bg-slate-200/80 dark:bg-slate-700 px-1 py-0.5">REST API: Active</span>
              <span className="rounded bg-slate-200/80 dark:bg-slate-700 px-1 py-0.5">Port 3000</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
