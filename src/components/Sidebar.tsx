import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Briefcase,
  Building2,
  Banknote,
  CalendarOff,
  BarChart3,
  Settings,
  HardHat,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPERVISOR', 'CONTRACTOR', 'LABOURER'] },
    { name: 'Labourers', href: '/labourers', icon: Users, roles: ['ADMIN', 'SUPERVISOR', 'CONTRACTOR'] },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck, roles: ['ADMIN', 'SUPERVISOR', 'CONTRACTOR', 'LABOURER'] },
    { name: 'Projects & Tasks', href: '/projects', icon: Briefcase, roles: ['ADMIN', 'SUPERVISOR', 'CONTRACTOR', 'LABOURER'] },
    { name: 'Contractors', href: '/contractors', icon: Building2, roles: ['ADMIN', 'SUPERVISOR'] },
    { name: 'Wages & Salaries', href: '/salaries', icon: Banknote, roles: ['ADMIN', 'SUPERVISOR', 'CONTRACTOR', 'LABOURER'] },
    { name: 'Leave Requests', href: '/leaves', icon: CalendarOff, roles: ['ADMIN', 'SUPERVISOR', 'CONTRACTOR', 'LABOURER'] },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, roles: ['ADMIN', 'SUPERVISOR', 'CONTRACTOR'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredNav = navigation.filter((item) =>
    user?.roles.some((r) => item.roles.includes(r))
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-sm shadow-blue-500/20">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">Apex LMS</span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase block -mt-0.5">
                Labour Management
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Tag */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                {user?.roles?.[0] || 'GUEST'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
          <p className="text-slate-300 font-medium">Enterprise LMS v1.0.0</p>
          <p className="mt-0.5">PostgreSQL & Prisma Engine</p>
        </div>
      </aside>
    </>
  );
};
