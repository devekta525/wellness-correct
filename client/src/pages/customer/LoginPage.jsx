import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { login, getMe } from '../../store/slices/authSlice';
import { siteAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated, user } = useSelector(state => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [siteLogo, setSiteLogo] = useState('');

  const headingRef = useRef(null);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!isAuthenticated) return;
    // Doctors always go to doctor dashboard after login
    const destination = user?.role === 'doctor' ? '/doctor/dashboard' : from;
    navigate(destination, { replace: true });
  }, [isAuthenticated, user?.role, navigate, from]);
  useEffect(() => {
    siteAPI.getSite().then((r) => { if (r.data?.site?.logo) setSiteLogo(r.data.site.logo); }).catch(() => { });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(form)).unwrap();
      dispatch(getMe());
    } catch (_) {}
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');

    // #region agent log
    fetch('http://127.0.0.1:7436/ingest/62e2a1c9-8294-48a2-981c-e3fb6efe754a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '10b514',
      },
      body: JSON.stringify({
        sessionId: '10b514',
        runId: 'login-page-darkmode-pre-fix-1',
        hypothesisId: 'LP-H1',
        location: 'LoginPage.jsx:dark-mode-check',
        message: 'Login page dark mode state',
        data: { isDark },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const el = headingRef.current;
    if (el) {
      const style = window.getComputedStyle(el);
      // #region agent log
      fetch('http://127.0.0.1:7436/ingest/62e2a1c9-8294-48a2-981c-e3fb6efe754a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '10b514',
        },
        body: JSON.stringify({
          sessionId: '10b514',
          runId: 'login-page-darkmode-pre-fix-1',
          hypothesisId: 'LP-H2',
          location: 'LoginPage.jsx:heading-styles',
          message: 'Login page heading colors',
          data: {
            color: style.color,
            backgroundColor: style.backgroundColor,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-xl bg-white dark:bg-gray-950">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="h-10 w-auto max-w-[180px] object-contain" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-black">A</span>
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Wellness_fuel</span>
                </>
              )}
            </Link>
            <h1 ref={headingRef} className="text-2xl font-bold text-gray-900 dark:text-gray-50">Welcome back!</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input pl-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
              {loading ? <Loader size="sm" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300">Create one</Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <ArrowLeft size={14} />Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
