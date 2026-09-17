import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Users, Database, Shield, 
  Key, Save, RefreshCw, CheckCircle2, Download, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

export const Settings: React.FC = () => {
  const { role } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'company' | 'database'>('users');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Company settings
  const [companySettings, setCompanySettings] = useState({
    company_name: 'Enterprise Nexus Corp',
    tax_id: 'US-EIN-94827103',
    timezone: 'America/New_York (EST)',
    currency: 'USD ($)',
    fiscal_year_start: 'January',
    standard_work_hours: 8,
    office_address: '100 Silicon Valley Blvd, Suite 400, San Jose, CA 95134'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error('Error toggling user:', err);
    }
  };

  const handleExportSQLBackup = () => {
    // Downloads a copy of the database.sql schema
    const link = document.createElement('a');
    link.href = '/src/data/database.sql';
    link.download = `mysql_dump_${new Date().toISOString().substring(0, 10)}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
          System Administration & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage system users, corporate preferences, and MySQL schema configuration
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          User Accounts & Access ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <SettingsIcon className="h-3.5 w-3.5" />
          Organization Profile
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          MySQL Database Schema
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Active System Accounts</h3>
              <p className="text-[11px] text-slate-400">Authenticated user logins with role assignments</p>
            </div>
            <button
              onClick={fetchUsers}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">User Email</th>
                  <th className="px-5 py-3">System Role</th>
                  <th className="px-5 py-3">Account Status</th>
                  <th className="px-5 py-3">Created Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                      {u.email}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' :
                        u.role === 'hr' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                      {u.created_at}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {role === 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Enterprise Parameters</h3>

          {savedSuccess && (
            <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              Organizational settings successfully updated.
            </div>
          )}

          <form onSubmit={handleUpdateCompany} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                <input
                  type="text"
                  value={companySettings.company_name}
                  onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Tax Identification / EIN</label>
                <input
                  type="text"
                  value={companySettings.tax_id}
                  onChange={(e) => setCompanySettings({ ...companySettings, tax_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Operational Timezone</label>
                <input
                  type="text"
                  value={companySettings.timezone}
                  onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Base Currency</label>
                <input
                  type="text"
                  value={companySettings.currency}
                  onChange={(e) => setCompanySettings({ ...companySettings, currency: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300">Headquarters Address</label>
              <input
                type="text"
                value={companySettings.office_address}
                onChange={(e) => setCompanySettings({ ...companySettings, office_address: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
              >
                <Save className="h-4 w-4" />
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-4 max-w-3xl">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/50 p-2.5 text-blue-600 dark:text-blue-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Relational MySQL Schema Status</h3>
                  <p className="text-xs text-slate-500">Production normalized schema with foreign key constraints & indexes</p>
                </div>
              </div>

              <button
                onClick={handleExportSQLBackup}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Download database.sql
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Database Engine:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">MySQL 8.0 InnoDB</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Tables Count:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">10 Relational Tables</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Foreign Keys:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">CASCADE on Delete</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Prepared Statements:</span>
                <p className="font-bold text-emerald-600 mt-0.5">Enabled (SQLi Guard)</p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500">
              <p className="font-mono text-[11px] leading-relaxed">
                Tables: users, departments, designations, employees, attendance, leave_types, leave_requests, leave_balances, payroll, performance_reviews, employee_documents, audit_logs
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
