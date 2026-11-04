import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Home,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader({ onOpenMobileMenu }) {
  const location = useLocation();
  const { user, activeRole } = useAuth();

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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left Area: Mobile Drawer Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation sidebar"
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
        >
          <Menu size={19} />
        </button>

        <div className="flex flex-col">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Link to="/" className="hover:text-slate-900 flex items-center gap-1">
              <Home size={12} />
              <span>ResQ-Lanka</span>
            </Link>
            <ChevronRight size={11} className="text-slate-400" />
            <Link to="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <ChevronRight size={11} className="text-slate-400" />
            <span className="text-slate-800 font-semibold capitalize">{user?.role || activeRole}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {viewInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Area: System Status & User Profile */}
      <div className="flex items-center gap-3">
        {/* Live System Advisory Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200/90 rounded-md text-emerald-900 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Live DMC Network Active</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-semibold text-slate-900 leading-tight">
              {user ? user.name : 'Authorized User'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
              {user ? (user.district || user.email) : 'ResQ-Lanka Network'}
            </div>
          </div>
        </div>

        {/* Public Home Portal Link */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition border border-slate-300"
        >
          <Home size={14} />
          <span>Exit to Portal</span>
        </Link>
      </div>
    </header>
  );
}
