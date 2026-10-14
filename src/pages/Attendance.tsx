import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  CalendarX,
  Clock,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  Filter,
  Save,
} from 'lucide-react';
import api from '../services/api';
import { Attendance as AttendanceType, Labourer, Project } from '../types';
import { useAuth } from '../context/AuthContext';

export const Attendance: React.FC = () => {
  const { hasRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState<AttendanceType[]>([]);
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  // Filter
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Editable row states for recording
  const [sheetEntries, setSheetEntries] = useState<
    Record<string, { status: string; workingHours: number; overtimeHours: number; remarks: string }>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, sumRes, labRes, projRes] = await Promise.all([
        api.get('/attendance', {
          params: { date: selectedDate, projectId: selectedProject || undefined },
        }),
        api.get('/attendance/summary', { params: { date: selectedDate } }),
        api.get('/labourers', { params: { status: 'ACTIVE', limit: 100 } }),
        api.get('/projects', { params: { status: 'ACTIVE' } }),
      ]);

      const attList: AttendanceType[] = attRes.data?.data || [];
      setAttendances(attList);
      setSummary(sumRes.data?.data || null);
      setLabourers(labRes.data?.data || []);
      setProjects(projRes.data?.data || []);

      // Build initial editable sheet state
      const initialSheet: Record<string, any> = {};
      const activeLabourers: Labourer[] = labRes.data?.data || [];

      activeLabourers.forEach((lab) => {
        const existing = attList.find((a) => a.labourerId === lab.id);
        if (existing) {
          initialSheet[lab.id] = {
            status: existing.status,
            workingHours: existing.workingHours,
            overtimeHours: existing.overtimeHours,
            remarks: existing.remarks || '',
            attendanceId: existing.id,
            isApproved: existing.isApproved,
          };
        } else {
          initialSheet[lab.id] = {
            status: 'PRESENT',
            workingHours: 8.0,
            overtimeHours: 0.0,
            remarks: '',
            attendanceId: null,
            isApproved: false,
          };
        }
      });
      setSheetEntries(initialSheet);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedProject]);

  const handleStatusChange = (labourerId: string, status: string) => {
    let workingHours = 8.0;
    if (status === 'HALF_DAY') workingHours = 4.0;
    if (status === 'ABSENT') workingHours = 0.0;
    if (status === 'PAID_LEAVE') workingHours = 8.0;

    setSheetEntries((prev) => ({
      ...prev,
      [labourerId]: {
        ...prev[labourerId],
        status,
        workingHours,
      },
    }));
  };

  const handleOvertimeChange = (labourerId: string, otHours: number) => {
    setSheetEntries((prev) => ({
      ...prev,
      [labourerId]: {
        ...prev[labourerId],
        overtimeHours: otHours,
        status: otHours > 0 && prev[labourerId]?.status === 'PRESENT' ? 'OVERTIME' : prev[labourerId]?.status,
      },
    }));
  };

  const handleSaveAll = async () => {
    setSubmitting(true);
    setFeedbackMessage(null);
    try {
      const recordsToPost: any[] = [];
      const updatesToPut: any[] = [];

      Object.entries(sheetEntries).forEach(([labId, data]) => {
        if (data.attendanceId) {
          updatesToPut.push({ id: data.attendanceId, ...data });
        } else {
          recordsToPost.push({
            labourerId: labId,
            projectId: selectedProject || undefined,
            date: selectedDate,
            status: data.status,
            workingHours: data.workingHours,
            overtimeHours: data.overtimeHours,
            remarks: data.remarks,
          });
        }
      });

      // Execute bulk creation
      if (recordsToPost.length > 0) {
        await api.post('/attendance/bulk', {
          date: selectedDate,
          projectId: selectedProject || undefined,
          records: recordsToPost,
        });
      }

      // Execute updates
      for (const u of updatesToPut) {
        await api.put(`/attendance/${u.id}`, {
          status: u.status,
          workingHours: u.workingHours,
          overtimeHours: u.overtimeHours,
          remarks: u.remarks,
        });
      }

      setFeedbackMessage('Attendance entries saved successfully!');
      fetchData();
    } catch (err: any) {
      setFeedbackMessage(err.response?.data?.message || 'Failed to save attendance entries.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAll = async () => {
    const unapprovedIds = attendances.filter((a) => !a.isApproved).map((a) => a.id);
    if (unapprovedIds.length === 0) return;

    try {
      await api.post('/attendance/approve', {
        attendanceIds: unapprovedIds,
        approvalNotes: 'Daily supervisor sign-off completed',
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            Daily Attendance & Timesheet
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record shifts, track overtime hours, prevent duplicate records, and approve daily turnout
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasRole(['ADMIN', 'SUPERVISOR']) && (
            <>
              <button
                onClick={handleApproveAll}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Supervisor Sign-Off
              </button>
              <button
                onClick={handleSaveAll}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Attendance Sheet'}
              </button>
            </>
          )}
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Date & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Filter by Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Active Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Turnout summary pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold">
            Present: {summary?.present || 0}
          </span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold">
            Half-Day: {summary?.halfDay || 0}
          </span>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold">
            On Leave: {summary?.onLeave || 0}
          </span>
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold">
            Absent: {summary?.absent || 0}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-black font-mono">
            Turnout: {summary?.attendanceRate || 0}%
          </span>
        </div>
      </div>

      {/* Attendance Interactive Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Labour ID</th>
                <th className="py-3 px-4">Labourer Name</th>
                <th className="py-3 px-4">Skills / Role</th>
                <th className="py-3 px-4">Status Selector</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Overtime (hrs)</th>
                <th className="py-3 px-4">Supervisor Approval</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading daily attendance sheet...
                  </td>
                </tr>
              ) : labourers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No active labourers found.
                  </td>
                </tr>
              ) : (
                labourers.map((lab) => {
                  const entry = sheetEntries[lab.id] || {
                    status: 'PRESENT',
                    workingHours: 8,
                    overtimeHours: 0,
                    remarks: '',
                    isApproved: false,
                  };

                  return (
                    <tr key={lab.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{lab.labourId}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {lab.firstName} {lab.lastName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">{lab.skills || 'Helper'}</td>

                      {/* Status Selector Buttons */}
                      <td className="py-2.5 px-4">
                        <div className="flex gap-1">
                          {[
                            { code: 'PRESENT', label: 'P', color: 'hover:bg-emerald-100 text-emerald-800' },
                            { code: 'HALF_DAY', label: 'HD', color: 'hover:bg-amber-100 text-amber-800' },
                            { code: 'OVERTIME', label: 'OT', color: 'hover:bg-purple-100 text-purple-800' },
                            { code: 'PAID_LEAVE', label: 'L', color: 'hover:bg-blue-100 text-blue-800' },
                            { code: 'ABSENT', label: 'A', color: 'hover:bg-rose-100 text-rose-800' },
                          ].map((st) => (
                            <button
                              key={st.code}
                              type="button"
                              onClick={() => handleStatusChange(lab.id, st.code)}
                              className={`w-7 h-7 rounded-lg font-bold text-[10px] transition border ${
                                entry.status === st.code
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : `bg-slate-100 text-slate-600 border-slate-200 ${st.color}`
                              }`}
                              title={st.code}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Working Hours */}
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="16"
                          value={entry.workingHours}
                          onChange={(e) =>
                            setSheetEntries((prev) => ({
                              ...prev,
                              [lab.id]: {
                                ...prev[lab.id],
                                workingHours: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-xs font-mono font-bold text-slate-800"
                        />
                      </td>

                      {/* Overtime Hours */}
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="8"
                          value={entry.overtimeHours}
                          onChange={(e) => handleOvertimeChange(lab.id, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-purple-200 bg-purple-50/50 rounded text-xs font-mono font-bold text-purple-800"
                        />
                      </td>

                      {/* Approval Status */}
                      <td className="py-2.5 px-4">
                        {entry.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Pending sign-off</span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional notes"
                          value={entry.remarks}
                          onChange={(e) =>
                            setSheetEntries((prev) => ({
                              ...prev,
                              [lab.id]: {
                                ...prev[lab.id],
                                remarks: e.target.value,
                              },
                            }))
                          }
                          className="w-36 px-2 py-1 border border-slate-200 rounded text-[11px] placeholder-slate-300"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
