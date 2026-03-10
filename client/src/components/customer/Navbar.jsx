import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart, Search, Heart, User, Menu, X, Package,
  LogOut, Settings, ChevronDown, Sun, Moon, ArrowRight, Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleCart, toggleDarkMode } from '../../store/slices/uiSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { useSite } from '../../context/SiteContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/search' },
  { label: 'Consult', to: '/consultation' },
  { label: 'Science', to: '/science' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { site } = useSite();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { categories } = useSelector((s) => s.products);
  const { darkMode } = useSelector((s) => s.ui);
  const cartCount = useSelector(selectCartCount);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  const siteLogo = site?.logo || '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setUserMenuOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const initials = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      {/* ══ SEARCH OVERLAY ══════════════════════════════════════════════ */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setSearchOpen(false)} />
          <div className="relative bg-white dark:bg-gray-950 shadow-2xl border-b border-gray-100 dark:border-gray-800" style={{ animation: 'slideDown 0.2s ease' }}>
            <div className="page-container pt-5 pb-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <div className="flex-1 flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 ring-2 ring-primary-500/30 focus-within:ring-primary-500">
                  <Search size={20} className="text-primary-500 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, brands, categories…"
                    className="flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white text-sm sm:text-base placeholder:text-gray-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {searchQuery.trim() && (
                    <button type="submit" className="btn-primary flex-1 sm:flex-none px-5 py-3 rounded-2xl text-sm font-bold">Search</button>
                  )}
                  <button type="button" onClick={() => setSearchOpen(false)} className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </form>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-3">Browse categories</p>
                {categories.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                    {categories.slice(0, 20).map((cat) => (
                      <Link key={cat._id} to={`/category/${cat.slug}`} onClick={() => setSearchOpen(false)}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/70 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-transparent hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-150 group text-center">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 shadow-sm overflow-hidden relative group-hover:scale-110 transition-transform duration-150">
                          <img src={cat.image || 'https://via.placeholder.com/200/c4b5fd/1e1b4b?text=Category'} alt={cat.name} className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200/c4b5fd/1e1b4b?text=Category'; }} />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 leading-tight">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {['Supplements', 'Proteins', 'Vitamins', 'Superfoods', 'Sports Nutrition', 'Wellness'].map((c) => (
                      <Link key={c} to={`/search?q=${c}`} onClick={() => setSearchOpen(false)}
                        className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-400 transition-colors font-medium">
                        {c}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Link to="/search" onClick={() => setSearchOpen(false)} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  Browse all products <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ NAVBAR ══════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm shadow-black/5 border-b border-gray-200/60 dark:border-gray-800/60'
          : 'bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800'
      }`}>
        <div className="page-container">
          <div className="flex items-center gap-4 h-[64px]">

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              {siteLogo ? (
                <img src={siteLogo} alt="Wellness Fuel" className="h-9 w-auto max-w-[140px] object-contain" />
              ) : (
                <div className="h-9 w-[140px] max-w-[140px] rounded-lg bg-gray-200 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center" aria-hidden>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Logo</span>
                </div>
              )}
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 ml-2">
              {NAV_LINKS.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Spacer on mobile so actions (search, dark mode, cart, etc.) align right */}
            <div className="md:hidden flex-1 min-w-0" aria-hidden="true" />

            {/* Search bar — desktop (reduced width) */}
            <div className="hidden md:block ml-auto w-52 xl:w-64">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200/70 dark:hover:bg-gray-800 rounded-xl px-3 py-2.5 text-left transition-all duration-200 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <Search size={14} className="text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                <span className="text-sm text-gray-400 dark:text-gray-500 flex-1 font-medium truncate">Search…</span>
                <kbd className="hidden xl:flex items-center gap-0.5 text-[10px] text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-1.5 py-0.5 font-mono shadow-sm flex-shrink-0">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Actions: search, dark mode, cart, user menu / login, hamburger */}
            <div className="flex items-center gap-0.5 ml-2 lg:ml-0">

              {/* Mobile search */}
              <button onClick={() => setSearchOpen(true)} className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Search size={20} className="text-gray-600 dark:text-gray-300" />
              </button>

              {/* Dark mode */}
              <button onClick={() => dispatch(toggleDarkMode())} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Toggle theme">
                {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-500 dark:text-gray-400" />}
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link to="/wishlist" className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Heart size={20} className="text-gray-600 dark:text-gray-300" />
                  {user?.wishlist?.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-0.5">
                      {user.wishlist.length > 9 ? '9+' : user.wishlist.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <button onClick={() => dispatch(toggleCart())} className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-0.5 animate-bounce-slow">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative ml-1">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {initials}
                    </div>
                    <span className="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[80px] truncate">{user?.name}</span>
                    <ChevronDown size={13} className={`hidden md:block text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-1.5 animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.email}</p>
                      </div>
                      {[
                        { icon: User, label: 'Profile', to: '/profile' },
                        { icon: Package, label: 'My Orders', to: '/orders' },
                        { icon: Heart, label: 'Wishlist', to: '/wishlist' },
                        { icon: Settings, label: 'Settings', to: '/settings' },
                      ].map(({ icon: Icon, label, to }) => (
                        <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <Icon size={15} className="text-gray-400 flex-shrink-0" />
                          {label}
                        </Link>
                      ))}
                      {user?.role === 'doctor' && (
                        <Link to="/doctor/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                          <LayoutDashboard size={15} className="flex-shrink-0" />
                          Dashboard
                        </Link>
                      )}
                      {(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                          <Sparkles size={15} className="flex-shrink-0" />
                          Admin Panel
                        </Link>
                      )}
                      <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <LogOut size={15} className="flex-shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 ml-1">
                  <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4 rounded-xl hidden sm:inline-flex">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-0.5">
                {mobileMenuOpen ? <X size={20} className="text-gray-600 dark:text-gray-300" /> : <Menu size={20} className="text-gray-600 dark:text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────────── */}
        {mobileMenuOpen && (
            <div className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
            <div className="page-container py-4 space-y-3">
              {/* Nav links */}
              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                {NAV_LINKS.map(({ label, to }) => (
                  <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-center py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`
                    }>
                    {label}
                  </NavLink>
                ))}
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">{initials}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Login</Link>
                </div>
              )}

              <nav className="grid grid-cols-2 gap-2">
                {[
                  { icon: User, label: 'Profile', to: '/profile' },
                  { icon: Package, label: 'My Orders', to: '/orders' },
                  { icon: Heart, label: 'Wishlist', to: '/wishlist' },
                  { icon: Settings, label: 'Settings', to: '/settings' },
                  ...(user?.role === 'doctor' ? [{ icon: LayoutDashboard, label: 'Dashboard', to: '/doctor/dashboard' }] : []),
                ].map(({ icon: Icon, label, to }) => (
                  <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/70 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
                    <Icon size={15} className="text-gray-400 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </nav>

              {isAuthenticated && (
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 text-sm font-semibold text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={15} />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-[64px]" />

      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
