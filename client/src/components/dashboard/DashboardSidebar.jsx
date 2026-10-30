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
  const { user, activeRole, logout, roleConfig } = useAuth();

  const navItems = getNavItemsForRole(activeRole);

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
        isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
      }`}
    >
      {/* Top Branding Section */}
      <div className="flex flex-col">
        <div className="h-18 px-5 border-b border-slate-200 flex items-center justify-between">
          <Link to="/dashboard" onClick={handleLinkClick} className="group">
            <ResQLogo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Pill */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeRole === 'administrator'
                  ? 'bg-emerald-600'
                  : activeRole === 'volunteer'
                  ? 'bg-amber-600'
                  : 'bg-blue-600'
              }`}
            />
            <span className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
              {roleConfig.label}
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">
            Active
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-3.5 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
          <p className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Portal Navigation
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
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  item.isEmergency
                    ? active
                      ? 'bg-red-700 text-white font-semibold shadow-xs'
                      : 'bg-red-50 text-red-900 hover:bg-red-100/90 border border-red-200 font-medium'
                    : active
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    size={16}
                    className={`shrink-0 ${
                      item.isEmergency
                        ? active
                          ? 'text-white'
                          : 'text-red-700'
                        : active
                        ? 'text-white'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.isEmergency && !active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer & Session Controls */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
        {/* Authenticated User Profile */}
        {user ? (
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0"
              >
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="truncate min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize truncate">
                  {user.role} &bull; {user.district || 'National'}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Public Portal Link */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={14} />
            <span>Public Home Portal</span>
          </div>
          <ExternalLink size={12} className="text-slate-400" />
        </Link>

        {/* Logout Control */}
        {user && (
          <button
            type="button"
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 hover:text-red-800 rounded-lg transition text-left"
          >
            <LogOut size={14} />
            <span className="truncate">Sign Out ({user.name || user.email})</span>
          </button>
        )}
      </div>
    </aside>
  );
}
