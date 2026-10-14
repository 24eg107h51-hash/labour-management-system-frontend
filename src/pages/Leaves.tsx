import React, { useState, useEffect } from 'react';
import {
  CalendarOff,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  X,
  User,
} from 'lucide-react';
import api from '../services/api';
import { LeaveRequest, Labourer } from '../types';
import { useAuth } from '../context/AuthContext';

export const Leaves: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formData, setFormData] = useState({
    labourerId: '',
    leaveType: 'CASUAL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const [leaveRes, labRes] = await Promise.all([
        api.get('/leaves'),
        api.get('/labourers', { params: { status: 'ACTIVE', limit: 100 } }),
      ]);

      if (leaveRes.data?.data) {
        setLeaves(leaveRes.data.data);
      }
      if (labRes.data?.data) {
        setLabourers(labRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/leaves/${id}/review`, {
        status,
        reviewNotes: status === 'APPROVED' ? 'Approved by site manager' : 'Rejected due to project deadline',
      });
      fetchLeaves();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await api.post('/leaves', {
        ...formData,
        labourerId: user?.labourerId || formData.labourerId,
      });

      setShowSubmitModal(false);
      setFormData({
        labourerId: '',
        leaveType: 'CASUAL',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      fetchLeaves();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-blue-600" />
            Leave Requests & Quotas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage time-off workflows, statutory paid leave quotas, and automated attendance integration
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              labourerId: user?.labourerId || (labourers[0]?.id || ''),
              leaveType: 'CASUAL',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              reason: '',
            });
            setFormError(null);
            setShowSubmitModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Submit Leave Request
        </button>
      </div>

      {/* Leave Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Casual Leave (CL)</span>
          <p className="text-xl font-black text-blue-700 mt-1">12 Days / Year</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Full paid daily wage allowance</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sick / Medical Leave (SL)</span>
          <p className="text-xl font-black text-emerald-700 mt-1">10 Days / Year</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Medical certificate supported</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Earned / Annual Leave (EL)</span>
          <p className="text-xl font-black text-purple-700 mt-1">15 Days / Year</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Accrued based on tenure</p>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-800">
          Leave Applications & Approvals
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Labourer Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {leave.labourer?.firstName} {leave.labourer?.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{leave.labourer?.labourId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{leave.leaveType}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 font-mono">{leave.totalDays} day(s)</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">{leave.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          leave.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : leave.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasRole(['ADMIN', 'SUPERVISOR']) && leave.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReview(leave.id, 'APPROVED')}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                            title="Approve Leave"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReview(leave.id, 'REJECTED')}
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                            title="Reject Leave"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Leave Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-blue-400" /> Submit Leave Application
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="p-6 space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {!user?.labourerId && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Labourer *</label>
                  <select
                    required
                    value={formData.labourerId}
                    onChange={(e) => setFormData({ ...formData, labourerId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">-- Choose Labourer --</option>
                    {labourers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.firstName} {l.lastName} ({l.labourId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="CASUAL">Casual Leave (Paid)</option>
                  <option value="SICK">Sick / Medical Leave (Paid)</option>
                  <option value="ANNUAL">Annual Leave (Paid)</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed justification or purpose for requested leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
