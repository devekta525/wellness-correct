"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  Heart,
  Star,
  UserPlus,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  TrendingUp,
  CheckCircle,
  Grid3X3,
  List,
  AlertCircle,
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
import { Card, CardContent } from "@/components/ui/card";
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

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchPatients,
  fetchPatientStats,
  selectPatientsData,
  selectPatientsLoading,
  selectPatientsError,
  selectPatientStats,
  createPatient,
  updatePatientRecord,
  deletePatientRecord,
  exportPatientsList,
} from "@/lib/redux/features/patientSlice";

// Patient UI interface
interface PatientUI {
  id: string;
  patientId?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  totalVisits: number;
  totalFees: number;
  lastVisit: string;
  joinDate: string;
  location: string;
  patientType: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  emergencyContact: string | { name: string; phone: string };
  insuranceProvider: string;
  tags: string[];
  notes: string;
}

const PatientsPage = () => {
  const dispatch = useAppDispatch();
  const rawPatients = useAppSelector(selectPatientsData);
  const isLoading = useAppSelector(selectPatientsLoading);
  const error = useAppSelector(selectPatientsError);
  const patientStats = useAppSelector(selectPatientStats);

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [patientTypeFilter, setPatientTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<PatientUI | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTab, setEditTab] = useState<"details" | "medical" | "visits">(
    "details",
  );
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch patients on mount
  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchPatientStats());
  }, [dispatch]);

  // Map Redux users to PatientUI
  const patients: PatientUI[] = rawPatients.map((patient) => {
    return {
      id: patient._id,
      patientId: patient.patientId,
      name: `${patient.firstName}${patient.lastName ? " " + patient.lastName : ""}`.trim(),
      email: patient.email,
      phone: patient.phone,
      avatar: patient.avatar || "",
      status: patient.status || "active",
      totalVisits: patient.totalVisits || 0,
      totalFees: patient.totalFees || 0,
      lastVisit: patient.lastVisit || patient.updatedAt,
      joinDate: patient.createdAt,
      location: patient.location || "Not specified",
      patientType: patient.patientType || "new",
      age: patient.age || 0,
      dateOfBirth: patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "Unknown",
      medicalHistory: patient.medicalHistory || [],
      currentMedications: patient.currentMedications || [],
      allergies: patient.allergies || [],
      emergencyContact: patient.emergencyContact || { name: "", phone: "" },
      insuranceProvider: patient.insuranceProvider || "None",
      tags: patient.tags || [],
      notes: patient.note || "",
    };
  });

  // Filter and sort patients
  const filteredPatients = patients
    .filter((patient) => {
      const normalizedStatus = (patient.status || "").toLowerCase();
      const normalizedType = (patient.patientType || "").toLowerCase();
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        (patient.patientId &&
          patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        patient.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;
      const matchesType =
        patientTypeFilter === "all" || normalizedType === patientTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

      if (aValue === undefined || aValue === null) aValue = "";
      if (bValue === undefined || bValue === null) bValue = "";

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleImageError = (patientId: string): void => {
    setImageErrors((prev) => ({ ...prev, [patientId]: true }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "discharged":
        return "outline";
      case "emergency":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPatientTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "vip":
        return "default";
      case "regular":
        return "secondary";
      case "new":
        return "outline";
      case "emergency":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleEditPatient = (patient: PatientUI) => {
    setSelectedPatient(patient);
    setEditTab("details");
    setIsEditModalOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      const success = await dispatch(deletePatientRecord(patientId));
      if (success) {
        dispatch(fetchPatientStats());
      }
    }
  };

  const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const newPatient = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      role: "Customer" as const,
      age: parseInt(formData.get("age") as string) || 0,
      dateOfBirth: formData.get("dateOfBirth") as string,
      bloodGroup: formData.get("bloodGroup") as any,
      location: formData.get("location") as string,
      emergencyContact: {
        name: formData.get("emergencyContactName") as string,
        phone: formData.get("emergencyContactPhone") as string,
      },
      gender: formData.get("gender") as any,
      patientType: formData.get("patientType") as string,
    };

    const success = await dispatch(createPatient(newPatient));
    setIsSubmitting(false);
    if (success) {
      setIsAddModalOpen(false);
      dispatch(fetchPatientStats());
    }
  };

  const handleUpdatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const getString = (key: string, fallback = "") => {
      const value = formData.get(key);
      if (value === null || value === undefined) return fallback;
      const stringValue = String(value).trim();
      return stringValue.length ? stringValue : fallback;
    };

    const getNumber = (key: string, fallback = 0) => {
      const value = formData.get(key);
      if (value === null || value === undefined || value === "")
        return fallback;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    };

    const fallbackName = selectedPatient.name || "";
    const rawName = getString("name", fallbackName);
    const nameParts = rawName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    const fallbackNameParts = fallbackName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    const firstName =
      nameParts[0] || fallbackNameParts[0] || selectedPatient.name || "";
    const lastName =
      nameParts.slice(1).join(" ") ||
      fallbackNameParts.slice(1).join(" ") ||
      "";

    const emergencyContactFallback =
      typeof selectedPatient.emergencyContact === "string"
        ? { name: selectedPatient.emergencyContact, phone: "" }
        : selectedPatient.emergencyContact || { name: "", phone: "" };

    const updatedData = {
      firstName,
      lastName,
      email: getString("email", selectedPatient.email || ""),
      phone: getString("phone", selectedPatient.phone || ""),
      age: getNumber("age", selectedPatient.age || 0),
      dateOfBirth: getString("dateOfBirth", selectedPatient.dateOfBirth || ""),
      gender: getString("gender", selectedPatient.gender || "") as any,
      bloodGroup: getString(
        "bloodGroup",
        selectedPatient.bloodGroup || "",
      ) as any,
      location: getString("location", selectedPatient.location || ""),
      status: getString("status", selectedPatient.status || "") as any,
      patientType: getString("patientType", selectedPatient.patientType || ""),
      emergencyContact: {
        name: getString("emergencyContactName", emergencyContactFallback.name),
        phone: getString(
          "emergencyContactPhone",
          emergencyContactFallback.phone,
        ),
      },
      insuranceProvider: getString(
        "insuranceProvider",
        selectedPatient.insuranceProvider || "",
      ),
      medicalHistory: getString(
        "medicalHistory",
        selectedPatient.medicalHistory?.join(", ") || "",
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      currentMedications: getString(
        "currentMedications",
        selectedPatient.currentMedications?.join(", ") || "",
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      allergies: getString(
        "allergies",
        selectedPatient.allergies?.join(", ") || "",
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const success = await dispatch(
      updatePatientRecord(selectedPatient.id, updatedData),
    );
    setIsSubmitting(false);
    if (success) {
      setIsEditModalOpen(false);
      dispatch(fetchPatientStats());
    }
  };

  const handleExportPatients = async () => {
    setIsExporting(true);
    try {
      const blob = await exportPatientsList();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `patients-${new Date().toISOString()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const totalPatientsCount = patientStats?.totalPatients ?? patients.length;
  const activePatientsCount =
    patientStats?.activePatients ??
    patients.filter((p) => p.status.toLowerCase() === "active").length;
  const vipPatientsCount =
    patientStats?.vipPatients ??
    patients.filter((p) => p.patientType.toLowerCase() === "vip").length;
  const newPatientsCount =
    patientStats?.newPatients ??
    patients.filter((p) => p.patientType.toLowerCase() === "new").length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground">
              Manage your patient records and medical information
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportPatients}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? "Exporting..." : "Export Records"}
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalPatientsCount}
                  </p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Active records
                  </p>
                </div>
                <Users className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Patients
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {activePatientsCount}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {totalPatientsCount > 0
                      ? Math.round(
                          (activePatientsCount / totalPatientsCount) * 100,
                        )
                      : 0}
                    % of total
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">VIP Patients</p>
                  <p className="text-2xl font-bold text-foreground">
                    {vipPatientsCount}
                  </p>
                  <p className="text-sm text-purple-600 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    High priority
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Patients</p>
                  <p className="text-2xl font-bold text-foreground">
                    {newPatientsCount}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    This month
                  </p>
                </div>
                <Heart className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search patients by name, email, phone, or blood group..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={patientTypeFilter}
                  onValueChange={setPatientTypeFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
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

                {/* View Toggle */}
                <div className="flex border border-input rounded-lg overflow-hidden">
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                  Failed to load patients
                </p>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {error}
                </p>
                <Button
                  onClick={() => dispatch(fetchPatients())}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col justify-center items-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Loading patients...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && patients.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-16">
                <Users className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                <p className="text-xl text-slate-500 mb-2">No patients found</p>
                <p className="text-sm text-slate-400 mb-4">
                  Add your first patient to get started
                </p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patients Table */}
        {!isLoading && !error && patients.length > 0 && (
          <>
            {viewMode === "table" ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Visit</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="font-mono font-bold text-primary">
                              {patient.patientId || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                {!imageErrors[patient.id] && patient.avatar ? (
                                  <AvatarImage
                                    src={patient.avatar}
                                    onError={() => handleImageError(patient.id)}
                                  />
                                ) : (
                                  <AvatarFallback>
                                    {patient.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium">{patient.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {patient.age}y • {patient.bloodGroup}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{patient.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {patient.phone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(patient.status)}>
                              {patient.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getPatientTypeColor(patient.patientType)}
                            >
                              {patient.patientType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {new Date(patient.lastVisit).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Patient</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeletePatient(patient.id)
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Patient</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {paginatedPatients.map((patient) => (
                  <Card key={patient.id} className="flex flex-col h-full">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          {!imageErrors[patient.id] && patient.avatar ? (
                            <AvatarImage
                              src={patient.avatar}
                              onError={() => handleImageError(patient.id)}
                            />
                          ) : (
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{patient.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {patient.email}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Badge
                            variant={getStatusColor(patient.status)}
                            className="text-xs"
                          >
                            {patient.status}
                          </Badge>
                          <Badge
                            variant={getPatientTypeColor(patient.patientType)}
                            className="text-xs"
                          >
                            {patient.patientType}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {patient.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="w-4 h-4 text-muted-foreground" />
                          {patient.age}y • {patient.bloodGroup}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredPatients.length)}{" "}
                  of {filteredPatients.length} patients
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
          </>
        )}

        {/* Add Patient Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Create a new patient record with their medical information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPatient}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" name="age" type="number" required />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select name="gender" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select name="bloodGroup">
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactName">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">
                    Emergency Contact Phone
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="patientType">Patient Type</Label>
                  <Select name="patientType" defaultValue="new">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Patient"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Patient Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                View and edit patient medical information
              </DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <Tabs
                value={editTab}
                onValueChange={(value) =>
                  setEditTab(value as "details" | "medical" | "visits")
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="visits">Visits</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <form onSubmit={handleUpdatePatient} id="editPatientForm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editPatientId">Patient ID</Label>
                        <Input
                          id="editPatientId"
                          type="text"
                          value={selectedPatient.patientId || ""}
                          disabled
                          className="bg-muted text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Auto-generated and cannot be changed
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="editName">Full Name</Label>
                        <Input
                          id="editName"
                          name="name"
                          defaultValue={selectedPatient.name}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editEmail">Email</Label>
                        <Input
                          id="editEmail"
                          name="email"
                          type="email"
                          defaultValue={selectedPatient.email}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editPhone">Phone</Label>
                        <Input
                          id="editPhone"
                          name="phone"
                          defaultValue={selectedPatient.phone}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editAge">Age</Label>
                        <Input
                          id="editAge"
                          name="age"
                          type="number"
                          defaultValue={selectedPatient.age}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editDateOfBirth">Date of Birth</Label>
                        <Input
                          id="editDateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          defaultValue={selectedPatient.dateOfBirth}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editGender">Gender</Label>
                        <Select
                          name="gender"
                          defaultValue={selectedPatient.gender}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editBloodGroup">Blood Group</Label>
                        <Select
                          name="bloodGroup"
                          defaultValue={selectedPatient.bloodGroup}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editLocation">Location</Label>
                        <Input
                          id="editLocation"
                          name="location"
                          defaultValue={selectedPatient.location}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editStatus">Status</Label>
                        <Select
                          name="status"
                          defaultValue={selectedPatient.status}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="discharged">
                              Discharged
                            </SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editType">Patient Type</Label>
                        <Select
                          name="patientType"
                          defaultValue={selectedPatient.patientType}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <form onSubmit={handleUpdatePatient} id="editMedicalForm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editEmergencyContactName">
                          Emergency Contact Name
                        </Label>
                        <Input
                          id="editEmergencyContactName"
                          name="emergencyContactName"
                          defaultValue={
                            typeof selectedPatient.emergencyContact === "string"
                              ? selectedPatient.emergencyContact
                              : selectedPatient.emergencyContact?.name || ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="editEmergencyContactPhone">
                          Emergency Contact Phone
                        </Label>
                        <Input
                          id="editEmergencyContactPhone"
                          name="emergencyContactPhone"
                          defaultValue={
                            typeof selectedPatient.emergencyContact === "string"
                              ? ""
                              : selectedPatient.emergencyContact?.phone || ""
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="editInsurance">
                          Insurance Provider
                        </Label>
                        <Input
                          id="editInsurance"
                          name="insuranceProvider"
                          defaultValue={selectedPatient.insuranceProvider}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="editMedicalHistory">
                          Medical History (comma separated)
                        </Label>
                        <Textarea
                          id="editMedicalHistory"
                          name="medicalHistory"
                          defaultValue={
                            selectedPatient.medicalHistory?.join(", ") || ""
                          }
                          placeholder="Diabetes, Hypertension, etc."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="editMedications">
                          Current Medications (comma separated)
                        </Label>
                        <Textarea
                          id="editMedications"
                          name="currentMedications"
                          defaultValue={
                            selectedPatient.currentMedications?.join(", ") || ""
                          }
                          placeholder="Metformin 500mg, Aspirin 75mg, etc."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="editAllergies">
                          Allergies (comma separated)
                        </Label>
                        <Textarea
                          id="editAllergies"
                          name="allergies"
                          defaultValue={
                            selectedPatient.allergies?.join(", ") || ""
                          }
                          placeholder="Penicillin, Peanuts, etc."
                        />
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="visits" className="space-y-4">
                  <div className="text-center py-12">
                    <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Visit History
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Patient visit records will be displayed here
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">
                            {selectedPatient.totalVisits}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Visits
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">
                            ₹{selectedPatient.totalFees.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total Fees
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={
                  editTab === "medical" ? "editMedicalForm" : "editPatientForm"
                }
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Patient"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PatientsPage;
