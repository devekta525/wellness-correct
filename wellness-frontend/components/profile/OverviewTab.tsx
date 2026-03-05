"use client";

import React, { useEffect, useState } from "react";
import { User, Activity, Calendar, Clock, Package, Loader2, Info, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User as UserType } from "@/lib/redux/features/authSlice";
import axios from "axios";
import { motion } from "framer-motion";

interface Notification {
  title: string;
  message: string;
  date: string;
  time: string;
  type: string;
  icon: string;
}

interface OverviewTabProps {
  profile: UserType;
  isEditing: boolean;
  onProfileChange: (profile: UserType) => void;
  currentUser?: UserType;
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

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const ordersUrl = `${apiUrl}/v1/orders/user/notifications`;
        const appointmentsUrl = `${apiUrl}/v1/appointments/my-notifications`;
        const headers = { Authorization: `Bearer ${token}` };

        const [ordersResponse, appointmentsResponse] = await Promise.allSettled([
          axios.get(ordersUrl, { headers }),
          axios.get(appointmentsUrl, { headers })
        ]);

        let allNotifications: any[] = [];

        if (ordersResponse.status === 'fulfilled' && ordersResponse.value.data.success) {
          allNotifications.push(...ordersResponse.value.data.notifications.map((n: any) => ({ ...n, type: 'order', icon: 'Package' })));
        }

        if (appointmentsResponse.status === 'fulfilled' && appointmentsResponse.value.data.success) {
          allNotifications.push(...appointmentsResponse.value.data.data.map((n: any) => {
            const [date, time] = n.dateTime.split(' at ');
            return { title: n.title, message: n.message, date, time, type: 'appointment', icon: 'Calendar' };
          }));
        }

        allNotifications.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
        setNotifications(allNotifications.slice(0, 5));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const handleFieldChange = (field: string, value: string) => {
    onProfileChange({ ...profile, [field]: value } as UserType);
  };

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "Package": return <Package className="w-5 h-5" />;
      case "Calendar": return <Calendar className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Personal Info Card */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="rounded-2xl border border-blue-100 shadow-lg bg-white overflow-hidden">
            <CardHeader className="p-6 border-b border-blue-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { id: "firstName", label: "First Name", value: profile?.firstName },
                  { id: "lastName", label: "Last Name", value: profile?.lastName },
                  { id: "email", label: "Email Address", value: profile?.email, spans: true, readOnly: true },
                  { id: "phone", label: "Phone Number", value: profile?.phone },
                  { id: "dateOfBirth", label: "Birthday", value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : null, type: "date" },
                  { id: "bio", label: "Profile Bio", value: profile?.bio, spans: true, placeholder: "Add a bio..." },
                ].map((field) => (
                  <div key={field.id} className={`${field.spans ? 'sm:col-span-2' : ''} space-y-2`}>
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{field.label}</Label>
                    {isEditing && !field.readOnly ? (
                      <Input
                        type={field.type || "text"}
                        value={field.value || ""}
                        placeholder={field.placeholder}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-medium px-4 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    ) : (
                      <div className="h-11 flex items-center px-4 rounded-xl bg-slate-50/30 border border-slate-100">
                        <span className="text-sm font-bold text-slate-700 truncate">{field.value || "Not specified"}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity Card */}
      <div className="lg:col-span-1">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="rounded-2xl border border-blue-100 shadow-lg bg-white p-6 h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-bold">Recent Activity</h3>

            <div className="space-y-6">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-blue-50">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-2 shrink-0">
                        {getActivityIcon(notif.icon)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold text-slate-900 leading-tight">{notif.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                          {notif.date} · {notif.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Clock className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent alerts</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewTab;
