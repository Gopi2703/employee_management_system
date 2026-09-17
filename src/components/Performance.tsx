import React, { useState, useEffect } from 'react';
import { 
  Star, Award, TrendingUp, Plus, Search, 
  Calendar, CheckCircle, MessageSquare, X, Target, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PerformanceReview, Employee } from '../types';

export const Performance: React.FC = () => {
  const { role, employee } = useAuth();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Review Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    employee_id: '',
    reviewer_id: employee?.id || '',
    review_period: 'Q3 2026',
    rating: 5,
    kpi_score: 92,
    feedback: 'Consistently demonstrates strong delivery across milestones and active mentoring.',
    goals_met: 'Completed architectural migration and exceeded sprint velocities.',
    recommendation: 'Promotion to Senior Staff'
  });

  const canCreate = role === 'admin' || role === 'hr';

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = role === 'employee' && employee?.id
        ? `/api/performance?employee_id=${employee.id}`
        : '/api/performance';

      const [perfRes, empRes] = await Promise.all([
        fetch(url),
        fetch('/api/employees')
      ]);

      if (perfRes.ok) setReviews(await perfRes.json());
      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(emps);
        if (emps.length > 0 && !newReview.employee_id) {
          setNewReview(prev => ({ ...prev, employee_id: emps[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, employee?.id]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setIsAddOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to save review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesPeriod = selectedPeriod === 'all' || r.review_period === selectedPeriod;
    const matchesSearch = !searchQuery || (r.employee_name && r.employee_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPeriod && matchesSearch;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const topPerformers = reviews.filter(r => r.rating >= 4.5).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {role === 'employee' ? 'My Performance & Reviews' : 'Performance Appraisals & KPIs'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track goal milestones, quarterly evaluations, and promotion recommendations
          </p>
        </div>

        {canCreate && (
          <button
            id="btn-add-performance-review"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            New Performance Review
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Average Organization Rating</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgRating}</span>
              <span className="text-xs text-amber-500 flex items-center gap-0.5 font-semibold">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                out of 5.0
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 text-amber-600 dark:text-amber-400">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">High Tier Performers</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{topPerformers}</span>
              <span className="text-xs text-emerald-600 font-semibold">Rated 4.5+</span>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Active Review Cycle</span>
            <div className="mt-1">
              <span className="text-base font-bold text-slate-900 dark:text-white">Q3 2026 Appraisal</span>
              <p className="text-[11px] text-slate-400">Next cycle starts Nov 1</p>
            </div>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3 text-blue-600 dark:text-blue-400">
            <Target className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <select
            id="select-perf-period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Evaluation Periods</option>
            <option value="Q3 2026">Q3 2026</option>
            <option value="Q2 2026">Q2 2026</option>
            <option value="Annual 2025">Annual 2025</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            id="input-search-perf"
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-60 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Review Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading appraisal history...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No performance records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rev.employee_name}
                    </h3>
                    <p className="text-xs text-slate-500">{rev.department_name}</p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>{rev.rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-600 dark:text-slate-300">
                    {rev.review_period}
                  </span>
                  <span className="text-slate-400">
                    KPI Score: <strong className="text-slate-800 dark:text-slate-200">{rev.kpi_score}%</strong>
                  </span>
                </div>

                {/* Goals Met */}
                {rev.goals_met && (
                  <div className="mt-3 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Key Achievements:</span>
                    <p className="text-slate-600 dark:text-slate-400">{rev.goals_met}</p>
                  </div>
                )}

                {/* Feedback */}
                <div className="mt-3 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Manager Feedback:</span>
                  <p className="text-slate-600 dark:text-slate-400 italic">"{rev.feedback}"</p>
                </div>
              </div>

              {/* Recommendation pill & reviewer footer */}
              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Reviewed by {rev.reviewer_name}</span>
                {rev.recommendation && (
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {rev.recommendation}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Review Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Appraisal Record</h3>
              <button onClick={() => setIsAddOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Employee *</label>
                <select
                  required
                  value={newReview.employee_id}
                  onChange={(e) => setNewReview({ ...newReview, employee_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Review Period</label>
                  <input
                    type="text"
                    required
                    value={newReview.review_period}
                    onChange={(e) => setNewReview({ ...newReview, review_period: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">Rating (1 to 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">KPI Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newReview.kpi_score}
                    onChange={(e) => setNewReview({ ...newReview, kpi_score: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Achievements / Goals Met</label>
                <textarea
                  rows={2}
                  value={newReview.goals_met}
                  onChange={(e) => setNewReview({ ...newReview, goals_met: e.target.value })}
                  placeholder="Key targets accomplished..."
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Manager's Evaluation Feedback *</label>
                <textarea
                  rows={3}
                  required
                  value={newReview.feedback}
                  onChange={(e) => setNewReview({ ...newReview, feedback: e.target.value })}
                  placeholder="Constructive feedback, core competencies, teamwork..."
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">HR Recommendation</label>
                <input
                  type="text"
                  value={newReview.recommendation}
                  onChange={(e) => setNewReview({ ...newReview, recommendation: e.target.value })}
                  placeholder="e.g. 10% Merit Increment, Promotion to Tech Lead"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-perf-review"
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Record Appraisal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
