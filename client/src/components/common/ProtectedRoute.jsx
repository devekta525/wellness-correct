import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

/**
 * ProtectedRoute – wraps routes that require an authenticated user.
 *
 * Behaviour
 * ---------
 * 1. While auth is still initialising  →  full-screen loader.
 * 2. Once initialised and NOT authenticated  →  redirect to /login,
 *    preserving the intended destination in location state so LoginPage
 *    can redirect back after a successful login.
 * 3. Authenticated  →  renders children normally.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, initialized, loading } = useSelector((state) => state.auth);

  // Show loader while auth state is being resolved (e.g. getMe in flight)
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader size="lg" text="Authenticating…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
