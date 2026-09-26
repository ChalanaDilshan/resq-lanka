import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-red-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 font-black text-xl tracking-wide">
          <ShieldAlert size={28} />
          <span>ResQ-Lanka</span>
        </Link>

        <div className="flex space-x-3">
          <Link
            to="/sos"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition ${
              location.pathname === '/sos' ? 'bg-red-900 text-white' : 'hover:bg-red-800 text-red-100'
            }`}
          >
            <AlertTriangle size={16} />
            <span>Report SOS</span>
          </Link>
          <Link
            to="/sos-dashboard"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition ${
              location.pathname === '/sos-dashboard' ? 'bg-red-900 text-white' : 'hover:bg-red-800 text-red-100'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}