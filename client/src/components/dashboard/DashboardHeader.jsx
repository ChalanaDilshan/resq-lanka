import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Home,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader({ onOpenMobileMenu }) {
  const location = useLocation();
  const { user, activeRole, roleConfig } = useAuth();

  // Compute view title and breadcrumb
  const getViewInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard/citizen') {
      return { title: 'Citizen Relief & Incident Dashboard', section: 'Citizen Portal' };
    }
    if (path === '/dashboard/volunteer') {
      return { title: 'Volunteer Relief Operations Dashboard', section: 'Volunteer Tasks' };
    }
    if (path === '/dashboard/administrator') {
      return { title: 'Administrator Operations Overview', section: 'Disaster Coordination' };
    }
    return { title: 'Operations Dashboard', section: 'Portal' };
  };

  const viewInfo = getViewInfo();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Left Area: Mobile Drawer Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation sidebar"
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home size={12} />
              <span>ResQ-Lanka</span>
            </Link>
            <ChevronRight size={11} className="text-slate-300" />
            <Link to="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <ChevronRight size={11} className="text-slate-300" />
            <span className="text-slate-600 font-bold capitalize">{activeRole}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
            {viewInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Area: System Status & User Profile */}
      <div className="flex items-center gap-3">
        {/* Live System Advisory Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-semibold">
          <Radio size={13} className="text-emerald-600 animate-pulse" />
          <span>Live DMC Network Active</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
              activeRole === 'administrator'
                ? 'bg-emerald-600 text-white'
                : activeRole === 'volunteer'
                ? 'bg-amber-500 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {(user?.name || activeRole || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-bold text-slate-800 leading-tight">
              {user?.name || roleConfig.defaultName}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
              {user?.district || 'Ampara District'}
            </div>
          </div>
        </div>

        {/* Public Home Portal Link */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
        >
          <Home size={14} />
          <span>Exit to Portal</span>
        </Link>
      </div>
    </header>
  );
}
