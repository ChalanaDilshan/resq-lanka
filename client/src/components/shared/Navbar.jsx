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
    { name: 'Donate', path: '/#donate' },
    { name: 'Volunteer', path: '/#volunteer' },
    { name: 'About', path: '/#about' },
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      const elementId = path.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/shelters?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center group py-2">
            <ResQLogo />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : link.path === '/shelters'
                  ? location.pathname === '/shelters'
                  : false;

              return (
                <div key={link.name} className="relative py-2">
                  {link.path.startsWith('/#') ? (
                    <button
                      type="button"
                      onClick={() => handleNavClick(link.path)}
                      className={`text-[15px] font-semibold transition-colors duration-150 ${
                        isActive
                          ? 'text-blue-600 font-bold'
                          : 'text-slate-700 hover:text-blue-600'
                      }`}
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      to={link.path}
                      className={`text-[15px] font-semibold transition-colors duration-150 ${
                        isActive
                          ? 'text-blue-600 font-bold'
                          : 'text-slate-700 hover:text-blue-600'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}
                  {/* Active Indicator Underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search disasters, shelters, or alerts"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition focus:outline-none"
            >
              <Search size={19} className="stroke-[2.2]" />
            </button>

            {/* Authenticated User Status or Switch Role Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                    activeRole === 'coordinator'
                      ? 'bg-emerald-600 text-white'
                      : activeRole === 'volunteer'
                      ? 'bg-amber-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {user?.name ? user.name.charAt(0) : activeRole.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-slate-800 leading-tight">
                    {user?.name || (activeRole === 'coordinator' ? 'Coordinator' : 'Public User')}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 capitalize">
                    {activeRole} Role
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] text-slate-400 font-medium">Current Active Role</p>
                    <p className="text-xs font-bold text-slate-900 capitalize">
                      {activeRole} Interface
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
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <div className="px-4 py-1 text-[10px] uppercase font-bold text-slate-400">
                      Switch Role Mode
                    </div>
                    {['citizen', 'volunteer', 'coordinator'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          switchRole(r);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between capitalize ${
                          activeRole === r
                            ? 'text-blue-600 font-bold bg-blue-50'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{r}</span>
                        {activeRole === r && <CheckCircle2 size={13} />}
                      </button>
                    ))}
                  </div>

                  {isAuthenticated && (
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
                  )}
                </div>
              )}
            </div>

            {/* Emergency SOS Shortcut Pill */}
            <Link
              to="/sos"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition ml-1"
            >
              <ShieldAlert size={14} className="stroke-[2.5]" />
              <span>SOS Hotline</span>
            </Link>
          </div>

          {/* Mobile Menu & Search Buttons */}
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
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

        {/* Mobile Dropdown Menu */}
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
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm shadow-sm"
              >
                <ShieldAlert size={16} />
                <span>Report Emergency SOS</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <Search size={18} className="text-blue-600" />
                <span>Search Shelters & Hazards</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shelters by name, hazard type, or district..."
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