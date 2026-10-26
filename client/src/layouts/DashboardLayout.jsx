import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer whenever location changes during render
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
  }

  // Handle Escape key to dismiss mobile drawer
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close menu backdrop"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setMobileMenuOpen(false);
          }}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden animate-fadeIn"
        />
      )}

      {/* Navigation Sidebar */}
      <DashboardSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Container offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col md:pl-72 min-w-0">
        <DashboardHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
