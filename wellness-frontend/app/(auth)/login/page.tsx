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

const LoginPage = () => {
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
    if (isAuthenticated()) {
      const redirectParam = searchParams.get("redirect");
      const safeRedirect =
        redirectParam && redirectParam.startsWith("/") ? redirectParam : null;

      if (safeRedirect) {
        router.push(safeRedirect);
        return;
      }

      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user="));

      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
          const dashboardUrl = getDashboardForRole(user.role);
          router.push(dashboardUrl);
        } catch (error) {
          console.error("Error parsing user cookie:", error);
          router.push("/profile");
        }
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

          router.replace(safeRedirect || dashboardUrl);
        } else {
          updateUserRole("user");
          const redirectParam = searchParams.get("redirect");
          const safeRedirect =
            redirectParam && redirectParam.startsWith("/")
              ? redirectParam
              : null;
          router.replace(safeRedirect || "/profile");
        }
      } else {
      }
    } catch (error) {
      console.error("Login error:", error);
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

            {/* Glass Card */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

              <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Sign In
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 animate-shake">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Email Address
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                        disabled={loading}
                        className="relative pl-11 h-12 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        placeholder="you@example.com"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                        className="relative pl-11 pr-11 h-12 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={loading}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors flex items-center gap-1 group"
                    >
                      <KeyRound className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    suppressHydrationWarning
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/70 dark:bg-gray-900/70 text-gray-500 dark:text-gray-400 font-medium">
                        New to Wellness Fuel?
                      </span>
                    </div>
                  </div>

                  {/* Sign Up Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/signup")}
                    suppressHydrationWarning
                    className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all duration-300 font-semibold group"
                  >
                    <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Create New Account
                  </Button>
                </form>

                {/* Footer */}
                <div className="text-center mt-8">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our{" "}
                    <a
                      href="/terms"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy-policy"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
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
    </div>
  );
};

export default LoginPage;
