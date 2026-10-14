import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Clock,
  Banknote,
  Shield,
  Users,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'RULES' | 'USERS' | 'AUDIT' | 'DATABASE'>('GENERAL');
  const [settings, setSettings] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New User Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'SUPERVISOR',
  });
  const [userError, setUserError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.data) {
        setSettings(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/settings/users');
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/settings/audit-logs');
      if (res.data?.data) {
        setAuditLogs(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSettings(), fetchUsers(), fetchAuditLogs()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload: any[] = [];
      Object.entries(settings).forEach(([category, kvMap]: any) => {
        Object.entries(kvMap).forEach(([key, value]) => {
          payload.push({ category, key, value });
        });
      });

      await api.put('/settings', { settings: payload });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);

    try {
      await api.post('/settings/users', newUserData);
      setShowAddUser(false);
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'SUPERVISOR',
      });
      fetchUsers();
    } catch (err: any) {
      setUserError(err.response?.data?.message || 'Failed to create user account.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            System Configuration & Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organization profile, overtime policies, user credentials, and database settings
          </p>
        </div>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Settings updated successfully
          </span>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: 'GENERAL', label: 'Company Profile', icon: Building },
          { id: 'RULES', label: 'Wage & Shift Rules', icon: Clock },
          { id: 'USERS', label: 'Users & Roles', icon: Users },
          { id: 'AUDIT', label: 'Audit Trail Logs', icon: Shield },
          { id: 'DATABASE', label: 'Database & Backups', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Company Profile */}
      {activeTab === 'GENERAL' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Organization Legal Name</label>
            <input
              type="text"
              value={settings.COMPANY?.COMPANY_NAME || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  COMPANY: { ...settings.COMPANY, COMPANY_NAME: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Headquarters Address</label>
            <input
              type="text"
              value={settings.COMPANY?.COMPANY_ADDRESS || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  COMPANY: { ...settings.COMPANY, COMPANY_ADDRESS: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">System Currency Designation</label>
            <input
              type="text"
              value={settings.COMPANY?.CURRENCY || 'INR (₹)'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  COMPANY: { ...settings.COMPANY, CURRENCY: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Company Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Wage & Shift Rules */}
      {activeTab === 'RULES' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Daily Shift (Hours)</label>
              <input
                type="number"
                step="0.5"
                value={settings.WORKING_HOURS?.STANDARD_SHIFT_HOURS || '8.0'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    WORKING_HOURS: { ...settings.WORKING_HOURS, STANDARD_SHIFT_HOURS: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Overtime Hourly Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={settings.WORKING_HOURS?.OVERTIME_RATE_MULTIPLIER || '1.5'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    WORKING_HOURS: { ...settings.WORKING_HOURS, OVERTIME_RATE_MULTIPLIER: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Annual Casual Leaves</label>
              <input
                type="number"
                value={settings.LEAVE_POLICIES?.MAX_CASUAL_LEAVES || '12'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    LEAVE_POLICIES: { ...settings.LEAVE_POLICIES, MAX_CASUAL_LEAVES: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Annual Sick Leaves</label>
              <input
                type="number"
                value={settings.LEAVE_POLICIES?.MAX_SICK_LEAVES || '10'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    LEAVE_POLICIES: { ...settings.LEAVE_POLICIES, MAX_SICK_LEAVES: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Update Rules'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Users & Roles */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800">System User Accounts</span>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add System User
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role Access</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-3 px-4 font-mono">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {u.roles?.join(', ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold text-[10px]">{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add User Modal */}
          {showAddUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Create System User Account</h3>
                {userError && (
                  <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">{userError}</div>
                )}
                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      required
                      value={newUserData.firstName}
                      onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      required
                      value={newUserData.lastName}
                      onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="SUPERVISOR">Site Supervisor / Manager</option>
                    <option value="ADMIN">System Administrator</option>
                    <option value="CONTRACTOR">Contractor Representative</option>
                    <option value="LABOURER">Labourer Worker</option>
                  </select>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-800">
            System Security & Transaction Audit Trail
          </div>
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Module</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{log.action}</td>
                  <td className="py-2.5 px-4">{log.module}</td>
                  <td className="py-2.5 px-4 text-blue-600 font-semibold">{log.user?.email || 'System'}</td>
                  <td className="py-2.5 px-4 text-slate-400">{log.ipAddress}</td>
                  <td className="py-2.5 px-4 max-w-xs truncate text-slate-500 font-sans">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Database & Backups */}
      {activeTab === 'DATABASE' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Database Architecture Status</h3>
              <p className="text-slate-500">Configured with Prisma ORM & Transaction Engine</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Primary Relational Database</p>
                <p className="text-slate-500 text-[11px]">PostgreSQL 16 (Compatible with AWS RDS, Supabase, Neon)</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                Active
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Lightweight Development Database</p>
                <p className="text-slate-500 text-[11px]">SQLite zero-config local engine</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
                Supported
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Redis Cache Optimization</p>
                <p className="text-slate-500 text-[11px]">Session & rate-limiting memory storage</p>
              </div>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-[10px]">
                Optional / Ready
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
