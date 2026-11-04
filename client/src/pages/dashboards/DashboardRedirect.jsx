import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Role-aware redirect from /dashboard to the specific role view
 */
export default function DashboardRedirect() {
  const { user, activeRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Resolving role workspace...</p>
      </div>
    );
  }

  // Determine role: prioritize authenticated user.role if present, otherwise activeRole
  const effectiveRole = user?.role || activeRole || 'citizen';
  const normalized = effectiveRole === 'coordinator' ? 'administrator' : effectiveRole;

  if (normalized === 'administrator') {
    return <Navigate to="/dashboard/administrator" replace />;
  }
  if (normalized === 'volunteer') {
    return <Navigate to="/dashboard/volunteer" replace />;
  }
  return <Navigate to="/dashboard/citizen" replace />;
}
