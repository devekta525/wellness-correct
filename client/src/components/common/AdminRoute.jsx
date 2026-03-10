import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const ADMIN_ROLES = ['admin', 'superadmin'];

/**
 * AdminRoute – wraps routes that require an admin or superadmin user.
 *
 * Behaviour
 * ---------
 * 1. While auth is initialising  →  full-screen loader.
 * 2. Not authenticated  →  redirect to /admin/login.
 * 3. Authenticated but role not in ADMIN_ROLES  →  redirect to /admin/login
 *    (prevents regular customers from accessing the admin panel).
 * 4. Valid admin  →  renders children.
 */
const AdminRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, initialized, loading, user } = useSelector((state) => state.auth);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader size="lg" text="Verifying access…" />
      </div>
    );
  }

  const isAdmin = isAuthenticated && user && ADMIN_ROLES.includes(user.role);

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default AdminRoute;
