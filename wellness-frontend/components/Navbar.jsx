"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Heart,
  Home,
  Info,
  ShoppingBag,
  BookOpen,
  FlaskConical,
  Mail,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../public/logo.jpeg";
import { useRouter } from "next/navigation";
import { clearAuthData } from "@/lib/utils/auth";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout as reduxLogout } from "@/lib/redux/features/authSlice";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "About Us", href: "/about", icon: Info },
  { label: "Shop", href: "/shop", icon: ShoppingBag },
  { label: "Blogs", href: "/blogs", icon: BookOpen },
  { label: "Science", href: "/science", icon: FlaskConical },
  { label: "Contact", href: "/contact", icon: Mail },
];

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartCount = useSelector((state) => state.cart.totalQuantity);
  const wishlistCount = useSelector((state) => state.wishlist?.totalQuantity || 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Determine if authenticated
    setIsLoggedIn(!!localStorage.getItem("authToken"));
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileOpen]);

  const handleLogout = () => {
    clearAuthData();
    dispatch(reduxLogout());
    setIsLoggedIn(false);
    setIsMobileOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 bg-white shadow-sm border-b border-gray-100`}
      >
        {/* Top announcement bar */}
        <div className="bg-[#1e40af] text-white text-[12px] font-medium flex items-center justify-center min-h-[32px] sm:min-h-[36px] px-4 text-center tracking-wide">
          <p>
            Free Shipping on Orders Above ₹999 <span className="mx-1.5 opacity-60">|</span> Use Code <span className="font-bold">WELLNESS20</span> for 20% Off
          </p>
        </div>

        <div className="w-full max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-[60px] md:h-[68px]">
            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <Image
                src={logo}
                alt="Wellness Fuel Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded-md shadow-sm"
              />
              <div className="leading-none flex-col hidden sm:flex">
                <span className="text-xl font-bold text-gray-900 font-serif tracking-tight">
                  Wellness Fuel
                </span>
                <span className="text-[9px] text-blue-500 tracking-[0.18em] uppercase font-semibold">
                  Premium Nutrition
                </span>
              </div>
            </Link>

            {/* ── Desktop nav (Hidden on Mobile) ── */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative text-[15px] font-medium text-gray-600 hover:text-[#1e40af] transition-colors duration-200 group py-1"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1e40af] rounded-full group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* ── Icon group ── */}
            <div className="flex items-center gap-[12px] sm:gap-[14px] md:gap-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
                className="p-1 text-gray-700 hover:text-[#1e40af] transition-colors"
              >
                <Search className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
              </button>

              {/* Wishlist (Desktop Only) */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative hidden md:flex p-1 text-gray-700 hover:text-red-500 transition-colors"
              >
                <Heart className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                {isClient && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Profile (Desktop Only) */}
              {isClient ? (
                <div className="hidden md:block relative group/profile">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/profile"
                        className="p-1 text-gray-700 hover:text-[#1e40af] transition-colors flex"
                      >
                        <User className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                      </Link>
                      <div className="hidden hover:block group-hover/profile:block absolute top-[110%] right-0 w-48 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-50 transition-all opacity-0 group-hover/profile:opacity-100">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-[#1e40af] hover:bg-gray-50"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      aria-label="Login"
                      className="p-1 text-gray-700 hover:text-[#1e40af] transition-colors flex"
                    >
                      <User className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="hidden md:block p-1 text-transparent">
                  <User className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                </div>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="relative p-1 text-gray-700 hover:text-[#1e40af] transition-colors"
              >
                <ShoppingCart className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                {isClient && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1e40af] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger (Mobile Only) */}
              <button
                onClick={() => setIsMobileOpen(true)}
                aria-label="Toggle menu"
                className="md:hidden ml-1 p-1 text-gray-700 hover:text-[#1e40af] transition-colors"
              >
                <Menu className="w-[22px] h-[22px]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Search bar (Dropdown) ── */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white border-b border-gray-100 shadow-md"
            >
              <div className="w-full max-w-screen-xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2.5 rounded-lg text-gray-500 hover:text-[#1e40af] bg-gray-50 hover:bg-blue-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile Sidebar Drawer ── */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[110] md:hidden"
              />

              {/* Drawer (Slide from Right) */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-white z-[120] md:hidden shadow-2xl flex flex-col"
              >
                {/* Drawer Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Image src={logo} alt="Logo" width={28} height={28} className="rounded-md shadow-sm" />
                    <span className="text-lg font-bold text-gray-900 font-serif">Wellness Fuel</span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-800 bg-gray-50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Menu Items */}
                <div className="flex-1 overflow-y-auto py-2 flex flex-col">
                  <div className="space-y-0.5 px-3">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-between px-3 py-3.5 rounded-xl text-gray-700 hover:text-[#1e40af] hover:bg-blue-50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3.5">
                          <link.icon className="w-[18px] h-[18px] text-gray-400 group-hover:text-[#1e40af]" />
                          <span className="font-semibold text-[15px]">{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </Link>
                    ))}
                  </div>

                  <div className="h-px bg-gray-100 my-4 mx-4"></div>

                  <div className="px-3 space-y-0.5 pb-20">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">My Account</p>

                    {/* Wishlist in Menu */}
                    <Link
                      href="/wishlist"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center justify-between px-3 py-3.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <Heart className="w-[18px] h-[18px] text-gray-400" />
                        <span className="font-semibold text-[15px]">My Wishlist</span>
                      </div>
                      {isClient && wishlistCount > 0 && (
                        <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setIsMobileOpen(false)}
                          className="flex items-center gap-3.5 px-3 py-3.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          <User className="w-[18px] h-[18px] text-gray-400" />
                          <span className="font-semibold text-[15px]">My Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3.5 w-full px-3 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-[18px] h-[18px]" />
                          <span className="font-semibold text-[15px]">Logout</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-3.5 px-3 py-3.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        <User className="w-[18px] h-[18px] text-gray-400" />
                        <span className="font-semibold text-[15px]">Login / Register</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Drawer Footer CTA */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1e40af] text-white text-[15px] font-bold rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Now
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar: 32px top bar + 60px nav on mobile = 92px */}
      <div className="h-[92px] sm:h-[104px]" />
    </>
  );
}
