"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  selectAppointments,
  selectApptLoading,
  selectApptError,
  selectApptStats,
  fetchAppointmentStats,
  exportAppointments,
  Appointment,
} from "@/lib/redux/features/appointmentSlice";

const AppointmentsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appointments = useSelector(selectAppointments);
  const error = useSelector(selectApptError);
  const isLoading = useSelector(selectApptLoading);
  const apptStats = useSelector(selectApptStats);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchAppointmentStats());
  }, [dispatch]);

  const filteredAppointments = appointments
    .filter((appointment) => {
      const matchesSearch =
        appointment.patientName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.patientEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.patientPhone.includes(searchTerm) ||
        appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;
      const matchesType =
        typeFilter === "all" || appointment.type === typeFilter;
      const matchesDate =
        dateFilter === "all" || appointment.date === dateFilter;
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    })
    .sort((a, b) => {
      let aValue: string | number | Date = a[sortBy as keyof typeof a] as
        | string
        | number;
      let bValue: string | number | Date = b[sortBy as keyof typeof b] as
        | string
        | number;

      if (sortBy === "date") {
        aValue = new Date(a.date + " " + a.time).getTime();
        bValue = new Date(b.date + " " + b.time).getTime();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "default";
      case "follow-up":
        return "secondary";
      case "emergency":
        return "destructive";
      case "checkup":
        return "outline";
      default:
        return "outline";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "refunded":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      await dispatch(deleteAppointment(appointmentId));
    }
  };

  const getFormData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    return Object.fromEntries(formData.entries());
  };

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    date: "",
    time: "",
    duration: "30",
    type: "consultation",
    fee: "",
    location: "Online",
    reason: "",
    notes: "",
  });

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.patientEmail ||
      !formData.date ||
      !formData.time ||
      !formData.fee ||
      !formData.reason
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      patientPhone: formData.patientPhone,
      appointmentDate: formData.date,
      appointmentTime: formData.time,
      duration: Number(formData.duration) || 30,
      type: formData.type || "consultation",
      reason: formData.reason,
      notes: formData.notes || "",
      fee: Number(formData.fee) || 0,
      status: "pending",
      paymentStatus: "pending",
      location: formData.location || "Online",
    };

    const success = await dispatch(createAppointment(payload));
    if (success) {
      // Reset form
      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        date: "",
        time: "",
        duration: "30",
        type: "consultation",
        fee: "",
        location: "Online",
        reason: "",
        notes: "",
      });
      setIsAddModalOpen(false);
      // Refresh appointments list and stats
      setTimeout(() => {
        dispatch(fetchAppointments());
        dispatch(fetchAppointmentStats());
      }, 500);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedAppointment) return;
    const data = getFormData(e);
    const payload = {
      ...data,
      duration: Number(data.duration),
      fee: Number(data.fee),
    };

    const success = await dispatch(
      updateAppointment(selectedAppointment.id, payload),
    );
    if (success) setIsEditModalOpen(false);
  };

  const handleExportAppointments = async () => {
    setIsExporting(true);
    try {
      const filters = {
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm }),
      };

      const blob = await exportAppointments(filters);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `appointments-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter((appointment) => appointment.date === date);
  };

  const todaysAppointments = getAppointmentsForDate(selectedDate);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">
              Manage your patient appointments and schedule
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportAppointments}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? "Exporting..." : "Export"}
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Schedule Appointment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Appointments
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {apptStats?.totalAppointments ?? appointments.length}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    All time
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Today&apos;s Appointments
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {apptStats?.todaysAppointments ?? todaysAppointments.length}
                  </p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {apptStats?.confirmedToday ?? 0} confirmed
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">
                    {apptStats?.pendingAppointments ??
                      appointments.filter((a) => a.status === "pending").length}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Action required
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹
                    {(
                      apptStats?.totalRevenue ??
                      appointments
                        .filter((a) => a.paymentStatus === "paid")
                        .reduce((sum, a) => sum + a.fee, 0)
                    ).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-600 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {apptStats?.totalCompleted ?? 0} completed
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date & Time</SelectItem>
                    <SelectItem value="patientName">Patient Name</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>

                <div className="flex border border-input rounded-lg overflow-hidden">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("table")}
                        className="rounded-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>List view</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className="rounded-none"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Grid view</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="text-red-500">⚠️</div>
                <div>
                  <p className="font-semibold text-red-800">
                    Error Loading Appointments
                  </p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                <Button
                  onClick={() => dispatch(fetchAppointments())}
                  variant="outline"
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No appointments scheduled
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule your first appointment to get started
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "table" && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={appointment.patientAvatar} />
                                <AvatarFallback>
                                  {appointment.patientName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {appointment.patientName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.patientPhone}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">
                                {new Date(
                                  appointment.date,
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.time} ({appointment.duration}m)
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getTypeColor(appointment.type) as any}
                            >
                              {appointment.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                getStatusColor(appointment.status) as any
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{appointment.fee}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditAppointment(appointment)
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteAppointment(appointment.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {paginatedAppointments.map((appointment: Appointment) => (
                  <Card key={appointment.id} className="flex flex-col h-full">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appointment.patientAvatar} />
                          <AvatarFallback>
                            {appointment.patientName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold">
                            {appointment.patientName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.patientEmail}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-col items-end">
                          <Badge
                            variant={getStatusColor(appointment.status) as any}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />{" "}
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />{" "}
                          {appointment.time} ({appointment.duration}m)
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />{" "}
                          {appointment.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Stethoscope className="w-4 h-4 text-muted-foreground" />{" "}
                          {appointment.reason}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredAppointments.length)}{" "}
              of {filteredAppointments.length} appointments
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new appointment with patient details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input
                    name="patientName"
                    placeholder="Enter patient name"
                    value={formData.patientName}
                    onChange={(e) =>
                      handleFormChange("patientName", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Patient Email</Label>
                  <Input
                    name="patientEmail"
                    type="email"
                    placeholder="Enter email"
                    value={formData.patientEmail}
                    onChange={(e) =>
                      handleFormChange("patientEmail", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Patient Phone</Label>
                  <Input
                    name="patientPhone"
                    placeholder="Enter phone"
                    value={formData.patientPhone}
                    onChange={(e) =>
                      handleFormChange("patientPhone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleFormChange("time", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) =>
                      handleFormChange("duration", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleFormChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="checkup">Checkup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fee</Label>
                  <Input
                    name="fee"
                    type="number"
                    placeholder="0.00"
                    value={formData.fee}
                    onChange={(e) => handleFormChange("fee", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    name="location"
                    placeholder="Clinic/Hospital location"
                    value={formData.location}
                    onChange={(e) =>
                      handleFormChange("location", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Reason</Label>
                  <Input
                    name="reason"
                    placeholder="Main reason for visit"
                    value={formData.reason}
                    onChange={(e) => handleFormChange("reason", e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    name="notes"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    "Schedule Appointment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <form onSubmit={handleUpdateSubmit}>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          name="date"
                          type="date"
                          defaultValue={selectedAppointment.date}
                        />
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input
                          name="time"
                          type="time"
                          defaultValue={selectedAppointment.time}
                        />
                      </div>
                      <div>
                        <Label>Fee</Label>
                        <Input
                          name="fee"
                          type="number"
                          defaultValue={selectedAppointment.fee}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          name="status"
                          defaultValue={selectedAppointment.status}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label>Reason</Label>
                        <Input
                          name="reason"
                          defaultValue={selectedAppointment.reason}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="notes" className="space-y-4 py-4">
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        name="notes"
                        defaultValue={selectedAppointment.notes}
                        rows={5}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AppointmentsPage;
