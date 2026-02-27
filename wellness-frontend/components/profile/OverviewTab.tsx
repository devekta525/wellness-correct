"use client";

import React, { useEffect, useState } from "react";
import { User, Activity, Calendar, Clock, Package, Heart, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserType } from "@/lib/redux/features/authSlice";
import axios from "axios";

interface Notification {
  title: string;
  message: string;
  date: string;
  time: string;
}

interface OverviewTabProps {
  profile: UserType;
  isEditing: boolean;
  onProfileChange: (profile: UserType) => void;
  currentUser?: UserType; // Use UserType instead of any
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  isEditing,
  onProfileChange,
  currentUser,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = (currentUser as any)?.token || localStorage.getItem("authToken");
        
        if (!token) {
          setLoading(false);
          return;
        }

        const ordersUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/orders/user/notifications`;
        const appointmentsUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/appointments/my-notifications`;
        
        const headers = { Authorization: `Bearer ${token}` };

        const [ordersResponse, appointmentsResponse] = await Promise.allSettled([
          axios.get(ordersUrl, { headers }),
          axios.get(appointmentsUrl, { headers })
        ]);

        let allNotifications: any[] = [];

        // Process order notifications
        if (ordersResponse.status === 'fulfilled' && ordersResponse.value.data.success) {
          const orderNotifications = ordersResponse.value.data.notifications.map((notif: any) => {
            const parsedDate = new Date(`${notif.date} ${notif.time}`);
            return {
              ...notif,
              type: 'order',
              icon: 'Package',
              dateTimeObject: !isNaN(parsedDate.getTime()) ? parsedDate : new Date(0)
            };
          });
          allNotifications.push(...orderNotifications);
        } else if (ordersResponse.status === 'rejected') {
            console.error("Error fetching order notifications:", ordersResponse.reason);
        }

        // Process appointment notifications
        if (appointmentsResponse.status === 'fulfilled' && appointmentsResponse.value.data.success) {
          const appointmentNotifications = appointmentsResponse.value.data.data.map((notif: any) => {
            const [date, time] = notif.dateTime.split(' at ');
            return {
              title: notif.title,
              message: notif.message,
              date: date,
              time: time,
              type: 'appointment',
              icon: 'Calendar',
              dateTimeObject: new Date(notif.dateTime.replace(' at ', ' '))
            };
          });
          allNotifications.push(...appointmentNotifications);
        } else if (appointmentsResponse.status === 'rejected') {
            console.error("Error fetching appointment notifications:", appointmentsResponse.reason);
        }

        allNotifications.sort((a, b) => b.dateTimeObject.getTime() - a.dateTimeObject.getTime());
        setNotifications(allNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const handleFieldChange = (field: string, value: string) => {
    // Update the profile with the new value
    const updatedProfile = {
      ...profile,
      [field]: value,
    };
    onProfileChange(updatedProfile as UserType);
  };

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "Package":
        return <Package className="w-5 h-5" />;
      case "Calendar":
        return <Calendar className="w-5 h-5" />;
      case "Heart":
        return <Heart className="w-5 h-5" />;
      case "User":
        return <User className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
      case "appointment":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300";
      case "prescription":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300";
      case "profile_update":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-8">
      {/* Gradient Header Section */}
      <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-indigo-900/30 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Profile Overview
          </h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400 max-w-2xl">
            Manage your personal information and view a summary of your recent
            activity across the platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card className="rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-800/70 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
              <User className="w-5 h-5 text-blue-500" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-muted-foreground"
                >
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={profile?.firstName || ""}
                    onChange={(e) =>
                      handleFieldChange("firstName", e.target.value)
                    }
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">
                    {profile?.firstName || "Not set"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={profile?.lastName || ""}
                    onChange={(e) =>
                      handleFieldChange("lastName", e.target.value)
                    }
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">
                    {profile?.lastName || "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">
                    {profile?.email || "Not set"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profile?.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">
                    {profile?.phone || "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Role
                </Label>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2 capitalize">
                  {profile?.role || "Not set"}
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Status
                </Label>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2 capitalize">
                  {profile?.status || "Not set"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="bio"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Bio
                </Label>
                {isEditing ? (
                  <Input
                    id="bio"
                    value={profile?.bio || ""}
                    onChange={(e) => handleFieldChange("bio", e.target.value)}
                    placeholder="Enter your bio"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">
                    {profile?.bio || "Not specified"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Address
                </Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={profile?.address || ""}
                    onChange={(e) =>
                      handleFieldChange("address", e.target.value)
                    }
                    placeholder="Enter your address"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">
                    {profile?.address || "Not specified"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="dateOfBirth"
                className="text-sm font-medium text-muted-foreground"
              >
                Date of Birth
              </Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={
                    profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleFieldChange("dateOfBirth", e.target.value)
                  }
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-base"
                />
              ) : (
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">
                  {profile?.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString("en-GB")
                    : "Not specified"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-800/70 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">Loading activity...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification: any, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  >
                    <div
                      className={`p-3 rounded-xl ${getActivityColor(
                        notification.type,
                      )}`}
                    >
                      {getActivityIcon(notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {notification.date} at {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/30 rounded-2xl">
                  <div className="w-16 h-16 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-full mb-4">
                    <Activity className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                    No Recent Activity
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your recent actions will appear here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
