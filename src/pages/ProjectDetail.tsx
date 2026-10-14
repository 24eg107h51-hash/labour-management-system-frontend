import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp,
  X,
  AlertCircle,
  HardHat,
} from 'lucide-react';
import api from '../services/api';
import { Project, Labourer } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [project, setProject] = useState<any | null>(null);
  const [allLabourers, setAllLabourers] = useState<Labourer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedLabourerIds, setSelectedLabourerIds] = useState<string[]>([]);
  const [assignmentRole, setAssignmentRole] = useState('Civil Mason');

  // Task form
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    taskType: 'Masonry',
    priority: 'MEDIUM',
    targetQuantity: '100',
    unit: 'sqft',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data?.data) {
        setProject(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLabourers = async () => {
    try {
      const res = await api.get('/labourers', { params: { status: 'ACTIVE', limit: 100 } });
      if (res.data?.data) {
        setAllLabourers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchAllLabourers();
  }, [id]);

  const handleAssignLabourers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLabourerIds.length === 0) return;

    try {
      await api.post(`/projects/${id}/assign`, {
        labourerIds: selectedLabourerIds,
        role: assignmentRole,
      });
      setShowAssignModal(false);
      setSelectedLabourerIds([]);
      fetchProject();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, taskData);
      setShowTaskModal(false);
      setTaskData({
        title: '',
        description: '',
        taskType: 'Masonry',
        priority: 'MEDIUM',
        targetQuantity: '100',
        unit: 'sqft',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
      });
      fetchProject();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Project not found.</p>
        <Link to="/projects" className="mt-2 text-blue-600 font-bold inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects Directory
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {project.projectCode}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {project.status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">{project.name}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{project.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {project.location || 'Site Location'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Started{' '}
              {new Date(project.startDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Cost & Man-Days Metrics */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs min-w-[260px]">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Labour Cost</span>
            <span className="text-lg font-black text-blue-700 font-mono">
              ₹{(project.computedLabourCost || 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Man-Days Logged</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {project.totalManDays || 0} shifts
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Assigned Labourers & Work Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Assigned Workforce */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Assigned Labourers ({project.projectAssignments?.length || 0})
                </h3>
              </div>

              {hasRole(['ADMIN', 'SUPERVISOR']) && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3 h-3" /> Assign Workers
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto text-xs">
              {project.projectAssignments?.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No labourers assigned to this site yet.</div>
              ) : (
                project.projectAssignments?.map((pa: any) => (
                  <div key={pa.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {pa.labourer.firstName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {pa.labourer.firstName} {pa.labourer.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {pa.role || pa.labourer.skills || 'Worker'} • {pa.labourer.labourId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800">
                        ₹{pa.labourer.dailyWageRate?.toFixed(2)}/day
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Since {new Date(pa.assignedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Work Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  Site Work Tasks ({project.workTasks?.length || 0})
                </h3>
              </div>

              {hasRole(['ADMIN', 'SUPERVISOR']) && (
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3 h-3" /> Add Task
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto text-xs">
              {project.workTasks?.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No work tasks logged for this project.</div>
              ) : (
                project.workTasks?.map((task: any) => (
                  <div key={task.id} className="p-3.5 hover:bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{task.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === 'HIGH' || task.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{task.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>
                        Target: <strong className="text-slate-700">{task.targetQuantity} {task.unit}</strong>
                      </span>
                      <span className="text-blue-600 font-semibold">{task.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Assign Labourers */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Assign Labourers to Project
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignLabourers} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role / Trade Description</label>
                <input
                  type="text"
                  value={assignmentRole}
                  onChange={(e) => setAssignmentRole(e.target.value)}
                  placeholder="e.g. Lead Mason, Shuttering Carpenter, Helper"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Labourers ({selectedLabourerIds.length} selected)
                </label>
                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 p-2">
                  {allLabourers.map((lab) => (
                    <label
                      key={lab.id}
                      className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLabourerIds.includes(lab.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLabourerIds([...selectedLabourerIds, lab.id]);
                          } else {
                            setSelectedLabourerIds(selectedLabourerIds.filter((id) => id !== lab.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-800">
                        {lab.firstName} {lab.lastName} ({lab.labourId})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedLabourerIds.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition disabled:opacity-50"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Allocate Work Task
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5th Floor Slab Concreting"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Quantity</label>
                  <input
                    type="number"
                    value={taskData.targetQuantity}
                    onChange={(e) => setTaskData({ ...taskData, targetQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={taskData.unit}
                    onChange={(e) => setTaskData({ ...taskData, unit: e.target.value })}
                    placeholder="sqft, meters, tons"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={taskData.priority}
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Description</label>
                <textarea
                  rows={2}
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition"
                >
                  Create Work Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
