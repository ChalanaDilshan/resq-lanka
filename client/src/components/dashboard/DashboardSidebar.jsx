import { Link, useLocation } from 'react-router-dom';
import {
  X,
  ArrowLeft,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import ResQLogo from '../shared/ResQLogo';
import { useAuth } from '../../context/AuthContext';
import { getNavItemsForRole } from './dashboardNavConfig';

export default function DashboardSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, activeRole, switchRole, logout, roleConfig } = useAuth();

  const navItems = getNavItemsForRole(activeRole);
  const roleOptions = ['citizen', 'volunteer', 'administrator'];

  const isActive = (path) => {
    if (path === '/dashboard/citizen' || path === '/dashboard/volunteer' || path === '/dashboard/administrator') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      aria-label="Dashboard navigation sidebar"
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Top Branding Section */}
      <div className="flex flex-col">
        <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/dashboard" onClick={handleLinkClick} className="group">
            <ResQLogo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Pill */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activeRole === 'administrator'
                  ? 'bg-emerald-600'
                  : activeRole === 'volunteer'
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
            />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {roleConfig.label} Mode
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${roleConfig.badgeClass}`}>
            Active
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
          <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Role Operations
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={handleLinkClick}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  item.isEmergency
                    ? active
                      ? 'bg-red-600 text-white shadow-md shadow-red-200'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100'
                    : active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    size={17}
                    className={`stroke-[2.2] shrink-0 ${
                      item.isEmergency
                        ? active
                          ? 'text-white'
                          : 'text-red-600'
                        : active
                        ? 'text-white'
                        : 'text-slate-500 group-hover:text-blue-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.isEmergency && !active && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer & Session Controls */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {/* Role Switcher (Evaluation / Demo helper) */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            Switch Workspace Role
          </p>
          <div className="grid grid-cols-3 gap-1">
            {roleOptions.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  switchRole(role);
                }}
                className={`py-1 px-1.5 rounded-lg text-[11px] font-bold capitalize transition text-center ${
                  activeRole === role
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {role === 'administrator' ? 'Admin' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Public Portal Link */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={15} />
            <span>Public Home Portal</span>
          </div>
          <ExternalLink size={13} className="text-slate-400" />
        </Link>

        {/* Logout Control */}
        {user && (
          <button
            type="button"
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut size={15} />
            <span>Sign Out ({user.name || user.email})</span>
          </button>
        )}
      </div>
    </aside>
  );
}
