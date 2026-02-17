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
  Activity,
  TrendingUp,
  Plus,
  DollarSign,
  Star,
  Loader2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchDoctorDashboard,
  selectDashboardData,
  selectDashboardLoading,
} from "@/lib/redux/features/dashboardSlice";

import {
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

  // Get Data from Redux
  const dashboardData = useSelector(selectDashboardData);
  const isLoading = useSelector(selectDashboardLoading);
  const todaysAppointmentCountFromAPI = useSelector(
    selectTodaysAppointmentCount,
  );
  const patientStats = useSelector(selectPatientStats);

  // Fetch Data on Mount
  useEffect(() => {
    dispatch(fetchDoctorDashboard());
    dispatch(fetchTodaysAppointmentCount());
    dispatch(fetchPatientStats());
  }, [dispatch]);

  // Show Loader while fetching
  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  type DashboardStats = NonNullable<
    ReturnType<typeof selectDashboardData>
  >["stats"];

  const defaultStats: DashboardStats = {
    todayAppointments: 0,
    totalPatients: 0,
    prescriptionsCount: 0,
    consultationFee: 0,
    rating: 0,
    experience: "0 Years",
  };

  // Handle Default/Empty Data to prevent crashes
  const statsData: DashboardStats = {
    ...defaultStats,
    ...(dashboardData?.stats ?? {}),
  };

  // Use API data for todayAppointments if available
  if (todaysAppointmentCountFromAPI !== null) {
    statsData.todayAppointments = todaysAppointmentCountFromAPI;
  }

  const totalPatientsFromAPI = patientStats?.totalPatients ?? null;
  if (totalPatientsFromAPI !== null) {
    statsData.totalPatients = totalPatientsFromAPI;
  }

  const todaysAppointments = dashboardData?.todaysAppointments || [];
  const recentPrescriptions = dashboardData?.recentPrescriptions || [];
  const doctorName = dashboardData?.doctorName || "Doctor";

  // Dynamic Stats Array based on Backend Data
  const stats = [
    {
      name: "Today's Appointments",
      value: statsData.todayAppointments.toString(),
      icon: Calendar,
      change: "Today",
      changeType: "neutral",
      color: "blue",
      route: "/doctors/appointments",
    },
    {
      name: "Total Patients",
      value: statsData.totalPatients.toLocaleString(),
      icon: Users,
      change: "Active",
      changeType: "positive",
      color: "emerald",
      route: "/doctors/patients",
    },
    {
      name: "Prescriptions Written",
      value: statsData.prescriptionsCount.toString(),
      icon: FileText,
      change: "Total",
      changeType: "neutral",
      color: "purple",
      route: "/doctors/prescriptions",
    },
    {
      name: "Consultation Fee",
      value: `₹${statsData.consultationFee}`,
      icon: DollarSign,
      change: "Standard",
      changeType: "positive",
      color: "green",
      route: "/doctors/settings",
    },
    {
      name: "Rating",
      value: statsData.rating.toString(),
      icon: Star,
      change: "Average",
      changeType: "positive",
      color: "yellow",
      route: "/doctors/reviews",
    },
    {
      name: "Experience",
      value: statsData.experience,
      icon: Award,
      change: "Total",
      changeType: "neutral",
      color: "indigo",
      route: "/doctors/profile",
    },
  ];

  // Helper for Icon Colors
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      emerald:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400",
      purple:
        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
      green:
        "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      indigo:
        "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400",
      yellow:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
      red: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    };
    return colors[color] || colors.blue;
  };

  // Helper for Status Badge Colors
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("confirm") || s.includes("active"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (s.includes("pending"))
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (s.includes("urgent") || s.includes("emergency"))
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (s.includes("complete"))
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Doctor Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, Dr. {doctorName}! Here&apos;s your medical practice
            overview.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-gray-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today&apos;s Appointments
            </CardTitle>
            <CardDescription>
              Your scheduled appointments for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No appointments scheduled for today.
                </div>
              ) : (
                todaysAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {appointment.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.patient}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.type} • {appointment.specialization}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common medical tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={() => router.push("/doctors/appointments")}
              >
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Schedule</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => router.push("/doctors/prescriptions")}
              >
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Prescribe</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                onClick={() => router.push("/doctors/patients")}
              >
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Patients</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950"
                onClick={() => router.push("/doctors/emergency")}
              >
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Emergency</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={() => router.push("/doctors/consultation")}
              >
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">Consult</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                onClick={() => router.push("/doctors/settings")}
              >
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium">Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Prescriptions
            </CardTitle>
            <CardDescription>Latest medications prescribed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrescriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No recent prescriptions.
                </p>
              ) : (
                recentPrescriptions.map((prescription, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {prescription.patient}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prescription.medication}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prescription.dosage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(prescription.date).toLocaleDateString()}
                      </p>
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medical Practice Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Practice Status
            </CardTitle>
            <CardDescription>Your medical practice overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Practice Active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      All systems operational
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Patient Records
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {statsData.totalPatients} active patients
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  Updated
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Pending Appointments
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {
                        todaysAppointments.filter((a) => a.status === "Pending")
                          .length
                      }{" "}
                      appointments today
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                >
                  Scheduled
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Medical License
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Valid until Dec 2025
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                >
                  Valid
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorsDashboard;
