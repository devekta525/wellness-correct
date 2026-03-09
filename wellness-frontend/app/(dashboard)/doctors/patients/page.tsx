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
  ChevronLeft as ChevronLeftIcon,
  Upload,
} from "lucide-react";
import { FormSteps } from "@/components/ui/form-steps";
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
  const [addStep, setAddStep] = useState(1);
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
                  {sortOrder === "asc" ? "â†‘" : "â†“"}
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
                                  {patient.age}y â€¢ {patient.bloodGroup}
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
                          {patient.age}y â€¢ {patient.bloodGroup}
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
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setAddStep(1);
        }}>
          <DialogContent className="max-w-3xl p-0 gap-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight mb-1">Add New Patient</DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  Register a new patient and set up their medical profile.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="bg-white px-8 pt-8 pb-4">
              <FormSteps
                currentStep={addStep}
                steps={[
                  { id: 1, name: "Personal Info" },
                  { id: 2, name: "Physical Details" },
                  { id: 3, name: "Contact & Type" },
                ]}
              />
            </div>

            <form onSubmit={handleAddPatient}>
              <div className="px-8 py-6 bg-[#F8FAFC] min-h-[400px]">
                {addStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="form-grid">
                      <div className="form-field">
                        <label className="form-label form-label-required">First Name</label>
                        <input className="form-input" name="firstName" placeholder="e.g. John" required />
                      </div>
                      <div className="form-field">
                        <label className="form-label form-label-required">Last Name</label>
                        <input className="form-input" name="lastName" placeholder="e.g. Doe" required />
                      </div>
                      <div className="form-field">
                        <label className="form-label form-label-required">Email Address</label>
                        <input className="form-input" name="email" type="email" placeholder="patient@example.com" required />
                      </div>
                      <div className="form-field">
                        <label className="form-label form-label-required">Phone Number</label>
                        <input className="form-input" name="phone" placeholder="+91 98765 43210" required />
                      </div>
                      <div className="form-field form-field-full">
                        <label className="form-label form-label-required">Password</label>
                        <input className="form-input" name="password" type="password" placeholder="Set account password" required />
                      </div>
                    </div>
                  </div>
                )}

                {addStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="form-grid">
                      <div className="form-field">
                        <label className="form-label form-label-required">Age</label>
                        <input className="form-input" name="age" type="number" placeholder="Enter age" required />
                      </div>
                      <div className="form-field">
                        <label className="form-label form-label-required">Date of Birth</label>
                        <input className="form-input" name="dateOfBirth" type="date" required />
                      </div>
                      <div className="form-field">
                        <label className="form-label form-label-required">Gender</label>
                        <Select name="gender" required>
                          <SelectTrigger className="form-select-trigger">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Blood Group</label>
                        <Select name="bloodGroup">
                          <SelectTrigger className="form-select-trigger">
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {addStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="form-grid">
                      <div className="form-field">
                        <label className="form-label">Location</label>
                        <input className="form-input" name="location" placeholder="City, State" />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Patient Type</label>
                        <Select name="patientType" defaultValue="new">
                          <SelectTrigger className="form-select-trigger">
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
                      <div className="form-field">
                        <label className="form-label">Emergency Contact Name</label>
                        <input className="form-input" name="emergencyContactName" placeholder="Contact name" />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Emergency Phone</label>
                        <input className="form-input" name="emergencyContactPhone" placeholder="+91 98765 43210" />
                      </div>
                      <div className="form-field form-field-full mt-4">
                        <div className="upload-dropzone">
                          <div className="flex flex-col items-center gap-2 text-slate-500">
                            <Upload className="w-8 h-8 text-blue-500 mb-2" />
                            <p className="text-sm font-medium text-slate-700">Patient Photo (Optional)</p>
                            <p className="text-xs">Click to upload or drag and drop (Max 5MB)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => addStep > 1 ? setAddStep(addStep - 1) : setIsAddModalOpen(false)}
                >
                  {addStep === 1 ? "Cancel" : "Previous"}
                </button>
                <div className="flex gap-3">
                  {addStep < 3 ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setAddStep(addStep + 1)}
                    >
                      Next Step <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                      ) : (
                        <><UserPlus className="w-4 h-4" /> Add Patient</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Patient Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl p-0 gap-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Patient Profile</DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  View and manage comprehensive patient information
                </DialogDescription>
              </DialogHeader>
            </div>
            {selectedPatient && (
              <div className="px-8 py-6 bg-[#F8FAFC]">
                <Tabs
                  value={editTab}
                  onValueChange={(value) =>
                    setEditTab(value as "details" | "medical" | "visits")
                  }
                  className="w-full"
                >
                  <TabsList className="flex gap-2 p-1 bg-slate-200/50 rounded-xl mb-6 w-full max-w-[400px]">
                    <TabsTrigger value="details" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Details</TabsTrigger>
                    <TabsTrigger value="medical" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Medical</TabsTrigger>
                    <TabsTrigger value="visits" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Visits</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-0 animate-in fade-in duration-300">
                    <form onSubmit={handleUpdatePatient} id="editPatientForm">
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label">Patient ID</label>
                          <input className="form-input opacity-60" type="text" value={selectedPatient.patientId || ""} disabled />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Full Name</label>
                          <input className="form-input" id="editName" name="name" defaultValue={selectedPatient.name} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Email</label>
                          <input className="form-input" id="editEmail" name="email" type="email" defaultValue={selectedPatient.email} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Phone</label>
                          <input className="form-input" id="editPhone" name="phone" defaultValue={selectedPatient.phone} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Age</label>
                          <input className="form-input" id="editAge" name="age" type="number" defaultValue={selectedPatient.age} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Date of Birth</label>
                          <input className="form-input" id="editDateOfBirth" name="dateOfBirth" type="date" defaultValue={selectedPatient.dateOfBirth} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Gender</label>
                          <Select name="gender" defaultValue={selectedPatient.gender}>
                            <SelectTrigger className="form-select-trigger"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Blood Group</label>
                          <Select name="bloodGroup" defaultValue={selectedPatient.bloodGroup}>
                            <SelectTrigger className="form-select-trigger"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Location</label>
                          <input className="form-input" id="editLocation" name="location" defaultValue={selectedPatient.location} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Status</label>
                          <Select name="status" defaultValue={selectedPatient.status}>
                            <SelectTrigger className="form-select-trigger"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="discharged">Discharged</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Patient Type</label>
                          <Select name="patientType" defaultValue={selectedPatient.patientType}>
                            <SelectTrigger className="form-select-trigger"><SelectValue /></SelectTrigger>
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

                  <TabsContent value="medical" className="mt-0 animate-in fade-in duration-300">
                    <form onSubmit={handleUpdatePatient} id="editMedicalForm">
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label">Emergency Contact Name</label>
                          <input className="form-input" id="editEmergencyContactName" name="emergencyContactName"
                            defaultValue={typeof selectedPatient.emergencyContact === "string" ? selectedPatient.emergencyContact : selectedPatient.emergencyContact?.name || ""} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Emergency Contact Phone</label>
                          <input className="form-input" id="editEmergencyContactPhone" name="emergencyContactPhone"
                            defaultValue={typeof selectedPatient.emergencyContact === "string" ? "" : selectedPatient.emergencyContact?.phone || ""} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Insurance Provider</label>
                          <input className="form-input" id="editInsurance" name="insuranceProvider" defaultValue={selectedPatient.insuranceProvider} />
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label">Medical History (comma separated)</label>
                          <textarea className="form-textarea" id="editMedicalHistory" name="medicalHistory"
                            defaultValue={selectedPatient.medicalHistory?.join(", ") || ""}
                            placeholder="Diabetes, Hypertension, etc." rows={3} />
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label">Current Medications (comma separated)</label>
                          <textarea className="form-textarea" id="editMedications" name="currentMedications"
                            defaultValue={selectedPatient.currentMedications?.join(", ") || ""}
                            placeholder="Metformin 500mg, Aspirin 75mg, etc." rows={3} />
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label">Allergies (comma separated)</label>
                          <textarea className="form-textarea" id="editAllergies" name="allergies"
                            defaultValue={selectedPatient.allergies?.join(", ") || ""}
                            placeholder="Penicillin, Peanuts, etc." rows={3} />
                        </div>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="visits" className="mt-0 animate-in fade-in duration-300">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <Stethoscope className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Visit History</h3>
                      <p className="text-sm text-slate-400 mb-6">Patient visit records and associated fees</p>
                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <div className="rounded-xl bg-white border border-slate-100 p-4 text-center shadow-sm">
                          <p className="text-2xl font-bold text-slate-900">{selectedPatient.totalVisits}</p>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Visits</p>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-100 p-4 text-center shadow-sm">
                          <p className="text-2xl font-bold text-slate-900">₹{selectedPatient.totalFees.toLocaleString()}</p>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Fees</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Cancel</button>
              <button
                type="submit"
                form={editTab === "medical" ? "editMedicalForm" : "editPatientForm"}
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Patient"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PatientsPage;
