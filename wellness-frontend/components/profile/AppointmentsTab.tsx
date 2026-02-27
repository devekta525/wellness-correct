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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "completed":
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "rescheduled":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
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
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
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
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            <Calendar className="h-6 w-6 text-primary" />
            My Appointments
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your upcoming and past medical consultations.
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30"
        >
          <Plus className="w-4 h-4" />
          Book New
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/10">
          <p className="flex items-center justify-center gap-2 font-medium text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <AppointmentSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {appointments.map((appointment) => (
            <Card
              key={appointment._id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex flex-col gap-6">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-md dark:border-slate-800">
                      {appointment.doctor?.firstName?.[0]}
                      {appointment.doctor?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Dr. {appointment.doctor?.firstName}{" "}
                        {appointment.doctor?.lastName}
                      </h3>
                      <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {appointment.doctor?.specialization ||
                          "General Physician"}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge
                          variant="outline"
                          className={`border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusColor(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/50">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {new Date(
                            appointment.appointmentDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {appointment.appointmentTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        {getTypeIcon(appointment.type)}
                        <span className="font-medium capitalize text-slate-900 dark:text-slate-100">
                          {appointment.type.replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {appointment.location && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                            {appointment.location}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="text-xs uppercase tracking-wider">
                          Fee:
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ₹{appointment.fee}
                        </span>
                      </div>
                      {appointment.notes && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="truncate text-xs italic">
                            "{appointment.notes}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAppointment(appointment)}
                      className="h-10 flex-1 gap-1.5 rounded-xl border-slate-200 text-slate-600 hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-slate-800 dark:text-slate-300"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>

                    {appointment.status === "scheduled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="h-10 flex-1 gap-1.5 rounded-xl border-slate-200 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {appointments.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-20 text-center dark:border-slate-700 dark:bg-slate-900/20">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <Calendar className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                No appointments scheduled
              </h3>
              <p className="mb-8 max-w-sm text-slate-500 dark:text-slate-400">
                You haven't booked any appointments yet. Schedule a consultation with a doctor today.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="gap-2 rounded-full px-8 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Book First Appointment
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
          <DialogHeader>
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Plus className="h-5 w-5 text-primary" />
                Book New Appointment
              </DialogTitle>
              <DialogDescription className="mt-1.5">
              Schedule a new medical appointment
            </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Booking functionality coming soon. Please contact support to book an
            appointment.
          </div>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="h-11 rounded-xl px-8"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Appointment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
          <DialogHeader>
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Eye className="h-5 w-5 text-primary" />
                Appointment Details
              </DialogTitle>
              <DialogDescription className="mt-1.5">
              View complete appointment information
            </DialogDescription>
            </div>
          </DialogHeader>

          {viewingAppointment && (
            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-md">
                    {viewingAppointment.doctor?.firstName?.[0]}
                    {viewingAppointment.doctor?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Dr. {viewingAppointment.doctor?.firstName}{" "}
                    {viewingAppointment.doctor?.lastName}
                  </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                    {viewingAppointment.doctor?.specialization}
                  </p>
                </div>
                </div>
                <Badge
                  variant="outline"
                  className={`border px-3 py-1 text-sm font-semibold capitalize ${getStatusColor(
                    viewingAppointment.status,
                  )}`}
                >
                  {viewingAppointment.status.charAt(0).toUpperCase() +
                    viewingAppointment.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-5 text-sm dark:bg-slate-900/50">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(
                      viewingAppointment.appointmentDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Time
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {viewingAppointment.appointmentTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Duration
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {viewingAppointment.duration} minutes
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </span>
                  <p className="flex items-center gap-2 font-medium capitalize text-slate-900 dark:text-slate-100">
                    {getTypeIcon(viewingAppointment.type)}
                    {viewingAppointment.type.replace("-", " ")}
                  </p>
                </div>
                {viewingAppointment.location && (
                  <div className="col-span-2 space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Location
                    </span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {viewingAppointment.location}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Consultation Fee
                  </span>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    ₹{viewingAppointment.fee}
                  </p>
                </div>
              </div>

              {viewingAppointment.notes && (
                <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Notes
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {viewingAppointment.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
            <Button
              variant="outline"
              onClick={() => setShowViewDialog(false)}
              className="h-11 rounded-xl px-8"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsTab;
