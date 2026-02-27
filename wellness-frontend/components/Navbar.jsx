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
  ChevronDown,
  LogOut,
} from "lucide-react";
import logo from "../public/logo.jpeg";
import { useRouter } from "next/navigation";
import { clearAuthData } from "@/lib/utils/auth";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout as reduxLogout } from "@/lib/redux/features/authSlice";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Shop", href: "/shop" },
  { label: "Science", href: "/science" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount] = useState(2);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Determine if authenticated
    setIsLoggedIn(!!localStorage.getItem("authToken"));
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    dispatch(reduxLogout());
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
    // redirect any logged‑out user to the public home page
    router.push("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/96 backdrop-blur-xl shadow-lg shadow-blue-50/60 border-b border-blue-50"
            : "bg-white/80 backdrop-blur-md"
        }`}
      >
        {/* Top announcement bar */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white text-[11px] font-medium text-center py-2 tracking-wide">
          🌿 Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; Use Code{" "}
          <span className="font-bold text-cyan-200">WELLNESS20</span> for 20%
          Off
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-blue-300 transition-shadow duration-300 overflow-hidden bg-white">
                  <Image
                    src={logo}
                    alt="Wellness Fuel Logo"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="leading-none">
                <div className="text-[20px] font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent font-serif tracking-tight">
                  Wellness Fuel
                </div>
                <div className="text-[9px] text-blue-400 tracking-[0.18em] uppercase font-semibold">
                  Premium Nutrition
                </div>
              </div>
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200 group py-1"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* ── Icon group ── */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
                className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Profile */}
              {isClient ? (
                isLoggedIn ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <Link
                      href="/profile"
                      aria-label="My Account"
                      className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-1"
                    >
                      <User className="w-[18px] h-[18px]" />
                    </Link>
                    {isUserMenuOpen && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white shadow-xl rounded-xl border border-blue-50 py-2 z-50">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setIsUserMenuOpen(false)}
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
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    aria-label="Login"
                    className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <User className="w-[18px] h-[18px]" />
                  </Link>
                )
              ) : (
                <div className="p-2.5 rounded-xl text-transparent">
                  <User className="w-[18px] h-[18px]" />
                </div>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="relative p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <ShoppingCart className="w-[18px] h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* CTA (desktop) */}
              <Link
                href="/shop"
                className="hidden lg:inline-flex items-center gap-1.5 ml-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.03] transition-all duration-300"
              >
                Shop Now
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
                className="md:hidden ml-1 p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                {isMobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isSearchOpen ? "max-h-20 border-b border-blue-50" : "max-h-0"
          } bg-white`}
        >
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5">
              <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products, ingredients, benefits…"
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-blue-300 outline-none"
                autoFocus={isSearchOpen}
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileOpen ? "max-h-96" : "max-h-0"
          } bg-white/98 backdrop-blur-xl border-t border-blue-50`}
        >
          <div className="px-4 py-5 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                {link.label}
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
              </Link>
            ))}
            <div className="pt-3 border-t border-blue-50">
              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold rounded-xl"
                onClick={() => setIsMobileOpen(false)}
              >
                Shop Now
              </Link>
              {isClient && isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full mt-2 py-3 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-[68px] mt-[34px]" />
    </>
  );
}
