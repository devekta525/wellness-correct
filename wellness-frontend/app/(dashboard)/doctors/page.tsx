"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Stethoscope,
  Award,
  Plus,
  DollarSign,
  Star,
  Loader2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchDoctorDashboard,
  selectDashboardData,
  selectDashboardLoading,
  fetchTodaysAppointmentCount,
  selectTodaysAppointmentCount,
} from "@/lib/redux/features/dashboardSlice";
import {
  fetchPatientStats,
  selectPatientStats,
} from "@/lib/redux/features/patientSlice";

const DoctorsDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const dashboardData = useSelector(selectDashboardData);
  const isLoading = useSelector(selectDashboardLoading);
  const todaysAppointmentCountFromAPI = useSelector(selectTodaysAppointmentCount);
  const patientStats = useSelector(selectPatientStats);

  useEffect(() => {
    dispatch(fetchDoctorDashboard());
    dispatch(fetchTodaysAppointmentCount());
    dispatch(fetchPatientStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  type DashboardStats = NonNullable<ReturnType<typeof selectDashboardData>>["stats"];
  const defaultStats: DashboardStats = {
    todayAppointments: 0,
    totalPatients: 0,
    prescriptionsCount: 0,
    consultationFee: 0,
    rating: 0,
    experience: "0 Years",
  };

  const statsData: DashboardStats = { ...defaultStats, ...(dashboardData?.stats ?? {}) };
  if (todaysAppointmentCountFromAPI !== null) statsData.todayAppointments = todaysAppointmentCountFromAPI;
  const totalPatientsFromAPI = patientStats?.totalPatients ?? null;
  if (totalPatientsFromAPI !== null) statsData.totalPatients = totalPatientsFromAPI;

  const todaysAppointments = dashboardData?.todaysAppointments || [];
  const recentPrescriptions = dashboardData?.recentPrescriptions || [];
  const doctorName = dashboardData?.doctorName || "Doctor";

  // Stats — first 4 shown in top row (as in screenshot), then 2 below
  const stats = [
    {
      name: "Today's Appointments",
      value: statsData.todayAppointments.toString(),
      icon: Calendar,
      sub: "Today",
      subPositive: false,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      route: "/doctors/appointments",
    },
    {
      name: "Total Patients",
      value: statsData.totalPatients.toLocaleString(),
      icon: Users,
      sub: "Active",
      subPositive: true,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-500",
      route: "/doctors/patients",
    },
    {
      name: "Prescriptions Written",
      value: statsData.prescriptionsCount.toString(),
      icon: FileText,
      sub: "Total",
      subPositive: false,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      route: "/doctors/prescriptions",
    },
    {
      name: "Consultation Fee",
      value: `₹${statsData.consultationFee}`,
      icon: DollarSign,
      sub: "Standard",
      subPositive: true,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      route: "/doctors/settings",
    },
    {
      name: "Rating",
      value: statsData.rating ? statsData.rating.toString() : "N/A",
      icon: Star,
      sub: "Average",
      subPositive: true,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      route: "/doctors/reviews",
    },
    {
      name: "Experience",
      value: statsData.experience,
      icon: Award,
      sub: "Total",
      subPositive: false,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
      route: "/doctors/profile",
    },
  ];

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("confirm") || s.includes("active")) return "bg-emerald-100 text-emerald-700";
    if (s.includes("pending")) return "bg-amber-100 text-amber-700";
    if (s.includes("urgent") || s.includes("emergency")) return "bg-red-100 text-red-700";
    if (s.includes("complete")) return "bg-slate-100 text-slate-600";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="space-y-6">

      {/* Page Title — matches screenshot exactly */}
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Doctor Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Welcome back, Dr. {doctorName}!{" "}
          <span className="text-blue-500 font-medium">Here&apos;s your medical practice overview.</span>
        </p>
      </div>

      {/* Stats Grid — 4 top + 2 bottom (matches screenshot) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.slice(0, 4).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="border border-slate-200 bg-white shadow-none hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium leading-none">{stat.name}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2 tracking-tight leading-none">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor" />
                      </svg>
                      <span className="text-xs text-slate-400 font-medium">{stat.sub}</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Second row — Rating + Experience */}
      <div className="grid grid-cols-2 gap-4">
        {stats.slice(4, 6).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="border border-slate-200 bg-white shadow-none hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium leading-none">{stat.name}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2 tracking-tight leading-none">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor" />
                      </svg>
                      <span className="text-xs text-slate-400 font-medium">{stat.sub}</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom row: Today's Appointments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Today's Appointments */}
        <Card className="lg:col-span-2 border border-slate-200 bg-white shadow-none">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-slate-500" />
              Today&apos;s Appointments
            </CardTitle>
            <CardDescription className="text-xs text-blue-500 font-medium mt-0.5">
              Your scheduled appointments for today
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-10 px-6">
                <p className="text-sm text-slate-400 font-medium">No appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todaysAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{appointment.time}</p>
                        <p className="text-xs text-slate-500 font-medium">{appointment.patient}</p>
                        <p className="text-xs text-slate-400">{appointment.type}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-slate-200 bg-white shadow-none">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Plus className="w-4 h-4 text-slate-500" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 font-medium mt-0.5">
              Common medical tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Schedule", icon: Calendar, bg: "bg-blue-50", color: "text-blue-500", route: "/doctors/appointments" },
                { label: "Prescribe", icon: FileText, bg: "bg-green-50", color: "text-green-500", route: "/doctors/prescriptions" },
                { label: "Patients", icon: Users, bg: "bg-violet-50", color: "text-violet-500", route: "/doctors/patients" },
                { label: "Emergency", icon: AlertCircle, bg: "bg-orange-50", color: "text-orange-500", route: "/doctors/emergency" },
                { label: "Consult", icon: MessageSquare, bg: "bg-teal-50", color: "text-teal-500", route: "/doctors/consultation" },
                { label: "Profile", icon: Stethoscope, bg: "bg-indigo-50", color: "text-indigo-500", route: "/doctors/settings" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.route)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default DoctorsDashboard;
