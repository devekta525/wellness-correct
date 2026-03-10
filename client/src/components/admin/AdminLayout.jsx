import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Tag,
  Star,
  BarChart2,
  Share2,
  Bell,
  Settings,
  Bot,
  Plug,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Palette,
  Sparkles,
  Award,
  FileSpreadsheet,
  Boxes,
  MousePointer2,
  ShoppingBag,
  BookOpen,
  PhoneCall,
  Stethoscope,
  Scale,
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { adminAPI } from '../../services/api';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
  { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
  { label: 'Brands', path: '/admin/brands', icon: Award },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Coupons', path: '/admin/coupons', icon: Tag },
  { label: 'Reviews', path: '/admin/reviews', icon: Star },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { label: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
  { label: 'Referral', path: '/admin/referral', icon: Share2 },
  { label: 'Abandoned Carts', path: '/admin/abandoned-carts', icon: ShoppingBag },
  { label: 'Click Tracking', path: '/admin/click-tracking', icon: MousePointer2 },
  { label: 'Blog Posts', path: '/admin/blogs', icon: BookOpen },
  { label: 'Contact Page', path: '/admin/contact', icon: PhoneCall },
  { label: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
  { label: 'Legal Pages', path: '/admin/legal-pages', icon: Scale },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Customization', path: '/admin/customization', icon: Palette },
  { label: 'Studio', path: '/admin/studio', icon: Sparkles },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { label: 'AI Settings', path: '/admin/ai-settings', icon: Bot },
  { label: 'Gateway Settings', path: '/admin/gateway-settings', icon: Plug },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logo, setLogo] = useState('');

  // Logo (dark for admin sidebar) & favicon from Admin → Customization
  useEffect(() => {
    adminAPI.getCustomization().then((r) => {
      const c = r.data?.customization;
      const darkLogo = c?.logoDark || c?.logo;
      if (darkLogo) setLogo(darkLogo);
      if (c?.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = c.favicon;
      }
    }).catch(() => {});
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand (logo from Admin → Customization) */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/60">
        {logo ? (
          <img src={logo} alt="Site logo" className="h-9 w-auto max-w-[140px] object-contain flex-shrink-0" />
        ) : (
          <div className="h-9 w-[100px] flex-shrink-0 rounded-lg bg-gray-700 border border-dashed border-gray-600 flex items-center justify-center" aria-hidden>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Logo</span>
          </div>
        )}
        <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/60',
              ].join(' ')
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-gray-700/60 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 lg:hidden transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center px-4 lg:px-6 gap-4 shadow-sm">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Page Title - derived from current route */}
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              {NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.label || 'Admin Panel'}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.name?.split(' ')[0] || 'Admin'}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20 animate-slide-up">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
