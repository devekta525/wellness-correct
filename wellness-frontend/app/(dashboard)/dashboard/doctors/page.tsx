"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
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
  User,
  Mail,
  Phone,
  Hospital,
  BookOpen,
  Briefcase,
  Clock,
  StickyNote,
  Globe,
  ChevronLeft as ChevronLeftIcon,
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
  createUser,
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
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const addDoctorFileRef = useRef<HTMLInputElement>(null);
  const [newDoctor, setNewDoctor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    consultationFee: "",
    hospital: "",
    location: "",
    qualifications: "",
    status: "active",
    password: "Doctor@123",
    imageUrl: "",
  });

  // Fetch doctors data on component mount
  useEffect(() => {
    dispatch(setFilters({ role: "Doctor" }));
    dispatch(fetchUsersData());
  }, [dispatch]);

  useEffect(() => {
    if (searchParams?.get("action") === "add") {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

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

  const handleAddDoctorImageUpload = () => {
    addDoctorFileRef.current?.click();
  };

  const handleAddDoctorFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewDoctor((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAddDoctorImage = () => {
    setNewDoctor((prev) => ({ ...prev, imageUrl: "" }));
    if (addDoctorFileRef.current) {
      addDoctorFileRef.current.value = "";
    }
  };

  const handleAddDoctor = async () => {
    try {
      const formData = new FormData();
      formData.append("firstName", newDoctor.firstName);
      formData.append("lastName", newDoctor.lastName);
      formData.append("email", newDoctor.email);
      formData.append("phone", newDoctor.phone);
      formData.append("password", newDoctor.password);
      formData.append("role", "Doctor");
      formData.append("status", newDoctor.status);
      formData.append("specialization", newDoctor.specialization);
      formData.append("experience", newDoctor.experience);
      formData.append("consultationFee", newDoctor.consultationFee);
      formData.append("hospital", newDoctor.hospital);
      formData.append("location", newDoctor.location);
      formData.append("qualifications", newDoctor.qualifications);

      if (addDoctorFileRef.current?.files?.[0]) {
        formData.append("image", addDoctorFileRef.current.files[0]);
      }

      const success = (await dispatch(
        createUser(formData as any),
      )) as unknown as boolean;
      if (success) {
        setIsAddModalOpen(false);
        setNewDoctor({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          specialization: "",
          experience: "",
          consultationFee: "",
          hospital: "",
          location: "",
          qualifications: "",
          status: "active",
          password: "Doctor@123",
          imageUrl: "",
        });
        if (addDoctorFileRef.current) {
          addDoctorFileRef.current.value = "";
        }
        dispatch(fetchUsersData());
      }
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
                  type="button"
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
        <Dialog
          open={isAddModalOpen}
          onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) setAddStep(1);
          }}
        >
          <DialogContent className="max-w-3xl p-0 gap-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight mb-1">
                  Add New Doctor
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  Onboard a new medical professional to the platform.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="bg-white px-8 pt-8 pb-4">
              <FormSteps
                currentStep={addStep}
                steps={[
                  { id: 1, name: "Professional Identity" },
                  { id: 2, name: "Background & Fee" },
                  { id: 3, name: "Social & Profile" },
                ]}
              />
            </div>

            <div className="px-8 py-6 bg-[#F8FAFC] min-h-[400px]">
              {addStep === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label form-label-required">
                        First Name
                      </label>
                      <input
                        className="form-input"
                        placeholder="e.g. John"
                        value={newDoctor.firstName}
                        onChange={(e) =>
                          setNewDoctor({
                            ...newDoctor,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label form-label-required">
                        Last Name
                      </label>
                      <input
                        className="form-input"
                        placeholder="e.g. Doe"
                        value={newDoctor.lastName}
                        onChange={(e) =>
                          setNewDoctor({
                            ...newDoctor,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label form-label-required">
                        Email Address
                      </label>
                      <input
                        className="form-input"
                        type="email"
                        placeholder="doctor@example.com"
                        value={newDoctor.email}
                        onChange={(e) =>
                          setNewDoctor({ ...newDoctor, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label form-label-required">
                        Phone Number
                      </label>
                      <input
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={newDoctor.phone}
                        onChange={(e) =>
                          setNewDoctor({ ...newDoctor, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field form-field-full">
                      <label className="form-label form-label-required">
                        Medical Specialization
                      </label>
                      <Select
                        value={newDoctor.specialization}
                        onValueChange={(v) =>
                          setNewDoctor({ ...newDoctor, specialization: v })
                        }
                      >
                        <SelectTrigger className="form-select-trigger">
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Cardiology",
                            "Neurology",
                            "Orthopedics",
                            "Pediatrics",
                            "Dermatology",
                            "Ophthalmology",
                            "Psychiatry",
                            "General Medicine",
                          ].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {addStep === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label form-label-required">
                        Experience (Years)
                      </label>
                      <input
                        className="form-input"
                        type="number"
                        placeholder="Years of practice"
                        value={newDoctor.experience}
                        onChange={(e) =>
                          setNewDoctor({
                            ...newDoctor,
                            experience: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label form-label-required">
                        Consultation Fee (₹)
                      </label>
                      <input
                        className="form-input"
                        type="number"
                        placeholder="Standard fee"
                        value={newDoctor.consultationFee}
                        onChange={(e) =>
                          setNewDoctor({
                            ...newDoctor,
                            consultationFee: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label form-label-required">
                        Hospital Affiliation
                      </label>
                      <input
                        className="form-input"
                        placeholder="Organization name"
                        value={newDoctor.hospital}
                        onChange={(e) =>
                          setNewDoctor({
                            ...newDoctor,
                            hospital: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label form-label-required">
                        Location
                      </label>
                      <input
                        className="form-input"
                        placeholder="City, State"
                        value={newDoctor.location}
                        onChange={(e) =>
                          setNewDoctor({
                            ...newDoctor,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field form-field-full">
                      <label className="form-label">Qualifications</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Degrees & Certifications (e.g. MBBS, MD, PhD)"
                        rows={3}
                        value={newDoctor.qualifications}
                        onChange={(e) =>
                          setNewDoctor({
                            ...newDoctor,
                            qualifications: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {addStep === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                        <AvatarImage
                          src={newDoctor.imageUrl}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl font-bold bg-blue-50 text-blue-600">
                          {newDoctor.firstName?.[0]}
                          {newDoctor.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={handleAddDoctorImageUpload}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      Professional Profile Photo
                    </p>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">Availability</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Mon-Sat (9AM-5PM)"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Default Password</label>
                      <input
                        className="form-input"
                        type="password"
                        value={newDoctor.password}
                        onChange={(e) =>
                          setNewDoctor({
                            ...newDoctor,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field form-field-full">
                      <div className="upload-dropzone">
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <Upload className="w-8 h-8 text-blue-500 mb-2" />
                          <p className="text-sm font-medium text-slate-700">
                            Medical License / ID Verification
                          </p>
                          <p className="text-xs">
                            Upload credible proof for account verification
                          </p>
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
                onClick={() =>
                  addStep > 1
                    ? setAddStep(addStep - 1)
                    : setIsAddModalOpen(false)
                }
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
                  <button
                    onClick={handleAddDoctor}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" /> Add Doctor
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={addDoctorFileRef}
              className="hidden"
              accept="image/*"
              onChange={handleAddDoctorFileChange}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Doctor Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl p-0 gap-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                  Doctor Profile
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  Manage medical professional credentials and parameters.
                </DialogDescription>
              </DialogHeader>
            </div>

            {selectedDoctor && (
              <div className="px-8 py-6 bg-[#F8FAFC]">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="flex gap-2 p-1 bg-slate-200/50 rounded-xl mb-6 w-full max-w-[500px]">
                    <TabsTrigger
                      value="details"
                      className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Clinical Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="schedule"
                      className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Operation Log
                    </TabsTrigger>
                    <TabsTrigger
                      value="patients"
                      className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Patient Index
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="details"
                    className="mt-0 animate-in fade-in duration-300"
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateDoctor();
                      }}
                    >
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label">First Name</label>
                          <input
                            className="form-input"
                            value={selectedDoctor.firstName}
                            onChange={(e) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Last Name</label>
                          <input
                            className="form-input"
                            value={selectedDoctor.lastName}
                            onChange={(e) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Email</label>
                          <input
                            className="form-input"
                            type="email"
                            value={selectedDoctor.email}
                            onChange={(e) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Phone</label>
                          <input
                            className="form-input"
                            value={selectedDoctor.phone}
                            onChange={(e) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Specialization</label>
                          <Select
                            value={selectedDoctor.specialization}
                            onValueChange={(v) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                specialization: v,
                              })
                            }
                          >
                            <SelectTrigger className="form-select-trigger">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Cardiology",
                                "Neurology",
                                "Orthopedics",
                                "Pediatrics",
                                "Dermatology",
                                "Ophthalmology",
                              ].map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            Experience (Years)
                          </label>
                          <input
                            className="form-input"
                            type="number"
                            value={selectedDoctor.experience}
                            onChange={(e) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                experience: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">
                            Consultation Fee (₹)
                          </label>
                          <input
                            className="form-input"
                            type="number"
                            value={selectedDoctor.consultationFee}
                            onChange={(e) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                consultationFee: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Status</label>
                          <Select
                            value={selectedDoctor.status}
                            onValueChange={(v) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                status: v as "Active" | "Inactive",
                              })
                            }
                          >
                            <SelectTrigger className="form-select-trigger">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label">Hospital</label>
                          <input
                            className="form-input"
                            value={selectedDoctor.hospital}
                            onChange={(e) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                hospital: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label">Qualifications</label>
                          <textarea
                            className="form-textarea"
                            rows={3}
                            value={selectedDoctor.qualifications}
                            onChange={(e) =>
                              setSelectedDoctor({
                                ...selectedDoctor,
                                qualifications: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent
                    value="schedule"
                    className="mt-0 animate-in fade-in duration-300"
                  >
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Availability Matrix
                      </h3>
                      <p className="text-sm text-slate-400 mb-6 font-medium">
                        Configure weekly operational slots
                      </p>
                      <button className="btn-secondary">
                        Configure Schedule
                      </button>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="patients"
                    className="mt-0 animate-in fade-in duration-300"
                  >
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Patient History
                      </h3>
                      <p className="text-sm text-slate-400 mb-6 font-medium">
                        Historical records of consultations
                      </p>
                      <button className="btn-secondary">View Registry</button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDoctor}
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                    Synchronizing...
                  </>
                ) : (
                  "Commit Updates"
                )}
              </button>
            </div>
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
