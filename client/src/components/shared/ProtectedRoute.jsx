import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated user to login, preserving intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0) {
    // Treat legacy 'coordinator' as matching 'administrator'
    const normalizedUserRole = user.role === 'coordinator' ? 'administrator' : user.role;
    const isAuthorized = allowedRoles.some((role) => {
      const normalizedAllowed = role === 'coordinator' ? 'administrator' : role;
      return normalizedAllowed === normalizedUserRole;
    });

    if (!isAuthorized) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              This operational area requires one of the following roles: [
              <strong className="capitalize">{allowedRoles.join(', ')}</strong>]. Your current assigned
              account role is <strong className="capitalize">{user.role}</strong>. Please sign in with an authorized
              account to access this section.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>My Dashboard</span>
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
              >
                Switch Account
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
