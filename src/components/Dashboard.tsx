import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, CalendarCheck, Clock, PlaneTakeoff, 
  CreditCard, TrendingUp, AlertCircle, ArrowUpRight, 
  CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats, AttendanceRecord } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, employee, role } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttendance = async () => {
    if (!employee?.id) return;
    try {
      const today = new Date().toISOString().substring(0, 10);
      const res = await fetch(`/api/attendance?employee_id=${employee.id}&date=${today}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setTodayAttendance(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching today attendance:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchMyAttendance();
  }, [employee?.id]);

  const handleSelfCheckIn = async () => {
    if (!employee?.id) return;
    try {
      setCheckingIn(true);
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employee.id })
      });
      if (res.ok) {
        const record = await res.json();
        setTodayAttendance(record);
        fetchDashboardStats();
      }
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleSelfCheckOut = async () => {
    if (!employee?.id) return;
    try {
      setCheckingIn(true);
      const res = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employee.id })
      });
      if (res.ok) {
        const record = await res.json();
        setTodayAttendance(record);
        fetchDashboardStats();
      }
    } catch (err) {
      console.error('Check-out failed:', err);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner and Check-in Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-xs">
              <span>Organization Operations Portal</span>
              <span>•</span>
              <span className="capitalize">{role} View</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {employee ? `${employee.first_name} ${employee.last_name}` : user?.username}!
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
              {role === 'employee' 
                ? 'Check your attendance status, submit time-off requests, and review your monthly payslips.'
                : 'Monitor departmental personnel, track daily shift check-ins, approve pending leaves, and process monthly payroll.'}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 pt-2">
            <button
              id="btn-quick-employees"
              onClick={() => onNavigate('employees')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-xs"
            >
              <Users className="h-4 w-4" />
              Directory
            </button>
            <button
              id="btn-quick-attendance"
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-800/60 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors border border-white/20"
            >
              <CalendarCheck className="h-4 w-4" />
              Attendance Sheets
            </button>
            <button
              id="btn-quick-leaves"
              onClick={() => onNavigate('leaves')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-800/60 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors border border-white/20"
            >
              <PlaneTakeoff className="h-4 w-4" />
              Leaves {stats?.pendingLeaves ? `(${stats.pendingLeaves})` : ''}
            </button>
            {role !== 'employee' && (
              <button
                id="btn-quick-payroll"
                onClick={() => onNavigate('payroll')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-800/60 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors border border-white/20"
              >
                <CreditCard className="h-4 w-4" />
                Payroll
              </button>
            )}
          </div>
        </div>

        {/* Self Attendance Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">My Shift Punch</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <Clock className="h-3 w-3" />
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>Check-in:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{todayAttendance?.check_in || 'Not punched'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>Check-out:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{todayAttendance?.check_out || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Status:</span>
                <span className={`font-semibold capitalize ${
                  todayAttendance?.status === 'present' ? 'text-emerald-600' :
                  todayAttendance?.status === 'late' ? 'text-amber-600' : 'text-slate-500'
                }`}>
                  {todayAttendance?.status || 'Not recorded'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2">
            {!todayAttendance?.check_in ? (
              <button
                id="btn-self-checkin"
                onClick={handleSelfCheckIn}
                disabled={checkingIn}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {checkingIn ? 'Punching In...' : 'Punch In Now'}
              </button>
            ) : !todayAttendance.check_out ? (
              <button
                id="btn-self-checkout"
                onClick={handleSelfCheckOut}
                disabled={checkingIn}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                {checkingIn ? 'Punching Out...' : 'Punch Out Now'}
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2 text-center text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Shift completed for today ({todayAttendance.total_hours || 8} hrs)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div 
          onClick={() => onNavigate('employees')}
          className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Employees</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.totalEmployees ?? '--'}
          </p>
          <span className="text-[11px] text-emerald-600 flex items-center gap-0.5 mt-1">
            <span className="font-semibold">{stats?.activeEmployees || 0}</span> active staff
          </span>
        </div>

        <div 
          onClick={() => onNavigate('departments')}
          className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-indigo-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Departments</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.totalDepartments ?? '--'}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">5 Org divisions</span>
        </div>

        <div 
          onClick={() => onNavigate('attendance')}
          className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Present Today</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.presentToday ?? '--'}
          </p>
          <span className="text-[11px] text-amber-600 mt-1 block">
            {stats?.lateToday || 0} late punches
          </span>
        </div>

        <div 
          onClick={() => onNavigate('leaves')}
          className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Pending Leaves</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <PlaneTakeoff className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.pendingLeaves ?? '--'}
          </p>
          <span className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
            Requires review
          </span>
        </div>

        <div 
          onClick={() => onNavigate('payroll')}
          className="group cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-purple-500/50 transition-all col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Monthly Payroll</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            ${stats ? (stats.totalMonthlyPayroll / 1000).toFixed(1) + 'k' : '--'}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Disbursed for Sept</span>
        </div>
      </div>

      {/* Visual Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance Status & Weekly Trend Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Attendance Trends</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Workforce presence and shift punctuality</p>
            </div>
            <button 
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Full Sheet <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {/* Custom SVG Bar Chart */}
            <div className="flex items-end justify-between h-40 pt-4 px-2">
              {stats?.attendanceTrend?.map((item) => {
                const total = item.present + item.absent + item.late;
                const maxVal = 6;
                const presentHeight = (item.present / maxVal) * 100;
                const lateHeight = (item.late / maxVal) * 100;
                const absentHeight = (item.absent / maxVal) * 100;

                return (
                  <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-8 flex flex-col justify-end h-32 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden p-0.5">
                      {absentHeight > 0 && (
                        <div 
                          style={{ height: `${absentHeight}%` }} 
                          className="w-full bg-rose-500 rounded-t-xs" 
                          title={`Absent: ${item.absent}`}
                        />
                      )}
                      {lateHeight > 0 && (
                        <div 
                          style={{ height: `${lateHeight}%` }} 
                          className="w-full bg-amber-500" 
                          title={`Late: ${item.late}`}
                        />
                      )}
                      <div 
                        style={{ height: `${presentHeight}%` }} 
                        className="w-full bg-blue-600 rounded-b-xs" 
                        title={`Present: ${item.present}`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.day}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="h-3 w-3 rounded bg-blue-600"></span> Present
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="h-3 w-3 rounded bg-amber-500"></span> Late
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="h-3 w-3 rounded bg-rose-500"></span> Absent
              </span>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Headcount</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Staff distribution across organizational units</p>
            </div>
            <button 
              onClick={() => onNavigate('departments')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Org Chart <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {stats?.departmentDistribution?.map((dept) => {
              const total = stats.totalEmployees || 1;
              const percentage = Math.round((dept.count / total) * 100);

              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{dept.count} members ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%`, backgroundColor: dept.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Live Attendance Feed & Pending Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Employee Attendance Roster</h3>
            <span className="text-xs text-slate-400">Live Status</span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5">Employee</th>
                  <th className="py-2.5">Department</th>
                  <th className="py-2.5">Check In</th>
                  <th className="py-2.5">Check Out</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.recentAttendance?.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100">
                      {rec.employee_name}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {rec.department_name}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300 font-mono">
                      {rec.check_in || '--'}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300 font-mono">
                      {rec.check_out || '--'}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        rec.status === 'present' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                        rec.status === 'late' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' :
                        rec.status === 'half_day' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Architecture and MySQL Quick Spec */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Database & System</h3>
              <span className="rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 text-[10px] font-mono px-2 py-0.5">
                MySQL 8.0
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Normalized relational schema with foreign key constraints, indexes, and full CRUD APIs.
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Relational Tables:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">12 Tables</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">RBAC Enforcement:</span>
                <span className="font-semibold text-emerald-600">Admin, HR, Staff</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Schema File:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">schema.sql</span>
              </div>
            </div>
          </div>

          <button
            id="btn-inspect-database"
            onClick={() => onNavigate('database')}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2.5 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            <span>View SQL Schema & ER Model</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
