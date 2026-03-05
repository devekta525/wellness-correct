"use client";

import React, { useEffect, useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsCards from "@/components/profile/StatsCards";
import OverviewTab from "@/components/profile/OverviewTab";
import OrdersTab from "@/components/profile/OrdersTab";
import AddressTab from "@/components/profile/AddressTab";
import AppointmentsTab from "@/components/profile/AppointmentsTab";
import PrescriptionsTab from "@/components/profile/PrescriptionsTab";
import SecuritySettings from "@/components/profile/SettingsTab";
import ProfileDialogs from "@/components/profile/ProfileDialogs";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import logoImage from "@/public/logo.jpeg";

import {
  logoutUser,
  selectUser,
  setUser,
  User,
} from "@/lib/redux/features/authSlice";
import { fetchUserDetails, getSessionData } from "@/lib/utils/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Package,
  MapPin,
  Calendar,
  Pill,
  ShieldCheck,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * UserProfile Component
 * Redesigned for a modern SaaS sidebar-based experience.
 */
const UserProfile = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUser = useAppSelector(selectUser);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [editingProfile, setEditingProfile] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : '';
      const sessionData = getSessionData();

      if (sessionData && !currentUser) {
        try {
          const userDetails = await fetchUserDetails(sessionData.user, sessionData.token);
          if (userDetails) {
            dispatch(setUser(userDetails));
          }
        } catch (error) {
          console.error("Error loading user:", error);
        }
      }

      if (storedToken) setToken(storedToken);
      else if (sessionData?.token) setToken(sessionData.token);
    };

    loadUserFromStorage();
    setIsMounted(true);
  }, [dispatch, currentUser]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProfile(null);
  };

  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser());
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const navItems = [
    { value: "overview", label: "Overview", icon: UserIcon },
    { value: "orders", label: "Orders", icon: Package },
    { value: "addresses", label: "Addresses", icon: MapPin },
    { value: "appointments", label: "Appointments", icon: Calendar },
    { value: "prescriptions", label: "Prescription", icon: Pill },
    { value: "security", label: "Security", icon: ShieldCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            profile={editingProfile || (currentUser as User)}
            isEditing={isEditing}
            onProfileChange={(profile) => setEditingProfile(profile)}
            currentUser={currentUser as User}
          />
        );
      case "orders":
        return <OrdersTab />;
      case "addresses":
        return <AddressTab />;
      case "appointments":
        return <AppointmentsTab />;
      case "prescriptions":
        return <PrescriptionsTab />;
      case "security":
        return (
          <SecuritySettings
            onChangePassword={() => setShowChangePassword(true)}
            onPaymentMethods={() => { }}
            onDownloadData={() => { }}
            onDeleteAccount={() => setShowDeleteAccount(true)}
            onTwoFactorAuth={() => { }}
            onLoginHistory={() => { }}
          />
        );
      default:
        return null;
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 overflow-hidden font-sans italic-free">
      {/* 1️⃣ LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-blue-100 min-h-screen sticky top-0 shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/10 border border-blue-50">
              <img
                src={logoImage.src} alt="Wellness" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Wellness</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] leading-none mt-1">User Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1.5 font-bold">
            {navItems.map((item) => {
              const isActive = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setActiveTab(item.value)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-blue-50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 px-4 py-2 w-full text-slate-400 hover:text-red-500 transition-colors font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/10 border border-blue-50">
                      <img src={logoImage.src} alt="Wellness" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-slate-900">Wellness</span>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mt-0.5">Dashboard</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                    <X className="w-6 h-6 text-slate-400" />
                  </Button>
                </div>

                <nav className="space-y-1.5 font-bold">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.value;
                    return (
                      <button
                        key={item.value}
                        onClick={() => {
                          setActiveTab(item.value);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all ${isActive
                          ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white shadow-md shadow-blue-500/10"
                          : "text-slate-500 hover:bg-slate-50"
                          }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-auto p-8 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-4 px-4 py-2 w-full text-slate-400 hover:text-red-500 transition-colors font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2️⃣ MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-y-auto bg-slate-50/10">
        {/* Mobile Header (Sticky) */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-blue-50 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-50 shadow-sm">
              <img src={logoImage.src} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Profile</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600" />
          </Button>
        </header>

        <main className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8 lg:space-y-10">
          {/* 3️⃣ PROFILE HEADER */}
          <ProfileHeader
            profile={editingProfile || (currentUser as User)}
            isEditing={isEditing}
            onEdit={() => {
              setEditingProfile(currentUser);
              setIsEditing(true);
            }}
            onCancel={handleCancelEdit}
            showEditButton={activeTab === "overview"}
            currentUser={currentUser as User}
            editingProfile={editingProfile}
            token={token}
            onSuccess={(updatedUser: User) => {
              dispatch(setUser(updatedUser));
              setIsEditing(false);
              setEditingProfile(null);
            }}
          />

          {/* 4️⃣ STATS SECTION */}
          <StatsCards
            stats={{
              totalOrders: 0,
              totalSpent: 0,
              averageOrderValue: 0,
              favoriteCategory: "Health",
              lastOrderDate: "Active",
            }}
          />

          {/* Render Active Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ProfileDialogs
        showChangePassword={showChangePassword}
        showDeleteAccount={showDeleteAccount}
        onCloseChangePassword={() => setShowChangePassword(false)}
        onCloseDeleteAccount={() => setShowDeleteAccount(false)}
        onChangePassword={() => setShowChangePassword(false)}
        onDeleteAccount={() => setShowDeleteAccount(false)}
      />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        body { 
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #fbfcfe;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;