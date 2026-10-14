import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, Lock, Mail, ArrowRight, AlertCircle, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
            <HardHat className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-white">
          Labour Management System
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enterprise Workforce, Attendance, Payroll & Contractor Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Instant Demo Access (Click to autofill)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@lms.com', 'Admin@123')}
                className="p-2 border border-slate-200 hover:border-blue-500 rounded-lg text-left bg-slate-50 hover:bg-blue-50/50 transition group"
              >
                <span className="font-bold text-slate-800 group-hover:text-blue-700 block">👑 Admin</span>
                <span className="text-[10px] text-slate-500 block">admin@lms.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('supervisor@lms.com', 'Supervisor@123')}
                className="p-2 border border-slate-200 hover:border-blue-500 rounded-lg text-left bg-slate-50 hover:bg-blue-50/50 transition group"
              >
                <span className="font-bold text-slate-800 group-hover:text-blue-700 block">👷 Supervisor</span>
                <span className="text-[10px] text-slate-500 block">supervisor@lms.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('contractor@lms.com', 'Contractor@123')}
                className="p-2 border border-slate-200 hover:border-blue-500 rounded-lg text-left bg-slate-50 hover:bg-blue-50/50 transition group"
              >
                <span className="font-bold text-slate-800 group-hover:text-blue-700 block">🏢 Contractor</span>
                <span className="text-[10px] text-slate-500 block">contractor@lms.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('labourer@lms.com', 'Labourer@123')}
                className="p-2 border border-slate-200 hover:border-blue-500 rounded-lg text-left bg-slate-50 hover:bg-blue-50/50 transition group"
              >
                <span className="font-bold text-slate-800 group-hover:text-blue-700 block">🛠️ Labourer</span>
                <span className="text-[10px] text-slate-500 block">labourer@lms.com</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Protected by Enterprise RBAC & JWT Encryption</p>
        </div>
      </div>
    </div>
  );
};
