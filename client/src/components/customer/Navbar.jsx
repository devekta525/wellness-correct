import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useLanguage } from '../../context/LanguageContext';
import { productAPI } from '../../services/api';

const NAV_LINK_KEYS = [
  { key: 'home', to: '/' },
  { key: 'products', to: '/search' },
  { key: 'consult', to: '/consultation' },
  { key: 'science', to: '/science' },
  { key: 'aboutUs', to: '/about' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { site } = useSite();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { categories } = useSelector((s) => s.products);
  const { darkMode } = useSelector((s) => s.ui);
  const cartCount = useSelector(selectCartCount);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

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
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
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
    setSuggestions([]);
  };

  // Fetch search suggestions (products) when user types
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      return;
    }
    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const res = await productAPI.getAll({ search: q, limit: 8 });
        setSuggestions(res.data?.products || []);
        setSelectedSuggestionIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const matchingCategories = searchQuery.trim().length >= 2
    ? categories.filter((c) => c.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 5)
    : [];

  const hasSuggestions = matchingCategories.length > 0 || suggestions.length > 0;
  const totalSuggestions = matchingCategories.length + suggestions.length;

  const applySuggestion = useCallback((type, item) => {
    if (type === 'category') {
      navigate(`/category/${item.slug}`);
    } else if (type === 'product' && item.slug) {
      navigate(`/product/${item.slug}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  }, [navigate, searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (!hasSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((i) => (i < totalSuggestions - 1 ? i + 1 : i));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      if (selectedSuggestionIndex < matchingCategories.length) {
        applySuggestion('category', matchingCategories[selectedSuggestionIndex]);
      } else {
        const productIndex = selectedSuggestionIndex - matchingCategories.length;
        applySuggestion('product', suggestions[productIndex]);
      }
    }
  };

  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionsRef.current) {
      const el = suggestionsRef.current.querySelector(`[data-index="${selectedSuggestionIndex}"]`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedSuggestionIndex]);

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
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2">
                <div className="relative flex-1">
                  <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 ring-2 ring-primary-500/30 focus-within:ring-primary-500">
                    <Search size={20} className="text-primary-500 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search products, brands, categories…"
                      className="flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white text-sm sm:text-base placeholder:text-gray-400 focus:outline-none"
                      autoComplete="off"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Search suggestions dropdown */}
                  {(searchQuery.trim().length >= 2) && (
                    <div
                      ref={suggestionsRef}
                      className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl max-h-[min(60vh,400px)] overflow-y-auto z-10"
                    >
                      {suggestionsLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Searching…</div>
                      ) : hasSuggestions ? (
                        <>
                          {matchingCategories.length > 0 && (
                            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Categories</p>
                              {matchingCategories.map((cat, i) => (
                                <button
                                  key={cat._id}
                                  type="button"
                                  data-index={i}
                                  onClick={() => applySuggestion('category', cat)}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${selectedSuggestionIndex === i ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                                >
                                  <img src={cat.image || 'https://via.placeholder.com/80'} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                                  <span className="font-medium truncate">{cat.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {suggestions.length > 0 && (
                            <div className="p-2">
                              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Products</p>
                              {suggestions.map((p, i) => {
                                const idx = matchingCategories.length + i;
                                const price = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
                                return (
                                  <button
                                    key={p._id}
                                    type="button"
                                    data-index={idx}
                                    onClick={() => applySuggestion('product', p)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${selectedSuggestionIndex === idx ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                                  >
                                    <img src={p.thumbnail || p.images?.[0]?.url || 'https://via.placeholder.com/80'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-700" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{p.title}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">₹{price?.toFixed(0)}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No results. Try different keywords or browse categories below.</div>
                      )}
                    </div>
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

      {/* ══ NAVBAR — no backdrop-blur on mobile so nav stays sharp ═══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 isolate transition-all duration-300 pt-safe ${
        scrolled
          ? 'bg-white dark:bg-gray-950 shadow-md border-b border-gray-200 dark:border-gray-800 lg:bg-white/95 lg:dark:bg-gray-950/95 lg:backdrop-blur-xl lg:shadow-sm'
          : 'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 h-14 sm:h-[64px] min-w-0 min-h-[44px]">

            {/* Logo — responsive, centered, retina-ready */}
            <Link to="/" className="flex items-center justify-center md:justify-start flex-shrink-0 min-w-0">
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt="Wellness Fuel"
                  className="h-8 sm:h-9 w-auto max-w-[100px] xs:max-w-[120px] sm:max-w-[140px] object-contain object-center"
                  style={{ maxWidth: 'min(140px, 28vw)', height: 'auto' }}
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="h-8 sm:h-9 w-[100px] sm:w-[140px] max-w-[120px] sm:max-w-[140px] rounded-lg bg-gray-200 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0" aria-hidden>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Logo</span>
                </div>
              )}
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 ml-2">
              {NAV_LINK_KEYS.map(({ key, to }) => (
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
                  {t(key)}
                </NavLink>
              ))}
            </div>

            {/* Spacer on mobile so actions (search, dark mode, cart, etc.) align right */}
            <div className="md:hidden flex-1 min-w-0" aria-hidden="true" />

            {/* Search bar — desktop */}
            <div className="hidden md:block ml-auto w-72 xl:w-96 min-w-[200px]">
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

            {/* Actions: search, dark mode, cart, user menu / login, hamburger — spaced for mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 lg:ml-0 flex-shrink-0">

              {/* Mobile search */}
              <button onClick={() => setSearchOpen(true)} className="md:hidden flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Search">
                <Search size={20} className="text-gray-700 dark:text-gray-200" />
              </button>

              {/* Dark mode */}
              <button onClick={() => dispatch(toggleDarkMode())} className="flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:w-auto md:h-auto md:min-w-0 md:min-h-0 md:p-2.5" title="Toggle theme" aria-label="Toggle theme">
                {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-600 dark:text-gray-300" />}
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link to="/wishlist" className="relative flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:w-auto md:h-auto md:min-w-0 md:min-h-0 md:p-2.5" aria-label="Wishlist">
                  <Heart size={20} className="text-gray-700 dark:text-gray-200" />
                  {user?.wishlist?.length > 0 && (
                    <span className="header-badge bg-red-500 text-white">
                      {user.wishlist.length > 9 ? '9+' : user.wishlist.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <button onClick={() => dispatch(toggleCart())} className="relative flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:w-auto md:h-auto md:min-w-0 md:min-h-0 md:p-2.5" aria-label="Cart">
                <ShoppingCart size={20} className="text-gray-700 dark:text-gray-200" />
                {cartCount > 0 && (
                  <span className="header-badge bg-primary-600 text-white animate-bounce-slow">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative ml-0.5">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 py-1.5 sm:pr-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
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
                        { icon: User, labelKey: 'profile', to: '/profile' },
                        { icon: Package, labelKey: 'myOrders', to: '/orders' },
                        { icon: Heart, labelKey: 'wishlist', to: '/wishlist' },
                        { icon: Settings, labelKey: 'settings', to: '/settings' },
                      ].map(({ icon: Icon, labelKey, to }) => (
                        <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <Icon size={15} className="text-gray-400 flex-shrink-0" />
                          {t(labelKey)}
                        </Link>
                      ))}
                      {user?.role === 'doctor' && (
                        <Link to="/doctor/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                          <LayoutDashboard size={15} className="flex-shrink-0" />
                          {t('dashboard')}
                        </Link>
                      )}
                      {(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                          <Sparkles size={15} className="flex-shrink-0" />
                          {t('adminPanel')}
                        </Link>
                      )}
                      <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <LogOut size={15} className="flex-shrink-0" />
                        {t('signOut')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 ml-1">
                  <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block">
                    {t('login')}
                  </Link>
                  <Link to="/login" className="btn-primary text-sm py-2 px-4 rounded-xl hidden sm:inline-flex">
                    {t('signUp')}
                  </Link>
                </div>
              )}

              {/* Mobile hamburger — clear tap target, spaced from other icons */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors ml-0.5" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
                {mobileMenuOpen ? <X size={22} className="text-gray-700 dark:text-gray-200" /> : <Menu size={22} className="text-gray-700 dark:text-gray-200" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu overlay (click outside to close) ────────────── */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-14 sm:top-[64px] z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Mobile menu (user-friendly, clear dark mode) ────────────── */}
        <div className={`relative z-50 lg:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-[85vh]' : 'max-h-0'
        }`}>
          <div className="relative z-50 bg-white dark:bg-gray-950 border-t-2 border-gray-200 dark:border-gray-800 shadow-xl animate-slide-up">
            <div className="px-4 py-5 sm:py-6 space-y-4 max-h-[calc(85vh-4rem)] overflow-y-auto">
              {/* Nav links — comfortable tap targets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                {NAV_LINK_KEYS.map(({ key, to }) => (
                  <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-center py-3 sm:py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] flex items-center justify-center ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800'
                      }`
                    }>
                    {t(key)}
                  </NavLink>
                ))}
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0">{initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-base truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-3 min-h-[44px] flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">{t('login')}</Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-3 min-h-[44px] flex items-center justify-center btn-primary text-sm font-semibold rounded-xl">{t('signUp')}</Link>
                </div>
              )}

              <nav className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {[
                  { icon: User, labelKey: 'profile', to: '/profile' },
                  { icon: Package, labelKey: 'myOrders', to: '/orders' },
                  { icon: Heart, labelKey: 'wishlist', to: '/wishlist' },
                  { icon: Settings, labelKey: 'settings', to: '/settings' },
                  ...(user?.role === 'doctor' ? [{ icon: LayoutDashboard, labelKey: 'dashboard', to: '/doctor/dashboard' }] : []),
                  ...((user?.role === 'admin' || user?.role === 'superadmin') ? [{ icon: Sparkles, labelKey: 'adminPanel', to: '/admin' }] : []),
                ].map(({ icon: Icon, labelKey, to }) => (
                  <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 active:bg-primary-100 dark:active:bg-primary-900/30 transition-colors">
                    <Icon size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    {t(labelKey)}
                  </Link>
                ))}
              </nav>

              {isAuthenticated && (
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <LogOut size={18} />
                  {t('signOut')}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer — match nav height (includes safe-area on notched devices) */}
      <div className="h-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:h-[calc(4rem+env(safe-area-inset-top,0px))]" />

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
