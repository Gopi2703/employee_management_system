import React, { useState, useEffect } from 'react';
import { 
  PlaneTakeoff, Plus, Check, X, Clock, Calendar, 
  AlertCircle, CheckCircle2, XCircle, FileText, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { LeaveRequest, LeaveType, LeaveBalance, LeaveStatus } from '../types';

export const LeaveManagement: React.FC = () => {
  const { role, employee, user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [applyForm, setApplyForm] = useState({
    leave_type_id: '',
    start_date: new Date().toISOString().substring(0, 10),
    end_date: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
    reason: ''
  });

  const canReview = role === 'admin' || role === 'hr';

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = role === 'employee' && employee?.id
        ? `/api/leaves?employee_id=${employee.id}`
        : '/api/leaves';

      const [leavesRes, typesRes] = await Promise.all([
        fetch(url),
        fetch('/api/leaves/types')
      ]);

      if (leavesRes.ok) setLeaves(await leavesRes.json());
      if (typesRes.ok) {
        const types = await typesRes.json();
        setLeaveTypes(types);
        if (types.length > 0 && !applyForm.leave_type_id) {
          setApplyForm(prev => ({ ...prev, leave_type_id: types[0].id }));
        }
      }

      if (employee?.id) {
        const balRes = await fetch(`/api/leaves/balances/${employee.id}`);
        if (balRes.ok) setBalances(await balRes.json());
      }
    } catch (err) {
      console.error('Failed to load leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, employee?.id]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.id) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employee.id,
          ...applyForm
        })
      });

      if (res.ok) {
        setIsApplyModalOpen(false);
        setApplyForm({
          leave_type_id: leaveTypes[0]?.id || '',
          start_date: new Date().toISOString().substring(0, 10),
          end_date: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
          reason: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error applying for leave:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReview = (leave: LeaveRequest, action: 'approved' | 'rejected') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewerComment(action === 'approved' ? 'Approved by HR.' : 'Request cannot be accommodated at this time.');
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedLeave) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/leaves/${selectedLeave.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewAction,
          reviewer_id: user?.id,
          reviewer_name: employee ? `${employee.first_name} ${employee.last_name}` : 'HR Manager',
          reviewer_comment: reviewerComment
        })
      });

      if (res.ok) {
        setIsReviewModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error updating leave request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter(l => statusFilter === 'all' || l.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {role === 'employee' ? 'My Leave Applications' : 'Leave Requests & Approvals'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit vacation and sick days, verify available quotas, and track approvals
          </p>
        </div>

        <button
          id="btn-apply-leave"
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balance Quotas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {(balances.length > 0 ? balances : [
          { id: 'b1', leave_type_name: 'Casual Leave', total_days: 12, used_days: 2, remaining_days: 10 },
          { id: 'b2', leave_type_name: 'Sick Leave', total_days: 10, used_days: 1, remaining_days: 9 },
          { id: 'b3', leave_type_name: 'Annual Vacation', total_days: 15, used_days: 4, remaining_days: 11 },
          { id: 'b4', leave_type_name: 'Maternity/Paternity', total_days: 90, used_days: 0, remaining_days: 90 },
          { id: 'b5', leave_type_name: 'Unpaid Leave', total_days: 30, used_days: 0, remaining_days: 30 }
        ]).map((bal) => (
          <div
            key={bal.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold truncate">{bal.leave_type_name}</span>
              <PlaneTakeoff className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {bal.remaining_days}
              </span>
              <span className="text-xs text-slate-400">/ {bal.total_days} days left</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${Math.min(100, ((bal.used_days) / bal.total_days) * 100)}%` }}
              />
            </div>
            <span className="mt-1.5 block text-[10px] text-slate-400">
              {bal.used_days} days utilized
            </span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(st => (
            <button
              key={st}
              id={`tab-leave-${st}`}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st} {st === 'pending' && leaves.filter(l => l.status === 'pending').length > 0 ? `(${leaves.filter(l => l.status === 'pending').length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Leave Type</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Reviewer Details</th>
                {canReview && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">Loading leave requests...</td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">No leave requests found.</td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{l.employee_name}</p>
                      <p className="text-[10px] text-slate-400">{l.department_name}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {l.leave_type_name}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-400">
                      {l.start_date} to {l.end_date}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-200">
                      {l.total_days} {l.total_days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                        l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                        l.status === 'rejected' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-[11px]">
                      {l.reviewer_name ? (
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{l.reviewer_name}</p>
                          {l.reviewer_comment && (
                            <p className="text-[10px] text-slate-400 italic">"{l.reviewer_comment}"</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Awaiting review</span>
                      )}
                    </td>

                    {canReview && (
                      <td className="px-5 py-3 text-right">
                        {l.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`btn-approve-leave-${l.id}`}
                              onClick={() => handleOpenReview(l, 'approved')}
                              className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-1.5 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Approve Request"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              id={`btn-reject-leave-${l.id}`}
                              onClick={() => handleOpenReview(l, 'rejected')}
                              className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-1.5 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Reject Request"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Apply for Leave</h3>
              <button onClick={() => setIsApplyModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Leave Category *</label>
                <select
                  required
                  value={applyForm.leave_type_id}
                  onChange={(e) => setApplyForm({ ...applyForm, leave_type_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name} ({lt.is_paid ? 'Paid' : 'Unpaid'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.start_date}
                    onChange={(e) => setApplyForm({ ...applyForm, start_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">End Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.end_date}
                    onChange={(e) => setApplyForm({ ...applyForm, end_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Reason for Request *</label>
                <textarea
                  rows={3}
                  required
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  placeholder="Provide context for HR approval..."
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-leave-application"
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (For HR / Admin) */}
      {isReviewModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Review Leave: {selectedLeave.employee_name}
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-200">Requested:</span> {selectedLeave.total_days} days ({selectedLeave.start_date} to {selectedLeave.end_date})
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-200">Reason:</span> "{selectedLeave.reason}"
              </p>

              <div className="pt-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300">Decision Comment</label>
                <input
                  type="text"
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-leave-decision"
                onClick={handleSaveReview}
                disabled={submitting}
                className={`rounded-xl px-5 py-2 text-xs font-semibold text-white ${
                  reviewAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? 'Updating...' : `Confirm ${reviewAction.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
