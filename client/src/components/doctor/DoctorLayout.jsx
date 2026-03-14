import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SiteProvider } from '../../context/SiteContext';
import { logout } from '../../store/slices/authSlice';
import {
  LayoutDashboard, UserCircle, FileText, Stethoscope,
  LogOut, ChevronRight, Heart,
} from 'lucide-react';

const navItems = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/doctor/setup', label: 'Profile', icon: UserCircle },
];

const DoctorLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  const isPrescription = location.pathname.startsWith('/doctor/prescription');

  const handleExit = async (e) => {
    e.preventDefault();
    await dispatch(logout());
    navigate('/');
  };

  return (
    <SiteProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-slate-900 dark:bg-slate-950 border-r border-slate-800">
          {/* Brand */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Stethoscope size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Doctor</p>
              <p className="text-[10px] text-slate-400 font-medium">Portal</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-6 px-3 space-y-0.5">
            <p className="px-3 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Menu</p>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'}`
                }
              >
                <Icon size={18} className="flex-shrink-0 opacity-90" />
                <span>{label}</span>
                <ChevronRight size={14} className="ml-auto opacity-50" />
              </NavLink>
            ))}
            {isPrescription && (
              <div className="pt-2">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20">
                  <FileText size={18} className="flex-shrink-0" />
                  <span>Prescription</span>
                </div>
              </div>
            )}
          </nav>

          {/* User & actions */}
          <div className="p-3 border-t border-slate-800 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50">
              <div className="w-9 h-9 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">
                {user?.name?.[0] || 'D'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">Dr. {user?.name || 'Doctor'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 transition-all"
            >
              <Heart size={16} className="flex-shrink-0 text-rose-400/80" />
              <span>Back to site</span>
            </Link>
            <button
              type="button"
              onClick={handleExit}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/80 hover:text-red-400 transition-all text-left"
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span>Exit</span>
            </button>
          </div>
        </aside>

        {/* Mobile header (when sidebar hidden) */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Stethoscope size={20} className="text-teal-400" />
            <span className="font-bold text-white text-sm">Doctor Portal</span>
          </div>
          <div className="flex gap-2">
            <Link to="/doctor/dashboard" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <LayoutDashboard size={18} />
            </Link>
            <Link to="/doctor/setup" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <UserCircle size={18} />
            </Link>
            <Link to="/" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <Heart size={18} />
            </Link>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:pl-64 pt-14 lg:pt-0">
          <div className="min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>
    </SiteProvider>
  );
};

export default DoctorLayout;
