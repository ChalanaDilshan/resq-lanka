import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  LogOut,
  Building2,
  PackageCheck,
  ClipboardList,
  Users,
  PlusCircle,
  Bell,
  LayoutDashboard,
  Home,
  MapPin,
  HeartHandshake,
} from 'lucide-react';
import ResQLogo from './ResQLogo';
import NationalEmergencyBar from './NationalEmergencyBar';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, activeRole } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shelters', path: '/shelters', icon: MapPin },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Donate', path: '/supplies', icon: PackageCheck },
    { name: 'Volunteer', path: '/tasks', icon: Users },
    { name: 'About', path: '/about', icon: HeartHandshake },
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const elementId = path.replace('/#', '');
      if (location.pathname === '/') {
        document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        window.setTimeout(() => {
          document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/shelters?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const isLinkActive = (link) => {
    if (link.path === '/') return location.pathname === '/';
    if (link.path === '/about') return location.pathname === '/about';
    if (link.path === '/shelters') return location.pathname === '/shelters';
    if (link.path === '/alerts') {
      return (
        location.pathname.startsWith('/alerts') ||
        location.pathname.startsWith('/notices')
      );
    }
    if (link.path === '/supplies') {
      return ['/supplies', '/donate', '/coordinator'].includes(location.pathname);
    }
    if (link.path === '/tasks') {
      return (
        location.pathname.startsWith('/tasks') ||
        location.pathname === '/volunteer'
      );
    }
    return false;
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 transition-all">
        <NationalEmergencyBar />
        <div className="ios-glass border-b border-slate-200/70 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center group py-1.5 ios-press" onClick={closeMobileMenu}>
            <ResQLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <div key={link.name} className="relative py-2">
                  {link.path.startsWith('/#') ? (
                    <button
                      type="button"
                      onClick={() => handleNavClick(link.path)}
                      className={`text-[15px] font-semibold transition-colors duration-150 ${
                        active ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600'
                      }`}
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      to={link.path}
                      className={`text-[15px] font-semibold transition-colors duration-150 ${
                        active ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop Action Area */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search shelters, supplies, or alerts"
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all focus:outline-none ios-press"
            >
              <Search size={18} className="stroke-[2.2]" />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((open) => !open)}
                  aria-expanded={userDropdownOpen}
                  aria-label="User account menu"
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full transition shadow-xs ios-press group"
                >
                  <div className="relative">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        activeRole === 'coordinator' || activeRole === 'administrator'
                          ? 'bg-emerald-600 text-white'
                          : activeRole === 'volunteer'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {(user?.name || activeRole || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 capitalize flex items-center gap-1">
                      <span>{activeRole === 'administrator' ? 'System Admin' : activeRole}</span>
                    </div>
                  </div>
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-ios-scale">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.email || user?.name || 'Signed-in user'}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50/60 hover:bg-blue-100/70"
                      >
                        <LayoutDashboard size={15} className="text-blue-600" />
                        <span>Operations Console</span>
                      </Link>
                      <Link
                        to="/shelters"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Building2 size={15} className="text-blue-600" />
                        <span>Shelters Directory</span>
                      </Link>
                      <Link
                        to="/supplies"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <PackageCheck size={15} className="text-blue-600" />
                        <span>Supply Board</span>
                      </Link>
                      <Link
                        to="/tasks"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Users size={15} className="text-amber-600" />
                        <span>Volunteer Tasks</span>
                      </Link>
                      <Link
                        to="/alerts"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Bell size={15} className="text-rose-600" />
                        <span>Alerts & Notices</span>
                      </Link>
                      {(activeRole === 'coordinator' || activeRole === 'administrator') && (
                        <>
                          <Link
                            to="/alerts/new"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <PlusCircle size={15} className="text-rose-600" />
                            <span>Post Alert</span>
                          </Link>
                          <Link
                            to="/tasks/new"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <PlusCircle size={15} className="text-emerald-600" />
                            <span>Post Task</span>
                          </Link>
                        </>
                      )}
                      <Link
                        to="/sos-dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ShieldAlert size={15} />
                        <span>Incident Dispatch</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-[14px] font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs ios-press"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-[14px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-xs ios-press"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              to="/sos"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition ml-1 ios-press"
            >
              <ShieldAlert size={15} className="stroke-[2.5]" />
              <span>SOS Hotline</span>
            </Link>
          </div>

          {/* Mobile Header Right Buttons */}
          <div className="flex sm:hidden items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100/80 active:bg-slate-200/80 ios-press"
              aria-label="Search"
            >
              <Search size={20} className="stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100/80 active:bg-slate-200/80 focus:outline-none ios-press"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={22} className="stroke-[2.4]" />
              ) : (
                <svg className="w-6 h-6 stroke-slate-800" fill="none" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        </div>

        {/* Mobile Grouped Inset Menu Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full inset-x-0 z-50 ios-glass border-b border-slate-200/80 px-4 pt-3 pb-6 shadow-2xl animate-ios-sheet">
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-1.5 space-y-0.5 mb-3 shadow-xs">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const active = isLinkActive(link);
                return (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => handleNavClick(link.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ios-press ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-800 hover:bg-white active:bg-slate-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {IconComponent && (
                        <IconComponent
                          size={18}
                          className={active ? 'text-white' : 'text-slate-500'}
                        />
                      )}
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={active ? 'text-white/80' : 'text-slate-400'}
                    />
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Link
                to="/sos"
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl text-sm shadow-md shadow-red-600/30 ios-press"
              >
                <ShieldAlert size={18} className="stroke-[2.5]" />
                <span>Report Emergency SOS</span>
              </Link>

              {isAuthenticated ? (
                <div className="pt-2">
                  <div className="px-1 text-xs font-bold text-slate-600 mb-2">
                    Signed in as {user?.name || user?.email} ({activeRole})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="w-full py-2.5 border border-red-200 bg-red-50/60 text-red-600 font-bold text-xs rounded-xl text-center ios-press"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full py-2.5 border border-slate-200 bg-white font-bold text-xs text-slate-800 rounded-xl text-center shadow-xs ios-press"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="w-full py-2.5 bg-blue-600 font-bold text-xs text-white rounded-xl text-center shadow-xs ios-press"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* iOS Spotlight Style Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 px-3 sm:px-4 bg-slate-950/60 backdrop-blur-md animate-ios-fade">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-ios-scale">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <Search size={18} className="text-blue-600" />
                <span>Spotlight Search</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="p-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search shelters, alerts, supplies, districts..."
                  className="w-full pl-11 pr-24 py-3 bg-slate-100 border border-transparent rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 transition-all"
                />
                <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold ios-press shadow-xs"
                >
                  Search
                </button>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quick Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'High-Ground Facilities',
                    'Open Assembly Grounds',
                    'Ampara Central College',
                    'Kalmunai',
                    'Drinking Water',
                    'Dry Rations',
                    'Heavy Rainfall Warning',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium px-3 py-1.5 rounded-full ios-press transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
