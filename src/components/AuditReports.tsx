import React, { useState, useEffect } from 'react';
import { 
  Shield, FileBarChart, Download, Filter, 
  Activity, Clock, User, CheckCircle2, AlertTriangle, 
  Database, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AuditLog } from '../types';

export const AuditReports: React.FC = () => {
  const { role } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  // Reports state
  const [activeReportTab, setActiveReportTab] = useState<'audit' | 'analytics'>('audit');
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const [logsRes, analyticsRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/analytics')
      ]);

      if (logsRes.ok) setLogs(await logsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportAuditCSV = () => {
    const headers = ['Log ID', 'User', 'Action', 'Entity', 'Entity ID', 'Details', 'IP Address', 'Timestamp'];
    const rows = logs.map(l => [
      l.id,
      `"${l.user_email || 'System'}"`,
      l.action,
      l.entity,
      l.entity_id || '',
      `"${l.details || ''}"`,
      l.ip_address,
      l.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_audit_log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(l => actionFilter === 'all' || l.action === actionFilter);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            Audit Trails & Operational Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor administrative operations, user access logins, and generate compliance reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-audit"
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            id="btn-export-audit"
            onClick={handleExportAuditCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export Audit Trail
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveReportTab('audit')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeReportTab === 'audit'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Security Audit Log ({logs.length})
        </button>
        <button
          onClick={() => setActiveReportTab('analytics')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeReportTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileBarChart className="h-3.5 w-3.5" />
          Executive Analytics Breakdown
        </button>
      </div>

      {activeReportTab === 'audit' ? (
        <div className="space-y-4">
          {/* Action Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                id="select-audit-action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Audit Actions</option>
                <option value="LOGIN">User Logins</option>
                <option value="ATTENDANCE_CHECKIN">Attendance Check-in</option>
                <option value="ATTENDANCE_CHECKOUT">Attendance Check-out</option>
                <option value="LEAVE_REQUEST">Leave Submissions</option>
                <option value="EMPLOYEE_CREATE">Employee Additions</option>
                <option value="EMPLOYEE_UPDATE">Employee Updates</option>
                <option value="EMPLOYEE_DELETE">Employee Deletions</option>
              </select>
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredLogs.length} events logged in database
            </span>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Initiated By</th>
                    <th className="px-5 py-3">Event Action</th>
                    <th className="px-5 py-3">Target Entity</th>
                    <th className="px-5 py-3">Details & Parameters</th>
                    <th className="px-5 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading audit records...</td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No events found for this filter.</td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3 font-mono text-slate-500 whitespace-nowrap">
                          {log.created_at}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {log.user_email || 'System'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ${
                            log.action.includes('DELETE') ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                            log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            log.action.includes('LOGIN') ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                          {log.entity}
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-md truncate">
                          {log.details}
                        </td>
                        <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                          {log.ip_address}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Analytics Summary Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Department Breakdown */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                Department Distribution & Headcount
              </h3>
              <div className="space-y-3 text-xs">
                {analytics?.dept_stats?.map((dept: any) => (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{dept.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{dept.count} members</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, (dept.count / (analytics?.total_employees || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Overview */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                Organizational Attendance Health
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Present Today</span>
                  <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                    {analytics?.attendance_summary?.present || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Late Arrivals</span>
                  <p className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-1">
                    {analytics?.attendance_summary?.late || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                  <span className="text-blue-700 dark:text-blue-400 font-medium">Half Day Logs</span>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-1">
                    {analytics?.attendance_summary?.half_day || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30">
                  <span className="text-rose-700 dark:text-rose-400 font-medium">Absenteeism</span>
                  <p className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-1">
                    {analytics?.attendance_summary?.absent || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
