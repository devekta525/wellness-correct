"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Eye,
  EyeOff,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowLeft,
  CheckCircle,
  UserCheck,
  Calendar,
  Loader2,
  Sparkles,
  Heart,
  Target,
  TrendingUp,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  registerUser,
  selectAuthError,
  clearAuthError,
} from "@/lib/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useEffect } from "react";
import {
  storeAuthData,
  updateUserRole,
  getDashboardForRole,
} from "@/lib/utils/auth";
import Swal from "sweetalert2";

const SignupPage = () => {
  const dispatch = useAppDispatch();
  const authError = useAppSelector(selectAuthError);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    userType: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [cpass, setCpass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    if (authError) dispatch(clearAuthError());
  };

  const handlePassword = (e: any) => {
    setCpass(e.target.value);
    setError("");
    if (authError) dispatch(clearAuthError());
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.userType) {
        setError("Please select a user type");
        return false;
      }
      if (!formData.firstName || !formData.lastName) {
        setError("Please enter your full name");
        return false;
      }
      if (!formData.phone) {
        setError("Please enter your phone number");
        return false;
      }
      // Validate phone format (at least 10 digits)
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        setError("Please enter a valid phone number (at least 10 digits)");
        return false;
      }
      if (!formData.dateOfBirth) {
        setError("Please enter your date of birth");
        return false;
      }
      // Validate age (must be at least 13 years old)
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
          ? age - 1
          : age;
      if (actualAge < 13) {
        setError("You must be at least 13 years old to register");
        return false;
      }
      if (actualAge > 120) {
        setError("Please enter a valid date of birth");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.email) {
        setError("Please enter your email");
        return false;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
      if (!formData.password || !cpass) {
        setError("Please enter your password");
        return false;
      }
      if (formData.password !== cpass) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.address) {
        setError("Please enter your address");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsLoading(true);
    setError("");

    const result = await dispatch(registerUser(formData));
    setIsLoading(false);

    if (result && result.success) {
      Swal.fire({
        title: "Account Created",
        text: "Your account has been created successfully",
        icon: "success",
      });
      setSuccess(true);

      if (result.session) {
        storeAuthData(result.session);
        if (result.user && result.user.role) {
          updateUserRole(result.user.role);
        }
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get("redirect");
      const safeRedirect = redirectParam && redirectParam.startsWith("/") ? redirectParam : null;

      setTimeout(() => {
        const role = result.user?.role || formData.userType;
        const dashboardUrl = getDashboardForRole(role);
        window.location.href = safeRedirect || dashboardUrl;
      }, 2000);
    } else {
      Swal.fire({
        title: "Signup Failed",
        text: result?.message || "Signup failed",
        icon: "error",
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-950 dark:to-emerald-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(52,211,153,0.3),rgba(255,255,255,0))]"></div>
        </div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative w-full max-w-md mx-6">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Account Created!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Welcome to Wellness Fuel! Redirecting you to your dashboard...
              </p>
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Account Setup", icon: Lock },
    { number: 3, title: "Additional Details", icon: MapPin },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.3),rgba(255,255,255,0))]"></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>

      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className="max-w-lg space-y-8 z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                Begin Your
                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Wellness Journey
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Join thousands who have transformed their health with our
                science-backed solutions.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Personalized Plans
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customized wellness programs just for you
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Expert Guidance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access to certified health professionals
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Track Progress
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor your health journey in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-2xl space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Wellness Fuel
              </h1>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.number
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50"
                        : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <step.icon
                          className={`w-6 h-6 ${currentStep >= step.number
                            ? "text-white"
                            : "text-gray-400"
                            }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium hidden sm:block ${currentStep >= step.number
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-gray-400"
                        }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${currentStep > step.number
                        ? "bg-gradient-to-r from-purple-600 to-pink-600"
                        : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Card */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 rounded-2xl blur-lg opacity-10" aria-hidden="true" />

              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <button
                    type="button"
                    onClick={() =>
                      currentStep === 1 ? router.push("/login") : prevStep()
                    }
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <div className="text-center flex-1">
                    <h2 className="text-3xl font-bold text-gray-900">
                      Create Account
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Step {currentStep} of 3
                    </p>
                  </div>
                  <div className="w-14" />
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {error && (
                    <div className="p-3.5 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
                      {error}
                    </div>
                  )}

                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      {/* User Type Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          I am a
                        </label>
                        <Select
                          value={formData.userType}
                          onValueChange={(value) =>
                            handleInputChange("userType", value)
                          }
                        >
                          <SelectTrigger className="h-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>General User</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="doctor">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4" />
                                <span>Doctor</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="influencer">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Influencer</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700"
                          >
                            First Name
                          </label>
                          <div className="relative flex items-center">
                            <User className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                            <Input
                              id="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              required
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                              placeholder="John"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Last Name
                          </label>
                          <div className="relative flex items-center">
                            <User className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                            <Input
                              id="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              required
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone & DOB */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Phone Number
                          </label>
                          <div className="relative flex items-center">
                            <Phone className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              required
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                              placeholder="+91 8102904321"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="dateOfBirth"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Date of Birth
                          </label>
                          <div className="relative flex items-center">
                            <Calendar className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) =>
                                handleInputChange("dateOfBirth", e.target.value)
                              }
                              required
                              max={
                                new Date(
                                  new Date().setFullYear(
                                    new Date().getFullYear() - 13,
                                  ),
                                )
                                  .toISOString()
                                  .split("T")[0]
                              }
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-3 h-12 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-xl p-3.5 border border-indigo-100">
                        <p className="text-xs text-indigo-700">
                          <strong>Note:</strong> Phone number must have at least
                          10 digits. You must be at least 13 years old to
                          register.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Account Setup */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email Address
                        </label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            required
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      {/* Password Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Password
                          </label>
                          <div className="relative flex items-center">
                            <Lock className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) =>
                                handleInputChange("password", e.target.value)
                              }
                              required
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-11 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Confirm Password
                          </label>
                          <div className="relative flex items-center">
                            <Lock className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={cpass}
                              onChange={handlePassword}
                              required
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-11 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-xl p-3.5 border border-indigo-100">
                        <p className="text-xs text-indigo-700">
                          <strong>Password requirements:</strong> At least 6
                          characters long
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Additional Details */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      {/* Address */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Address
                        </label>
                        <div className="relative flex items-center">
                          <MapPin className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                          <Input
                            id="address"
                            type="text"
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            required
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="123 Main Street"
                          />
                        </div>
                      </div>

                      {/* City, State, ZIP */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700"
                          >
                            City
                          </label>
                          <Input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="City"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700"
                          >
                            State
                          </label>
                          <Input
                            id="state"
                            type="text"
                            value={formData.state}
                            onChange={(e) =>
                              handleInputChange("state", e.target.value)
                            }
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="State"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="zipCode"
                            className="block text-sm font-medium text-gray-700"
                          >
                            ZIP Code
                          </label>
                          <Input
                            id="zipCode"
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) =>
                              handleInputChange("zipCode", e.target.value)
                            }
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 h-12 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ZIP"
                          />
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-xl p-3.5 border border-indigo-100">
                        <p className="text-xs text-indigo-700">
                          These details help us provide better personalized
                          recommendations.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="pt-2">
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="w-full h-12 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-lg shadow-indigo-300/50 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-lg shadow-indigo-300/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-5 h-5" />
                            Create Account
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>

                {/* Footer */}
                <p className="text-sm text-gray-500 text-center mt-6">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
