import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Download, Printer, Plus, CheckCircle2, 
  Clock, AlertCircle, FileText, X, Building2, UserCheck, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PayrollRecord, Employee } from '../types';

export const Payroll: React.FC = () => {
  const { role, employee } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Payslip Modal
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  // Create Payroll Entry Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPay, setNewPay] = useState({
    employee_id: '',
    month: 'September 2026',
    basic_salary: 6000,
    allowances: 1200,
    deductions: 800,
    status: 'paid' as 'paid' | 'pending' | 'processing',
    payment_method: 'Direct Deposit',
    payment_date: new Date().toISOString().substring(0, 10)
  });

  const canManage = role === 'admin' || role === 'hr';

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = role === 'employee' && employee?.id
        ? `/api/payroll?employee_id=${employee.id}`
        : `/api/payroll?month=${encodeURIComponent(selectedMonth)}`;

      const [payRes, empRes] = await Promise.all([
        fetch(url),
        fetch('/api/employees')
      ]);

      if (payRes.ok) setPayrolls(await payRes.json());
      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(emps);
        if (emps.length > 0 && !newPay.employee_id) {
          setNewPay(prev => ({ ...prev, employee_id: emps[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load payroll records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, role, employee?.id]);

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const net_salary = newPay.basic_salary + newPay.allowances - newPay.deductions;
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPay,
          net_salary
        })
      });

      if (res.ok) {
        setIsGenerateModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error generating payroll record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewPayslip = (p: PayrollRecord) => {
    setSelectedPayslip(p);
    setIsPayslipOpen(true);
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  const filteredPayrolls = payrolls.filter(p => selectedStatus === 'all' || p.status === selectedStatus);

  const totalDisbursed = payrolls.reduce((sum, p) => sum + (p.status === 'paid' ? p.net_salary : 0), 0);
  const totalPending = payrolls.reduce((sum, p) => sum + (p.status !== 'paid' ? p.net_salary : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {role === 'employee' ? 'My Payslips & Compensation' : 'Salary & Payroll Processing'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate allowances, apply statutory deductions, and generate official paystubs
          </p>
        </div>

        {canManage && (
          <button
            id="btn-generate-paystub"
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Generate Payroll Slip
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Disbursed ({selectedMonth})</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${totalDisbursed.toLocaleString()}
            </span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              Processed
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Pending Approvals</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ${totalPending.toLocaleString()}
            </span>
            <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              Pending
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Active Payroll Cycle</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedMonth}</span>
            <span className="text-xs text-slate-400">Monthly</span>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <select
            id="select-payroll-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>

          <select
            id="select-payroll-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Pay Period</th>
                <th className="px-5 py-3">Basic Salary</th>
                <th className="px-5 py-3">Allowances</th>
                <th className="px-5 py-3">Deductions</th>
                <th className="px-5 py-3 font-bold text-slate-900 dark:text-white">Net Pay</th>
                <th className="px-5 py-3">Payment Info</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-400">Loading payroll entries...</td>
                </tr>
              ) : filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-400">No payroll records found for this period.</td>
                </tr>
              ) : (
                filteredPayrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      <div>{p.employee_name || 'Staff Member'}</div>
                      <div className="text-[10px] text-slate-400">{p.department_name}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-medium">{p.month}</td>
                    <td className="px-5 py-3 font-mono text-slate-700 dark:text-slate-300">
                      ${p.basic_salary.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-mono text-emerald-600 dark:text-emerald-400">
                      +${(p.allowances || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-mono text-rose-600 dark:text-rose-400">
                      -${(p.deductions || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ${p.net_salary.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <div>{p.payment_method || 'Bank Transfer'}</div>
                      <div className="text-[10px] text-slate-400">{p.payment_date}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                        p.status === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                        p.status === 'processing' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        id={`btn-view-payslip-${p.id}`}
                        onClick={() => handleViewPayslip(p)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Payslip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Slip Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Salary Disbursement</h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePayroll} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Employee *</label>
                <select
                  required
                  value={newPay.employee_id}
                  onChange={(e) => setNewPay({ ...newPay, employee_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name} (${e.salary}/yr)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Pay Cycle Month</label>
                <input
                  type="text"
                  value={newPay.month}
                  onChange={(e) => setNewPay({ ...newPay, month: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Basic ($)</label>
                  <input
                    type="number"
                    required
                    value={newPay.basic_salary}
                    onChange={(e) => setNewPay({ ...newPay, basic_salary: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Allowances</label>
                  <input
                    type="number"
                    value={newPay.allowances}
                    onChange={(e) => setNewPay({ ...newPay, allowances: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Deductions</label>
                  <input
                    type="number"
                    value={newPay.deductions}
                    onChange={(e) => setNewPay({ ...newPay, deductions: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-3 text-xs flex justify-between items-center">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Computed Net Salary:</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  ${(newPay.basic_salary + newPay.allowances - newPay.deductions).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={newPay.status}
                    onChange={(e) => setNewPay({ ...newPay, status: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Payment Date</label>
                  <input
                    type="date"
                    value={newPay.payment_date}
                    onChange={(e) => setNewPay({ ...newPay, payment_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-payroll-record"
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Disburse Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payslip Printable Modal */}
      {isPayslipOpen && selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none">
            {/* Header / Brand */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                    HR
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white">Enterprise Nexus Corp</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">100 Silicon Valley Blvd, Suite 400 • HR & Finance Division</p>
              </div>
              <div className="text-right">
                <span className="rounded bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Official Paystub
                </span>
                <p className="text-xs text-slate-500 font-mono mt-1">Ref: {selectedPayslip.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Employee info banner */}
            <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-xs">
              <div>
                <span className="text-slate-400">Employee Name:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedPayslip.employee_name}</p>
                <p className="text-slate-500">{selectedPayslip.department_name}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Pay Period:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedPayslip.month}</p>
                <span className="text-slate-400">Disbursed via {selectedPayslip.payment_method}</span>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="mt-5 grid grid-cols-2 gap-6 text-xs">
              {/* Earnings column */}
              <div className="space-y-2 border-r border-slate-100 dark:border-slate-800 pr-4">
                <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                  Earnings
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Basic Wage:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">${selectedPayslip.basic_salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Housing & Travel:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">${((selectedPayslip.allowances || 0) * 0.6).toFixed(0)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Special Allowance:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">${((selectedPayslip.allowances || 0) * 0.4).toFixed(0)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-semibold">
                  <span>Gross Earnings:</span>
                  <span className="font-mono text-emerald-600">${(selectedPayslip.basic_salary + (selectedPayslip.allowances || 0)).toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions column */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                  Deductions
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Statutory Income Tax:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">${((selectedPayslip.deductions || 0) * 0.7).toFixed(0)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Health & Life Insurance:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">${((selectedPayslip.deductions || 0) * 0.3).toFixed(0)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-semibold">
                  <span>Total Deductions:</span>
                  <span className="font-mono text-rose-600">-${(selectedPayslip.deductions || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net pay callout */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-950/40 p-4 border border-blue-100 dark:border-blue-900/50">
              <div>
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wide">Net Take-Home Pay</span>
                <p className="text-[11px] text-blue-600 dark:text-blue-400">Deposited on {selectedPayslip.payment_date}</p>
              </div>
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
                ${selectedPayslip.net_salary.toLocaleString()}
              </span>
            </div>

            {/* Actions footer */}
            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 print:hidden">
              <button
                onClick={() => setIsPayslipOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
              >
                Close
              </button>
              <button
                id="btn-print-slip"
                onClick={handlePrintPayslip}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
              >
                <Printer className="h-4 w-4" />
                Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
