import { Link, useLocation } from 'react-router-dom';
import { Bell, AlertTriangle, LayoutGrid } from 'lucide-react';
import ResQLogo from './ResQLogo';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center group py-2">
          <ResQLogo />
        </Link>

        {/* Navigation & Quick Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Notifications Bell */}
          <button
            type="button"
            aria-label="Alerts & Notifications"
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition focus:outline-none"
          >
            <Bell size={20} className="stroke-[2.2]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Report SOS Button */}
          <Link
            to="/sos"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${
              location.pathname === '/sos'
                ? 'bg-red-600 text-white shadow-red-500/25 ring-2 ring-red-400/30'
                : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-md'
            }`}
          >
            <AlertTriangle size={16} className="stroke-[2.5]" />
            <span>Report SOS</span>
          </Link>

          {/* Dashboard Button */}
          <Link
            to="/sos-dashboard"
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
              location.pathname === '/sos-dashboard'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <LayoutGrid size={17} className="text-slate-600 stroke-[2.2]" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </header>
  );
}