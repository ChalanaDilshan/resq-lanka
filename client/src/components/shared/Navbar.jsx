import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  LogOut,
  Building2,
  PackageCheck,
  ClipboardList,
  Users,
  PlusCircle,
} from 'lucide-react';
import ResQLogo from './ResQLogo';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, activeRole, switchRole } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shelters', path: '/shelters' },
    { name: 'Alerts', path: '/#alerts' },
    { name: 'Donate', path: '/supplies' },
    { name: 'Volunteer', path: '/tasks' },
    { name: 'About', path: '/#about' },
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
    if (link.path === '/shelters') return location.pathname === '/shelters';
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

  const roleOptions = ['citizen', 'volunteer', 'administrator'];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center group py-2" onClick={closeMobileMenu}>
            <ResQLogo />
          </Link>

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

          <div className="hidden sm:flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search shelters, supplies, or alerts"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition focus:outline-none"
            >
              <Search size={19} className="stroke-[2.2]" />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((open) => !open)}
                  aria-expanded={userDropdownOpen}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                      activeRole === 'coordinator' || activeRole === 'administrator'
                        ? 'bg-emerald-600 text-white'
                        : activeRole === 'volunteer'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {(user?.name || activeRole || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-bold text-slate-800 leading-tight">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 capitalize">
                      {activeRole === 'administrator' ? 'Admin' : activeRole} Role
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium">Logged in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.email || user?.name || 'Signed-in user'}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500 capitalize mt-1">
                        {activeRole} role
                      </p>
                    </div>

                    <div className="py-1">
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
                        <span>Supply &amp; Donation Board</span>
                      </Link>
                      <Link
                        to="/tasks"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        <Users size={15} className="text-amber-600" />
                        <span>Volunteer Task Board</span>
                      </Link>
                      {(activeRole === 'coordinator' || activeRole === 'administrator') && (
                        <>
                          <Link
                            to="/tasks/new"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            <PlusCircle size={15} className="text-emerald-600" />
                            <span>Post Volunteer Task</span>
                          </Link>
                          <Link
                            to="/coordinator"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            <ClipboardList size={15} />
                            <span>Coordinator Inventory</span>
                          </Link>
                        </>
                      )}
                      <Link
                        to="/sos-dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ShieldAlert size={15} />
                        <span>Incident Dashboard</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <div className="px-4 py-1 text-[10px] uppercase font-bold text-slate-400">
                        Switch Interface Role
                      </div>
                      {roleOptions.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            switchRole(role);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between capitalize ${
                            activeRole === role
                              ? 'text-blue-600 font-bold bg-blue-50'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{role}</span>
                          {activeRole === role && <CheckCircle2 size={13} />}
                        </button>
                      ))}
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
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-[14px] font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-[14px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow"
                >
                  Register
                </Link>
              </>
            )}

            <Link
              to="/sos"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition ml-1"
            >
              <ShieldAlert size={14} className="stroke-[2.5]" />
              <span>SOS Hotline</span>
            </Link>
          </div>

          <div className="flex sm:hidden items-center space-x-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={22} className="stroke-[2.2]" />
              ) : (
                <svg className="w-6 h-6 stroke-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.path)}
                  className="text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/sos"
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm shadow-sm"
              >
                <ShieldAlert size={16} />
                <span>Report Emergency SOS</span>
              </Link>
              {isAuthenticated ? (
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-700 mb-2">
                    Logged in as {user?.name || user?.email || 'User'} ({activeRole})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="w-full py-2 border border-red-200 text-red-600 font-semibold text-sm rounded-xl text-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full py-2 border border-slate-300 font-semibold text-sm text-slate-700 rounded-xl text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full py-2 bg-blue-600 font-semibold text-sm text-white rounded-xl text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <Search size={18} className="text-blue-600" />
                <span>Search Shelters, Supplies &amp; Hazards</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
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
                  placeholder="Search shelters, disaster alerts, relief supplies, districts..."
                  className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
                <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
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
                      className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-lg transition"
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
