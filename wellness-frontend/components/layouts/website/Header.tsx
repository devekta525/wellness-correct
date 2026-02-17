"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthData } from '@/lib/utils/auth';
import { useAppDispatch } from '@/lib/redux/hooks';
import { logout as reduxLogout } from '@/lib/redux/features/authSlice';
import { useCart } from '@/lib/context/CartContext';
import {
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  X,
  ShoppingCart,
  Search,
  ChevronDown,
  Heart,
  Truck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LOGO_URL from '../../../public/logo.jpeg';

const Header = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cartCount } = useCart();
  const [user, setUser] = useState<any>(null); // Use any or proper type from your utils
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    // Simple cookie check for client-side rendering
    const checkUser = () => {
      const cookies = document.cookie.split(';');
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setUser(userData);
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
    checkUser();
  }, []);

  const handleLogout = async () => {
    clearAuthData();
    dispatch(reduxLogout());
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/login');
  };

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/shop", label: "Shop", hasDropdown: true },
    { href: "/science", label: "Science" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    const role = user.role || (user.user && user.user.role) || 'user';
    switch (role.toLowerCase()) {
      case "admin": return "/dashboard";
      case "doctor": return "/doctors";
      case "influencer": return "/influencers";
      case "user":
      case "customer":
        return "/profile";
      default: return "/profile";
    }
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white py-2.5 overflow-hidden relative z-50 shadow-sm">
        <div className="flex items-center justify-center gap-8 animate-marquee whitespace-nowrap text-xs md:text-sm font-bold tracking-wide">
          {Array(10).fill("Up to 40% off Sitewide").map((text, i) => (
            <div key={i} className="flex items-center gap-8">
              <span>{text}</span>
              <span className="text-white/50">•</span>
            </div>
          ))}
        </div>
      </div>

      <header className="w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 shadow-sm sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20 md:h-24">

            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group block">
                {!logoError ? (
                  <div className="w-[140px] md:w-[180px] h-[40px] md:h-[60px] relative flex items-center">
                    <Image
                      src={LOGO_URL}
                      alt="Wellness"
                      className="object-contain object-left transition-transform duration-300 group-hover:scale-105"
                      onError={handleLogoError}
                      fill
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center text-blue-600">
                      <span className="text-lg font-bold">W</span>
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-blue-600 tracking-tight">
                      Wellness
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-8 2xl:gap-10">
              {navigationItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 text-[15px] font-bold transition-all duration-300 py-4 tracking-wide ${isActive(item.href)
                      ? "text-blue-600"
                      : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                  >
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5 mt-0.5 stroke-[3] transition-transform duration-300 group-hover:-rotate-180" />}
                    
                    {/* Hover Underline Animation */}
                    <span className={`absolute bottom-2 left-0 w-full h-0.5 bg-blue-600 transform origin-left transition-transform duration-300 ${isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </Link>

                  {/* Shop Mega Menu */}
                  {item.hasDropdown && item.label === "Shop" && (
                    <div className="absolute top-[calc(100%-10px)] left-1/2 -translate-x-1/2 w-[900px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-blue-900/10 rounded-3xl border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 lg:group-hover:translate-x-[-50%] z-50 overflow-hidden ring-1 ring-black/5">
                      <div className="flex">
                        {/* Section 1: Nutraceutical Products */}
                        <div className="w-2/3 p-8 border-r border-slate-100 dark:border-slate-800">
                          <h3 className="text-blue-900 dark:text-white font-extrabold text-lg mb-6 flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                            Nutraceutical Products & Development
                          </h3>
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-blue-600 dark:text-blue-400 font-bold text-xs mb-3 uppercase tracking-widest">Product Development</h4>
                              <div className="flex flex-col gap-2">
                                <Link href="/shop?category=antioxidant" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Advanced antioxidant formulations</Link>
                                <Link href="/shop?category=glutathione" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Glutathione-based wellness</Link>
                                <Link href="/shop?category=nutraceutical" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Custom nutraceutical solutions</Link>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-blue-600 dark:text-blue-400 font-bold text-xs mb-3 uppercase tracking-widest">Preventive & Vitality</h4>
                              <div className="flex flex-col gap-2">
                                <Link href="/shop?category=vitality" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Heart, brain & eye health</Link>
                                <Link href="/shop?category=cellular" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Cellular defense protection</Link>
                                <Link href="/shop?category=longevity" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">General longevity support</Link>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-blue-600 dark:text-blue-400 font-bold text-xs mb-3 uppercase tracking-widest">Quality Assurance</h4>
                              <div className="flex flex-col gap-2">
                                <Link href="/shop?category=fssai" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">FSSAI-compliant products</Link>
                                <Link href="/shop?category=premium" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Premium ingredient sourcing</Link>
                              </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-slate-800/50 p-4 rounded-xl">
                              <p className="text-slate-600 text-xs font-bold mb-2">SHOP ALL COLLECTION</p>
                              <Link href="/shop" className="text-blue-600 text-sm font-extrabold hover:underline">View All Products →</Link>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Health & Wellness Services/Solutions */}
                        <div className="w-1/3 p-8 bg-slate-50/50 dark:bg-slate-800/20">
                          <h3 className="text-blue-900 dark:text-white font-extrabold text-lg mb-6 flex items-center gap-2">
                            <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                            Wellness Solutions
                          </h3>
                          <div className="space-y-8">
                            <div>
                              <h4 className="text-cyan-600 dark:text-cyan-400 font-bold text-xs mb-3 uppercase tracking-widest">Skin & Radiance</h4>
                              <div className="flex flex-col gap-2">
                                <Link href="/shop?category=brightening" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Skin brightening & pigmentation</Link>
                                <Link href="/shop?category=anti-aging" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Anti-aging & radiance solutions</Link>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-cyan-600 dark:text-cyan-400 font-bold text-xs mb-3 uppercase tracking-widest">Detox & Immunity</h4>
                              <div className="flex flex-col gap-2">
                                <Link href="/shop?category=liver-detox" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Liver detox support supplements</Link>
                                <Link href="/shop?category=immunity" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm py-1 transition-colors">Immunity-boosting nutraceuticals</Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Icons / Actions */}
            <div className="hidden md:flex items-center gap-6">
              {/* Search */}
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Search className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
              </motion.button>

              {/* Logged In User Actions */}
              {isClient && user && (
                <>
                  <Link href="/wishlist" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                  </Link>
                  <Link href="/track-order" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Truck className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                  </Link>
                </>
              )}

              {/* Profile / User */}
              {isClient && user ? (
                <div
                  className="relative flex items-center gap-2"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <User className="w-4 h-4 md:w-5 md:h-5 stroke-[2]" />
                    </div>
                    <span className="text-sm font-bold hidden lg:block">
                      Hi, {user.name?.split(' ')[0] || user.user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </Link>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 shadow-2xl shadow-blue-900/10 rounded-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden ring-1 ring-black/5"
                      >
                      <div className="p-2 flex flex-col gap-1">
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800/50 hover:text-blue-600 rounded-xl transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <User className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                <span className="sr-only">Cart</span>
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center gap-4">
              <Link href="/cart" className="md:hidden relative p-2 text-slate-700 dark:text-slate-300">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <button
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "calc(100vh - 80px)" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="xl:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 absolute w-full left-0 shadow-xl overflow-y-auto z-30"
            >
            <nav className="flex flex-col p-6 space-y-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex justify-between items-center text-lg font-bold p-2 rounded-xl transition-colors ${isActive(item.href)
                    ? "text-blue-600"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-5 h-5" />}
                </Link>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-2 space-y-4">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-3 text-lg font-semibold text-slate-700 dark:text-slate-300 p-2 hover:bg-slate-50 rounded-xl"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-6 h-6" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-lg font-semibold text-red-600 dark:text-red-400 text-left w-full p-2 hover:bg-red-50 rounded-xl"
                    >
                      <LogOut className="w-6 h-6" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link href="/login" className="flex items-center gap-3 text-lg font-semibold text-slate-700 dark:text-slate-300 p-2 hover:bg-slate-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-6 h-6" />
                      <span>Login</span>
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-3 text-lg font-semibold text-slate-700 dark:text-slate-300 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                  <Search className="w-6 h-6" />
                  <span>Search</span>
                </div>
              </div>
            </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;