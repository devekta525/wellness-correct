"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Video,
  MessageSquare,
  Plus,
  XCircle,
  Eye,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  imageUrl?: string;
}

interface Appointment {
  _id: string;
  doctor: Doctor;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: string;
  location?: string;
  notes?: string;
  duration: number;
  fee: number;
  reason?: string;
}

const AppointmentsTab = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingAppointment, setViewingAppointment] =
    useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken") || localStorage.getItem("authToken")
          : null;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/appointments/my-appointments`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        },
      );
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800";
      case "completed":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800";
      case "rescheduled":
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "in-person":
        return <MapPin className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setViewingAppointment(appointment);
    setShowViewDialog(true);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    // Placeholder for cancel logic
    console.log("Cancel appointment", appointmentId);
  };

  const AppointmentSkeleton = () => (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-5 w-3/4 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="mt-6 flex gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            <Calendar className="h-7 w-7 text-indigo-500" />
            My Appointments
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
            Manage your medical consultations comfortably. View upcoming sessions, review past ones, and stay on top of your health journey.
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full sm:w-auto mt-4 sm:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 px-6 py-5 sm:py-6 text-sm font-bold transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Book New Consultation
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/30 dark:bg-red-900/10 shadow-sm">
          <p className="flex items-center justify-center gap-2 font-semibold text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-5 w-5" /> {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <AppointmentSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-800/80"
            >
              {/* Card Header Gradient Strip */}
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="flex h-full flex-col p-6 sm:p-7">
                {/* Doctor Info Section */}
                <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="relative">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-md ring-4 ring-white dark:ring-slate-800">
                        {appointment.doctor?.firstName?.[0] || 'D'}
                        {appointment.doctor?.lastName?.[0] || 'R'}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 ${appointment.status.toLowerCase() === 'confirmed' || appointment.status.toLowerCase() === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
                        Dr. {appointment.doctor?.firstName || 'Unknown'} {appointment.doctor?.lastName || 'Doctor'}
                      </h3>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Stethoscope className="h-4 w-4 text-indigo-400" />
                        {appointment.doctor?.specialization || "General Physician"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge Positioned absolutely on mobile, or inline on desktop */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm capitalize tracking-wide ${getStatusClasses(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                {/* Appointment Details Grid */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5 dark:bg-slate-900/50 dark:border-slate-800/50 mb-6">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Date
                    </span>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" /> Time
                    </span>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {appointment.appointmentTime}
                    </p>
                  </div>

                  {/* Consultation Type */}
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {getTypeIcon(appointment.type)} Mode
                    </span>
                    <p className="font-semibold text-sm capitalize text-slate-900 dark:text-white truncate">
                      {appointment.type.replace("-", " ")}
                    </p>
                  </div>

                  {/* Fee */}
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Fee
                    </span>
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 truncate">
                      ₹{appointment.fee}
                    </p>
                  </div>

                  {/* Location - Full width if exists */}
                  {appointment.location && (
                    <div className="col-span-2 mt-1 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Location
                      </span>
                      <p className="font-medium text-sm text-slate-800 dark:text-slate-200 leading-snug">
                        {appointment.location}
                      </p>
                    </div>
                  )}

                  {/* Notes - Full width if exists */}
                  {appointment.notes && !appointment.location && (
                    <div className="col-span-2 mt-1 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 space-y-1.5 flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                      <p className="text-sm font-medium italic text-slate-600 dark:text-slate-400 line-clamp-2">
                        "{appointment.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    onClick={() => handleViewAppointment(appointment)}
                    className="w-full h-12 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all duration-300"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {appointment.status.toLowerCase() === "scheduled" && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="w-full sm:w-auto h-12 rounded-xl border-2 border-red-100 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 dark:border-red-900/30 dark:bg-slate-800 dark:hover:bg-red-900/20 dark:text-red-400 transition-colors font-bold px-6"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 py-24 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 shadow-inner dark:bg-indigo-900/20">
                <Calendar className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="mb-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                No Appointments Yet
              </h3>
              <p className="mb-8 max-w-sm text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                You haven't booked any medical consultations. Take the first step towards better health today.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-8 py-6 font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Book Consultation
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-6 py-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Plus className="h-6 w-6" />
                </div>
                Book New Appointment
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                Schedule a new medical consultation.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-12 text-center bg-white dark:bg-slate-900">
            <Calendar className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Booking System Coming Soon</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Please contact support or call our clinic directly to book a new appointment at this time.
            </p>
          </div>

          <DialogFooter className="bg-slate-50 px-6 py-5 border-t border-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="w-full sm:w-auto rounded-xl py-6 px-10 font-bold border-2 border-slate-200 dark:border-slate-700"
            >
              Close Window
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Appointment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 sm:rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-6 py-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Eye className="h-6 w-6 text-indigo-600" />
                </div>
                Appointment Details
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                View complete consultation information.
              </DialogDescription>
            </div>
          </DialogHeader>

          {viewingAppointment && (
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 space-y-8">
              {/* Top Banner section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row w-full sm:w-auto">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-md mx-auto sm:mx-0">
                    {viewingAppointment.doctor?.firstName?.[0]}
                    {viewingAppointment.doctor?.lastName?.[0]}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Physician</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      Dr. {viewingAppointment.doctor?.firstName}{" "}
                      {viewingAppointment.doctor?.lastName}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                      <Stethoscope className="w-4 h-4 text-indigo-400" /> {viewingAppointment.doctor?.specialization}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border shadow-sm capitalize tracking-wide ${getStatusClasses(
                    viewingAppointment.status,
                  )}`}>
                    {viewingAppointment.status}
                  </span>
                </div>
              </div>

              {/* Grid Data */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white dark:bg-slate-900">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-[15px]">
                    {new Date(
                      viewingAppointment.appointmentDate,
                    ).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-[15px]">
                    {viewingAppointment.appointmentTime} <span className="text-slate-400 font-medium text-xs">({viewingAppointment.duration} min)</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    Mode
                  </span>
                  <p className="flex items-center gap-2 font-semibold capitalize text-slate-900 dark:text-slate-100 text-[15px]">
                    {getTypeIcon(viewingAppointment.type)}
                    {viewingAppointment.type.replace("-", " ")}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    Consultation Fee
                  </span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-[15px]">
                    ₹{viewingAppointment.fee}
                  </p>
                </div>

                {viewingAppointment.location && (
                  <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Location View
                    </span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingAppointment.location}
                    </p>
                  </div>
                )}
              </div>

              {viewingAppointment.notes && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-indigo-900 dark:text-indigo-300">
                    <MessageSquare className="h-4 w-4" />
                    Additional Notes From Doctor
                  </h4>
                  <p className="text-sm font-medium italic text-indigo-700 dark:text-indigo-400/80 leading-relaxed">
                    "{viewingAppointment.notes}"
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50 gap-3 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowViewDialog(false)}
              className="w-full sm:w-auto h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold px-8 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close Window
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsTab;
