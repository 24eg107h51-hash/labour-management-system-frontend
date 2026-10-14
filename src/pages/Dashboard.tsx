import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CalendarX,
  Briefcase,
  Banknote,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  HardHat,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import api from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load dashboard metrics', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Labourers',
      value: stats?.totalLabourers || 0,
      sub: `${stats?.activeLabourers || 0} currently active`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Present Today',
      value: stats?.presentToday || 0,
      sub: `${stats?.halfDayToday || 0} half-day shifts`,
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Absent Today',
      value: stats?.absentToday || 0,
      sub: 'Pending mark or on leave',
      icon: CalendarX,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      title: 'Active Projects',
      value: stats?.ongoingProjects || 0,
      sub: `${stats?.totalContractors || 0} certified contractors`,
      icon: Briefcase,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Wages Payable',
      value: `₹${(stats?.totalWagesPayable || 0).toLocaleString()}`,
      sub: 'Approved period wages',
      icon: Banknote,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Wages Paid',
      value: `₹${(stats?.totalWagesPaid || 0).toLocaleString()}`,
      sub: 'Disbursed via bank & cash',
      icon: CheckCircle,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      title: 'Pending Payments',
      value: `₹${(stats?.pendingPayments || 0).toLocaleString()}`,
      sub: 'Action required by Finance',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 rounded-2xl text-white shadow-xl">
        <div>
          <span className="inline-block px-2.5 py-0.5 mb-2 text-xs font-semibold bg-blue-500/30 text-blue-200 rounded border border-blue-400/30">
            Workforce Intelligence Engine
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome back, {user?.firstName} {user?.lastName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
            Live operations overview for attendance, contractor allocations, and payroll processing.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2.5">
          <Link
            to="/attendance"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Mark Daily Attendance
          </Link>
          <Link
            to="/salaries"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-sm border border-white/20 transition"
          >
            Manage Payroll
          </Link>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.slice(0, 4).map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.slice(4, 7).map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Wage Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Wages vs Disbursements</h3>
              <p className="text-xs text-slate-500 mt-0.5">Approved net payroll compared to completed payments</p>
            </div>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyStats || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="wages" name="Wages Incurred" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Wages Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Attendance Rate Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Attendance Rate Trend (%)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Site turnout and active presence percentage</p>
            </div>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyStats || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Turnout']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="attendanceRate" name="Attendance Rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Cards & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Operational Shortcuts</h3>

          <Link
            to="/labourers"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Register New Labourer</p>
                <p className="text-[10px] text-slate-500">Auto-ID generation & skills catalog</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </Link>

          <Link
            to="/attendance"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Daily Attendance Sheet</p>
                <p className="text-[10px] text-slate-500">Record check-ins, OT & supervisor approval</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </Link>

          <Link
            to="/salaries"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Calculate & Disburse Wages</p>
                <p className="text-[10px] text-slate-500">Net Pay formula & printable slips</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </Link>
        </div>

        {/* Audit Log Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent System Audit Stream</h3>
              <p className="text-xs text-slate-500">Security and financial audit log trail</p>
            </div>
            <Link to="/settings" className="text-xs text-blue-600 font-semibold hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((log: any) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {log.module} • By {log.user?.firstName || 'System'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No recent audit logs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
