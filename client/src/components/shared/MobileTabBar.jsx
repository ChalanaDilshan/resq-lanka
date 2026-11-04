import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MapPin,
  ShieldAlert,
  Bell,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileTabBar() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Hide the tab bar in full-screen administrative or citizen dashboard workspaces if preferred
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const isTabActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/shelters') return location.pathname.startsWith('/shelters');
    if (path === '/sos') return location.pathname.startsWith('/sos');
    if (path === '/alerts') {
      return (
        location.pathname.startsWith('/alerts') ||
        location.pathname.startsWith('/notices')
      );
    }
    if (path === '/account') {
      return (
        location.pathname.startsWith('/dashboard') ||
        location.pathname === '/login' ||
        location.pathname === '/register'
      );
    }
    return false;
  };

  const accountPath = isAuthenticated ? '/dashboard' : '/login';

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 ios-glass border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-safe transition-all duration-300"
    >
      <div className="h-16 px-3 flex items-center justify-around relative max-w-md mx-auto">
        {/* Tab 1: Home */}
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-press ${
            isTabActive('/')
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Home size={21} className={isTabActive('/') ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
          {isTabActive('/') && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
          )}
        </Link>

        {/* Tab 2: Shelters */}
        <Link
          to="/shelters"
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-press ${
            isTabActive('/shelters')
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <MapPin size={21} className={isTabActive('/shelters') ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight mt-0.5">Shelters</span>
          {isTabActive('/shelters') && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
          )}
        </Link>

        {/* Tab 3: Emergency SOS (Prominent Center Button) */}
        <div className="flex-1 flex justify-center">
          <Link
            to="/sos"
            aria-label="Report Emergency SOS"
            className="relative -top-4 flex flex-col items-center group ios-press focus:outline-none"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/35 border-3 border-white ring-2 ring-red-500/25 transition-transform duration-200">
              <ShieldAlert size={24} className="stroke-[2.6]" />
            </div>
            <span className="text-[10.5px] font-extrabold text-red-600 tracking-tight mt-0.5">
              SOS
            </span>
          </Link>
        </div>

        {/* Tab 4: Alerts */}
        <Link
          to="/alerts"
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-press ${
            isTabActive('/alerts')
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Bell size={21} className={isTabActive('/alerts') ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight mt-0.5">Alerts</span>
          {isTabActive('/alerts') && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
          )}
        </Link>

        {/* Tab 5: Profile / Workspace */}
        <Link
          to={accountPath}
          className={`flex-1 flex flex-col items-center justify-center py-1 ios-press ${
            isTabActive('/account')
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          {isAuthenticated ? (
            <LayoutDashboard
              size={21}
              className={isTabActive('/account') ? 'stroke-[2.4]' : 'stroke-[1.8]'}
            />
          ) : (
            <User
              size={21}
              className={isTabActive('/account') ? 'stroke-[2.4]' : 'stroke-[1.8]'}
            />
          )}
          <span className="text-[10px] tracking-tight mt-0.5">
            {isAuthenticated ? (user?.role === 'administrator' ? 'Admin' : 'Console') : 'Sign In'}
          </span>
          {isTabActive('/account') && (
            <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
          )}
        </Link>
      </div>
    </nav>
  );
}
