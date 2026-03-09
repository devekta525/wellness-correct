"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Eye,
  EyeOff,
  Lock,
  UserPlus,
  KeyRound,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  loginUser,
  selectAuthError,
  selectAuthLoading,
  setUser,
} from "@/lib/redux/features/authSlice";
import {
  storeAuthData,
  isAuthenticated,
  fetchUserDetails,
  updateUserRole,
  getDashboardForRole,
} from "@/lib/utils/auth";
import Image from "next/image";
import Swal from "sweetalert2";

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const loading = useAppSelector(selectAuthLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const redirectParam = searchParams.get("redirect");
      const safeRedirect =
        redirectParam && redirectParam.startsWith("/") ? redirectParam : null;

      if (safeRedirect) {
        router.push(safeRedirect);
      } else {
        router.push("/profile");
      }
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginUser(email, password));

      if (
        result &&
        (result.success ||
          (result.message === "login successful" && result.session))
      ) {
        Swal.fire({
          title: "Login Successful",
          text: "Welcome back!",
          icon: "success",
        });
        const { session } = result;
        storeAuthData(session);

        let userDetails = result.user;

        if (!userDetails) {
          try {
            userDetails = await fetchUserDetails(session.user, session.token);
          } catch (err) {
            console.error("Failed to fetch user details:", err);
          }
        }

        if (userDetails && userDetails.role) {
          dispatch(setUser(userDetails));
          updateUserRole(userDetails.role);

          const redirectParam = searchParams.get("redirect");
          const safeRedirect =
            redirectParam && redirectParam.startsWith("/")
              ? redirectParam
              : null;
          const dashboardUrl = getDashboardForRole(userDetails.role);

          window.location.href = safeRedirect || dashboardUrl;
        } else {
          updateUserRole("user");
          const redirectParam = searchParams.get("redirect");
          const safeRedirect =
            redirectParam && redirectParam.startsWith("/")
              ? redirectParam
              : null;
          window.location.href = safeRedirect || "/profile";
        }
      } else {
        Swal.fire({
          title: "Login Failed",
          text: result?.message || "Invalid credentials",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        title: "Login Failed",
        text: (error as any)?.message || "Invalid credentials",
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>

      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className="max-w-lg space-y-8 z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Wellness Fuel
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your Health, Elevated
                </p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Welcome Back to Your
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Wellness Journey
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Access your personalized health dashboard and continue your path
                to optimal wellness.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Secure & Private
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your health data is encrypted and protected
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Personalized Experience
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tailored recommendations just for you
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Premium Quality
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Science-backed wellness solutions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Wellness Fuel
              </h1>
            </div>

            {/* Card */}
            <div className="relative">
              {/* Subtle glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-10" aria-hidden="true" />

              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Sign In
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {error && (
                    <div className="p-3.5 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail
                        className="absolute left-3 w-4.5 h-4.5 text-gray-400 pointer-events-none"
                        aria-hidden="true"
                      />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                        disabled={loading}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock
                        className="absolute left-3 w-4.5 h-4.5 text-gray-400 pointer-events-none"
                        aria-hidden="true"
                      />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-11 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={loading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors disabled:opacity-50"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <KeyRound className="w-4 h-4" aria-hidden="true" />
                      Forgot Password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    suppressHydrationWarning
                    className="w-full py-3 h-12 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-lg shadow-indigo-300/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-2">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="text-gray-400 text-xs font-medium whitespace-nowrap">
                      New to Wellness Fuel?
                    </span>
                    <div className="flex-1 border-t border-gray-200" />
                  </div>

                  {/* Create Account Button */}
                  <button
                    type="button"
                    onClick={() => router.push("/signup")}
                    suppressHydrationWarning
                    className="w-full border border-gray-300 py-3 h-12 rounded-xl font-medium text-sm bg-white hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2 transition-all duration-200 text-gray-700 hover:shadow-md"
                  >
                    <UserPlus className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                    Create New Account
                  </button>
                </form>

                {/* Footer */}
                <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
                  By signing in, you agree to our{" "}
                  <a
                    href="/terms"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  );
};

export default LoginPage;
