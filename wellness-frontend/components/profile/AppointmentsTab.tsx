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
          ? localStorage.getItem("authToken") || localStorage.getItem("token")
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
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Appointments</h2>
          <p className="text-muted-foreground">
            Manage your medical appointments
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading appointments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((appointment) => (
            <Card
              key={appointment._id}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {appointment.doctor?.firstName?.[0]}
                      {appointment.doctor?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">
                        Dr. {appointment.doctor?.firstName}{" "}
                        {appointment.doctor?.lastName}
                      </h3>
                      <p className="text-muted-foreground">
                        {appointment.doctor?.specialization}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {getTypeIcon(appointment.type)}
                          <span className="text-sm capitalize">
                            {appointment.type.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Date:</span>
                        <span>
                          {new Date(
                            appointment.appointmentDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Time:</span>
                        <span>{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Duration:</span>
                        <span>{appointment.duration} minutes</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {appointment.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Location:</span>
                          <span className="truncate">
                            {appointment.location}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Price:</span>
                        <span className="font-semibold text-green-600">
                          ₹{appointment.fee}
                        </span>
                      </div>
                      {appointment.notes && (
                        <div className="flex items-start gap-2 text-sm">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span className="font-medium">Notes:</span>
                          <span className="text-muted-foreground">
                            {appointment.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAppointment(appointment)}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>

                    {appointment.status === "scheduled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {appointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No appointments scheduled
              </h3>
              <p className="text-muted-foreground mb-4">
                Book your first appointment to get started
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Book Appointment
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new medical appointment
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 text-center text-muted-foreground">
            Booking functionality coming soon. Please contact support to book an
            appointment.
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Appointment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View complete appointment information
            </DialogDescription>
          </DialogHeader>

          {viewingAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Dr. {viewingAppointment.doctor?.firstName}{" "}
                    {viewingAppointment.doctor?.lastName}
                  </h3>
                  <p className="text-muted-foreground">
                    {viewingAppointment.doctor?.specialization}
                  </p>
                </div>
                <Badge className={getStatusColor(viewingAppointment.status)}>
                  {viewingAppointment.status.charAt(0).toUpperCase() +
                    viewingAppointment.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">
                    {new Date(
                      viewingAppointment.appointmentDate,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Time:</span>
                  <span className="ml-2">
                    {viewingAppointment.appointmentTime}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <span className="ml-2">
                    {viewingAppointment.duration} minutes
                  </span>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <span className="ml-2 capitalize">
                    {viewingAppointment.type.replace("-", " ")}
                  </span>
                </div>
                {viewingAppointment.location && (
                  <div className="col-span-2">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{viewingAppointment.location}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Fee:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    ₹{viewingAppointment.fee}
                  </span>
                </div>
              </div>

              {viewingAppointment.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes:</h4>
                  <p className="text-sm text-muted-foreground">
                    {viewingAppointment.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsTab;
