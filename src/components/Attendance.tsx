import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Clock, CheckCircle2, AlertCircle, 
  XCircle, Filter, Download, Plus, Search, Calendar, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AttendanceRecord, AttendanceStatus, Employee } from '../types';

export const Attendance: React.FC = () => {
  const { role, employee } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState('2026-09-17');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchEmployee, setSearchEmployee] = useState('');

  // Mark Modal
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [markData, setMarkData] = useState({
    employee_id: '',
    date: new Date().toISOString().substring(0, 10),
    check_in: '09:00',
    check_out: '17:00',
    status: 'present' as AttendanceStatus,
    notes: ''
  });

  const canManage = role === 'admin' || role === 'hr';

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = role === 'employee' && employee?.id
        ? `/api/attendance?employee_id=${employee.id}`
        : `/api/attendance?date=${selectedDate}`;

      const [attRes, empRes] = await Promise.all([
        fetch(url),
        fetch('/api/employees')
      ]);

      if (attRes.ok) setRecords(await attRes.json());
      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(emps);
        if (emps.length > 0 && !markData.employee_id) {
          setMarkData(prev => ({ ...prev, employee_id: emps[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, role, employee?.id]);

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markData)
      });
      if (res.ok) {
        setIsMarkModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Record ID', 'Employee Name', 'Department', 'Date', 'Check In', 'Check Out', 'Status', 'Total Hours', 'Notes'];
    const rows = records.map(r => [
      r.id,
      `"${r.employee_name || ''}"`,
      `"${r.department_name || ''}"`,
      r.date,
      r.check_in || '--',
      r.check_out || '--',
      r.status,
      r.total_hours || 0,
      `"${r.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_sheet_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter(r => {
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesSearch = !searchEmployee || (r.employee_name && r.employee_name.toLowerCase().includes(searchEmployee.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate stats for current view
  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const halfDayCount = records.filter(r => r.status === 'half_day').length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {role === 'employee' ? 'My Attendance History' : 'Daily Attendance Management'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor punctuality, track total logged hours, and review daily shift statuses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-export-attendance"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export Log
          </button>
          {canManage && (
            <button
              id="btn-mark-attendance-modal"
              onClick={() => setIsMarkModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Mark Attendance
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Present</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{presentCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Late Punches</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{lateCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Half-Day</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{halfDayCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs flex items-center gap-3">
          <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
            <XCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Absent</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{absentCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {role !== 'employee' && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                id="input-attendance-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <select
              id="select-attendance-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="late">Late Only</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            id="input-search-attendance-emp"
            type="text"
            placeholder="Search employee..."
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            className="w-48 sm:w-60 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Check In</th>
                <th className="px-5 py-3">Check Out</th>
                <th className="px-5 py-3">Hours Logged</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">Loading attendance data...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">No attendance entries found for this selection.</td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {rec.employee_name || 'Staff Member'}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{rec.department_name || 'General'}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-mono">{rec.date}</td>
                    <td className="px-5 py-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {rec.check_in || '--:--'}
                    </td>
                    <td className="px-5 py-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {rec.check_out || '--:--'}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {rec.total_hours ? `${rec.total_hours} hrs` : '--'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        rec.status === 'present' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                        rec.status === 'late' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' :
                        rec.status === 'half_day' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 truncate max-w-xs">{rec.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal (For HR / Admin) */}
      {isMarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Employee Attendance</h3>
              <button onClick={() => setIsMarkModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Select Employee *</label>
                <select
                  required
                  value={markData.employee_id}
                  onChange={(e) => setMarkData({ ...markData, employee_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.emp_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={markData.date}
                    onChange={(e) => setMarkData({ ...markData, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Status *</label>
                  <select
                    value={markData.status}
                    onChange={(e) => setMarkData({ ...markData, status: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              {markData.status !== 'absent' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300">Check In Time</label>
                    <input
                      type="time"
                      value={markData.check_in}
                      onChange={(e) => setMarkData({ ...markData, check_in: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300">Check Out Time</label>
                    <input
                      type="time"
                      value={markData.check_out}
                      onChange={(e) => setMarkData({ ...markData, check_out: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Notes / Remarks</label>
                <input
                  type="text"
                  value={markData.notes}
                  onChange={(e) => setMarkData({ ...markData, notes: e.target.value })}
                  placeholder="e.g. Field visit, morning client call"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMarkModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-attendance-record"
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
