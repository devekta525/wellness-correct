"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Stethoscope,
  Search,
  Eye,
  MapPin,
  Calendar,
  Users,
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
  Award,
  GraduationCap,
  Shield,
  Heart,
  Brain,
  Bone,
  Eye as EyeIcon,
  Baby,
  Grid3X3,
  List,
  Upload,
  Camera,
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
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  fetchUsersData,
  setFilters,
  setPagination,
  selectUsersData,
  selectUsersLoading,
  selectUsersError,
  selectUsersPagination,
  updateUser,
  deleteUser,
  User as UserType,
} from "@/lib/redux/features/userSlice";
import Loader from "@/components/common/dashboard/Loader";
import Error from "@/components/common/dashboard/Error";
import NoData from "@/components/common/dashboard/NoData";

// Doctor type definition
type Doctor = {
  id: number;
  name: string;
  email: string;
  phone: string;
  imageUrl: string;
  status: string;
  specialization: string;
  experience: number;
  rating: number;
  totalPatients: number;
  consultationFee: number;
  joinDate: string;
  location: string;
  qualifications: string;
  hospital: string;
  availability: string;
  languages: string[];
  tags: string[];
};

const DoctorsPage = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsersData);
  const isLoading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);
  const pagination = useAppSelector(selectUsersPagination);

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch doctors data on component mount
  useEffect(() => {
    dispatch(setFilters({ role: "Doctor" }));
    dispatch(fetchUsersData());
  }, [dispatch]);

  // Convert users to doctors format and filter
  const doctors: Doctor[] = users
    .filter((user) => user.role === "Doctor")
    .map((user) => ({
      id: parseInt(user._id.slice(-8), 16) || Math.random(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      imageUrl: "",
      status: user.status.toLowerCase(),
      specialization: user.specialization || "General Practice",
      experience: user.experience || 0,
      rating: 4.5, // Default rating since not in API
      totalPatients: 0, // Default since not in API
      consultationFee: user.consultationFee || 1000,
      joinDate: user.createdAt,
      location: user.location || "Not specified",
      qualifications: user.qualifications || "MBBS",
      hospital: user.hospital || "Not specified",
      availability: user.availability || "Mon-Fri 9AM-5PM",
      languages: user.language || ["English"],
      tags: user.specialization ? [user.specialization] : [],
    }));

  // Filter and sort doctors
  const filteredDoctors = doctors
    .filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.phone.includes(searchTerm) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || doctor.status === statusFilter;
      const matchesSpecialization =
        specializationFilter === "all" ||
        doctor.specialization === specializationFilter;
      return matchesSearch && matchesStatus && matchesSpecialization;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

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

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const paginatedDoctors = filteredDoctors.slice(
    startIndex,
    startIndex + pagination.limit,
  );

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    dispatch(setPagination({ page: newPage }));
    dispatch(fetchUsersData());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getSpecializationIcon = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case "cardiology":
        return Heart;
      case "neurology":
        return Brain;
      case "orthopedics":
        return Bone;
      case "ophthalmology":
        return EyeIcon;
      case "pediatrics":
        return Baby;
      case "dermatology":
        return Shield;
      default:
        return Stethoscope;
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    // Find the corresponding user from Redux state
    const user = users.find(
      (u) =>
        u.role === "Doctor" && `${u.firstName} ${u.lastName}` === doctor.name,
    );
    if (user) {
      setSelectedDoctor(user);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteDoctor = async (doctorId: number) => {
    try {
      const user = users.find(
        (u) =>
          u.role === "Doctor" && parseInt(u._id.slice(-8), 16) === doctorId,
      );
      if (user) {
        const success = (await dispatch(
          deleteUser(user._id),
        )) as unknown as boolean;
        if (success) {
          dispatch(fetchUsersData());
        }
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const handleAddDoctor = async () => {
    try {
      // Add logic to create doctor via API
      setIsAddModalOpen(false);
      dispatch(fetchUsersData());
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const handleUpdateDoctor = async () => {
    try {
      if (selectedDoctor) {
        const success = (await dispatch(
          updateUser(selectedDoctor._id, selectedDoctor),
        )) as unknown as boolean;
        if (success) {
          setIsEditModalOpen(false);
          dispatch(fetchUsersData());
        }
      }
    } catch (error) {
      console.error("_error updating doctor:", error);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading doctors" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Doctors</h1>
                <p className="text-muted-foreground">
                  Manage your medical professionals and specialists
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Doctor
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
                        Total Doctors
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {doctors.length}
                      </p>
                      <p className="text-sm text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +8% from last month
                      </p>
                    </div>
                    <Stethoscope className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Doctors
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {doctors.filter((d) => d.status === "active").length}
                      </p>
                      <p className="text-sm text-blue-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {Math.round(
                          (doctors.filter((d) => d.status === "active").length /
                            doctors.length) *
                            100,
                        )}
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
                      <p className="text-sm text-muted-foreground">
                        Specializations
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {new Set(doctors.map((d) => d.specialization)).size}
                      </p>
                      <p className="text-sm text-purple-600 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Medical fields
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg. Rating
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {(
                          doctors.reduce((sum, d) => sum + d.rating, 0) /
                          doctors.length
                        ).toFixed(1)}
                      </p>
                      <p className="text-sm text-orange-600 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Out of 5.0
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-orange-500" />
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
                        placeholder="Search doctors by name, email, phone, or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={specializationFilter}
                      onValueChange={setSpecializationFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specializations</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Ophthalmology">
                          Ophthalmology
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="specialization">
                          Specialization
                        </SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="totalPatients">Patients</SelectItem>
                        <SelectItem value="consultationFee">Fee</SelectItem>
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

            {/* Content */}
            {isLoading ? (
              <Loader variant="skeleton" message="Loading doctors..." />
            ) : filteredDoctors.length === 0 ? (
              <NoData
                message="No doctors found"
                description="Get started by adding your first doctor"
                icon={
                  <Stethoscope className="w-full h-full text-muted-foreground/60" />
                }
                action={{
                  label: "Add Doctor",
                  onClick: () => setIsAddModalOpen(true),
                }}
                size="lg"
              />
            ) : viewMode === "table" ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Patients</TableHead>
                        <TableHead>Consultation Fee</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDoctors.map((doctor) => {
                        const SpecializationIcon = getSpecializationIcon(
                          doctor.specialization,
                        );
                        return (
                          <TableRow key={doctor.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={doctor.imageUrl} />
                                  <AvatarFallback>
                                    {doctor.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{doctor.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {doctor.hospital}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <SpecializationIcon className="w-4 h-4 text-muted-foreground" />
                                <span>{doctor.specialization}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(doctor.status)}>
                                {doctor.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                {doctor.experience} years
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                {doctor.rating}/5.0
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {doctor.totalPatients}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  ₹{doctor.consultationFee}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditDoctor(doctor)}
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
                                      onClick={() => handleEditDoctor(doctor)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Doctor</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteDoctor(doctor.id)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Doctor</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedDoctors.map((doctor) => {
                  const SpecializationIcon = getSpecializationIcon(
                    doctor.specialization,
                  );
                  return (
                    <Card key={doctor.id} className="flex flex-col h-full">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={doctor.imageUrl} />
                            <AvatarFallback>
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{doctor.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {doctor.hospital}
                            </p>
                          </div>
                          <Badge
                            variant={getStatusColor(doctor.status)}
                            className="text-xs"
                          >
                            {doctor.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <SpecializationIcon className="w-4 h-4 text-muted-foreground" />
                            {doctor.specialization}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            {doctor.experience} years experience
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {doctor.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {doctor.rating}/5.0 rating
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {doctor.totalPatients}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Patients
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              ₹{doctor.consultationFee}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Consultation
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditDoctor(doctor)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditDoctor(doctor)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {/* Pagination */}
            {!isLoading && filteredDoctors.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(
                    startIndex + pagination.limit,
                    filteredDoctors.length,
                  )}{" "}
                  of {filteredDoctors.length} doctors
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(Math.max(pagination.page - 1, 1))
                    }
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.page + 1, totalPages),
                      )
                    }
                    disabled={pagination.page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Doctor Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Register a new doctor with their medical credentials
              </DialogDescription>
            </DialogHeader>
            {/* Avatar Section - Top Center */}
            <div className="flex flex-col items-center space-y-4 py-4">
              <Label className="text-lg font-medium">Profile Picture</Label>
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-doctor.svg" />
                <AvatarFallback className="text-xl">DR</AvatarFallback>
              </Avatar>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addName">Full Name</Label>
                <Input id="addName" placeholder="Dr. Full Name" />
              </div>
              <div>
                <Label htmlFor="addEmail">Email</Label>
                <Input
                  id="addEmail"
                  type="email"
                  placeholder="doctor@email.com"
                />
              </div>
              <div>
                <Label htmlFor="addPhone">Phone</Label>
                <Input id="addPhone" placeholder="+91 98765 43210" />
              </div>
              <div>
                <Label htmlFor="addSpecialization">Specialization</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="addExperience">Experience (Years)</Label>
                <Input id="addExperience" type="number" placeholder="5" />
              </div>
              <div>
                <Label htmlFor="addFee">Consultation Fee</Label>
                <Input id="addFee" type="number" placeholder="1500" />
              </div>
              <div>
                <Label htmlFor="addHospital">Hospital</Label>
                <Input id="addHospital" placeholder="Hospital Name" />
              </div>
              <div>
                <Label htmlFor="addLocation">Location</Label>
                <Input id="addLocation" placeholder="City, State" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addQualifications">Qualifications</Label>
                <Textarea id="addQualifications" placeholder="MBBS, MD, etc." />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddDoctor} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Doctor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Doctor Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Doctor Details</DialogTitle>
              <DialogDescription>
                View and edit doctor information and credentials
              </DialogDescription>
            </DialogHeader>
            {selectedDoctor && (
              <>
                {/* Avatar Section - Top Center */}
                <div className="flex flex-col items-center space-y-4 py-4">
                  <Label className="text-lg font-medium">Profile Picture</Label>
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={selectedDoctor.imageUrl || "/placeholder-doctor.svg"}
                    />
                    <AvatarFallback className="text-xl">
                      {selectedDoctor.firstName[0]}
                      {selectedDoctor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editName">Full Name</Label>
                        <Input
                          id="editName"
                          defaultValue={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editEmail">Email</Label>
                        <Input
                          id="editEmail"
                          type="email"
                          defaultValue={selectedDoctor.email}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editPhone">Phone</Label>
                        <Input
                          id="editPhone"
                          defaultValue={selectedDoctor.phone}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editSpecialization">
                          Specialization
                        </Label>
                        <Select defaultValue={selectedDoctor.specialization}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cardiology">
                              Cardiology
                            </SelectItem>
                            <SelectItem value="Neurology">Neurology</SelectItem>
                            <SelectItem value="Orthopedics">
                              Orthopedics
                            </SelectItem>
                            <SelectItem value="Pediatrics">
                              Pediatrics
                            </SelectItem>
                            <SelectItem value="Dermatology">
                              Dermatology
                            </SelectItem>
                            <SelectItem value="Ophthalmology">
                              Ophthalmology
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editExperience">Experience</Label>
                        <Input
                          id="editExperience"
                          type="number"
                          defaultValue={selectedDoctor.experience}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editFee">Consultation Fee</Label>
                        <Input
                          id="editFee"
                          type="number"
                          defaultValue={selectedDoctor.consultationFee}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editHospital">Hospital</Label>
                        <Input
                          id="editHospital"
                          defaultValue={selectedDoctor.hospital}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editLocation">Location</Label>
                        <Input
                          id="editLocation"
                          defaultValue={selectedDoctor.location}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editStatus">Status</Label>
                        <Select defaultValue={selectedDoctor.status}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="editAvailability">Availability</Label>
                        <Input
                          id="editAvailability"
                          defaultValue={selectedDoctor.availability}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="editQualifications">Qualifications</Label>
                      <Textarea
                        id="editQualifications"
                        defaultValue={selectedDoctor.qualifications}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4">
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Schedule Management
                      </h3>
                      <p className="text-muted-foreground">
                        Doctor&apos;s schedule and availability will be
                        displayed here
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="patients" className="space-y-4">
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Patient List
                      </h3>
                      <p className="text-muted-foreground">
                        Doctor&apos;s patients will be displayed here
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <div>
                      <Label htmlFor="editNotes">Notes</Label>
                      <Textarea
                        id="editNotes"
                        placeholder="Add notes about this doctor"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateDoctor} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Doctor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

// Export as dynamic component to prevent prerendering issues
export default dynamic(() => Promise.resolve(DoctorsPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  ),
});
