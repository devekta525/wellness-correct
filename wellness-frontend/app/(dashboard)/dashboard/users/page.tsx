"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Grid3X3,
  List,
  Edit,
  Trash2,
  UserPlus,
  User,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Crown,
  Stethoscope,
  Megaphone,
  ShoppingBag,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiV1Url } from "@/lib/utils/api";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "@/components/common/dashboard/Loader";
import Error from "@/components/common/dashboard/Error";
import NoData from "@/components/common/dashboard/NoData";
import Swal from "sweetalert2";

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "Admin" | "Doctor" | "Influencer" | "Customer" | "admin" | "doctor" | "influencer" | "customer";
  status: "Active" | "Inactive" | "active" | "inactive";
  imageUrl?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  followers?: number;
  platform?: string;
  commissionRate?: number;
  experience?: number;
  hospital?: string;
  consultationFee?: number;
  isActive?: boolean;
}

const userRoles = ["All", "Admin", "Doctor", "Influencer", "Customer"];
const userStatuses = ["All", "Active", "Inactive"];

const UsersPage = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    role: "All",
    status: "All",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newUserFileInputRef = useRef<HTMLInputElement>(null);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    imageUrl: "",
    role: "Customer" as "Admin" | "Doctor" | "Influencer" | "Customer",
    status: "Active" as "Active" | "Inactive",
    dateOfBirth: "",
    address: "",
    bio: "",
    verified: false,
  });

  const getUserImage = (user: UserType) => {
    return user.imageUrl || "/placeholder-user.svg";
  };

  // Avatar upload functions
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedUser) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedUser({
          ...selectedUser,
          imageUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        imageUrl: undefined,
      });
    }
  };

  // New User avatar functions
  const handleNewUserAvatarUpload = () => {
    newUserFileInputRef.current?.click();
  };

  const handleNewUserFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewUser({
          ...newUser,
          imageUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewUserAvatar = () => {
    setNewUser({
      ...newUser,
      imageUrl: "",
    });
  };

  // Fetch data on component mount
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.role && filters.role !== "All")
        queryParams.append("role", filters.role);
      if (filters.status && filters.status !== "All")
        queryParams.append("status", filters.status);

      const res = await fetch(getApiV1Url(`/users?${queryParams.toString()}`));
      const data = await res.json();

      if (res.ok || data.success) {
        setUsers(data.users || data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || data.pagination?.total || 0,
        }));
        setError("");
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  // Pagination logic using Redux pagination
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="w-4 h-4" />;
      case "Doctor":
        return <Stethoscope className="w-4 h-4" />;
      case "Influencer":
        return <Megaphone className="w-4 h-4" />;
      case "Customer":
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800";
      case "Doctor":
        return "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800";
      case "Influencer":
        return "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800";
      case "Customer":
        return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-4 h-4" />;
      case "Inactive":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
      case "Inactive":
        return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRoleChange = (value: string) => {
    setFilters((prev) => ({ ...prev, role: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleDeleteUser = async () => {
    // Prevent deleting admin users (check both lowercase and capitalized formats)
    const isAdminUser =
      selectedUser?.role === "Admin" ||
      selectedUser?.role === "admin";
    
    if (!selectedUser || isAdminUser) return;

    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${selectedUser.firstName} ${selectedUser.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setModalLoading(true);
        try {
          const res = await fetch(getApiV1Url(`/users/${selectedUser._id}`), {
            method: "DELETE",
          });
          const data = await res.json();

          if (data.success) {
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
            Swal.fire("Deleted!", "User has been deleted.", "success");
          } else {
            Swal.fire(
              "Error!",
              data.message || "Failed to delete user",
              "error",
            );
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("Error!", "Failed to delete user", "error");
        } finally {
          setModalLoading(false);
        }
      }
    });
  };

  const openViewModal = (user: UserType) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openEditModal = (user: UserType) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", selectedUser.firstName);
      formData.append("lastName", selectedUser.lastName);
      formData.append("email", selectedUser.email);
      formData.append("phone", selectedUser.phone);
      formData.append("role", selectedUser.role);
      formData.append("status", selectedUser.status);
      if (selectedUser.dateOfBirth)
        formData.append("dateOfBirth", selectedUser.dateOfBirth);
      if (selectedUser.address)
        formData.append("address", selectedUser.address);
      if (selectedUser.bio) formData.append("bio", selectedUser.bio);
      formData.append("verified", String(selectedUser.verified));

      if (fileInputRef.current?.files?.[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }

      const res = await fetch(getApiV1Url(`/users/${selectedUser._id}`), {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setShowEditModal(false);
        fetchUsers();
        Swal.fire("Success", "User updated successfully", "success");
      } else {
        Swal.fire("Error", data.message || "Failed to update user", "error");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire("Error", "Failed to update user", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddUser = async () => {
    setModalLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", newUser.firstName);
      formData.append("lastName", newUser.lastName);
      formData.append("email", newUser.email);
      formData.append("password", "Password@123"); // Default password required by backend
      formData.append("phone", newUser.phone);
      formData.append("role", newUser.role);
      formData.append("status", newUser.status);

      if (newUserFileInputRef.current?.files?.[0]) {
        formData.append("image", newUserFileInputRef.current.files[0]);
      }

      const res = await fetch(getApiV1Url("/users"), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setShowAddModal(false);
        fetchUsers();
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          imageUrl: "",
          role: "Customer",
          status: "Active",
          dateOfBirth: "",
          address: "",
          bio: "",
          verified: false,
        });
        Swal.fire("Success", "User created successfully", "success");
      } else {
        Swal.fire("Error", data.message || "Failed to create user", "error");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      Swal.fire("Error", "Failed to create user", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const openDeleteModal = (user: UserType) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 p-2"
      >
        {error ? (
          <Error title="Error loading users" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  Users
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-violet-500 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {pagination.total}
                      </p>
                    </div>
                    <div className="p-3 bg-violet-100 dark:bg-violet-900/20 rounded-full">
                      <User className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Users
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {
                          (users || []).filter(
                            (u) =>
                              u.status === "Active" ||
                              u.status === "active" ||
                              u.isActive,
                          ).length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                      <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-sky-500 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Doctors</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {
                          (users || []).filter((u) => u.role === "Doctor")
                            .length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-sky-100 dark:bg-sky-900/20 rounded-full">
                      <Stethoscope className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Influencers
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {
                          (users || []).filter((u) => u.role === "Influencer")
                            .length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-full">
                      <Megaphone className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-none shadow-sm bg-muted/30">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 bg-background border-muted-foreground/20 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Role Filter */}
                  <Select value={filters.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full lg:w-[180px] bg-background border-muted-foreground/20">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role === "All"
                            ? "All Roles"
                            : role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select
                    value={filters.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full lg:w-[180px] bg-background border-muted-foreground/20">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {userStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "All"
                            ? "All Statuses"
                            : status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex bg-background border border-muted-foreground/20 rounded-lg overflow-hidden p-1 gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "grid" ? "secondary" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("grid")}
                          className="rounded-md h-8 w-8"
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
                          variant={viewMode === "list" ? "secondary" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("list")}
                          className="rounded-md h-8 w-8"
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
              </CardContent>
            </Card>

            {/* Content */}
            {isLoading ? (
              <Loader variant="skeleton" message="Loading users..." />
            ) : users.length === 0 ? (
              <NoData
                message="No users found"
                description="Get started by adding your first user"
                icon={
                  <User className="w-full h-full text-muted-foreground/60" />
                }
                action={{
                  label: "Add User",
                  onClick: () => setShowAddModal(true),
                }}
                size="lg"
              />
            ) : viewMode === "grid" ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {users.map((user) => (
                  <motion.div
                    key={user._id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group border-muted/60">
                      <CardHeader className="pb-4 relative">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-indigo-50 dark:from-violet-950/20 dark:via-fuchsia-950/20 dark:to-indigo-950/20 z-0" />
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="w-16 h-16 border-4 border-white dark:border-slate-950 shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0 ring-2 ring-violet-100 dark:ring-violet-900/20">
                              <AvatarImage
                                src={getUserImage(user)}
                                alt={`${user.firstName} ${user.lastName}`}
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder-user.svg";
                                }}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <CardTitle
                                className="text-lg font-bold truncate"
                                title={`${user.firstName} ${user.lastName}`}
                              >
                                {user.firstName} {user.lastName}
                              </CardTitle>
                              <CardDescription
                                className="text-xs truncate"
                                title={user.email}
                              >
                                {user.email}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 items-end flex-shrink-0 ml-2">
                            <Badge
                              variant="outline"
                              className={getRoleBadgeStyles(user.role)}
                            >
                              {getRoleIcon(user.role)}
                              <span className="ml-1">
                                {user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)}
                              </span>
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getStatusBadgeStyles(user.status)}
                            >
                              {getStatusIcon(user.status)}
                              <span className="ml-1">
                                {user.status.charAt(0).toUpperCase() +
                                  user.status.slice(1)}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-1 flex flex-col">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Phone:
                            </span>
                            <span className="text-sm font-medium">
                              {user.phone}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Verified:
                            </span>
                            <Badge
                              variant={user.verified ? "default" : "secondary"}
                              className={
                                user.verified
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                                  : ""
                              }
                            >
                              {user.verified ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Join Date:
                            </span>
                            <span className="text-sm font-medium">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {user.role === "Customer" && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Status:
                              </span>
                              <span className="text-sm font-medium">
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          )}
                          {user.role === "Influencer" && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Followers:
                              </span>
                              <span className="text-sm font-medium">
                                {user.followers?.toLocaleString() || 0}
                              </span>
                            </div>
                          )}
                          {user.role === "Doctor" && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Experience:
                              </span>
                              <span className="text-sm font-medium">
                                {user.experience || 0} years
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 mt-auto">
                          <Button
                            onClick={() => openViewModal(user)}
                            className="flex-1 gap-2 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/20 dark:hover:text-violet-400 border-violet-200 dark:border-violet-800"
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          <Button
                            onClick={() => openEditModal(user)}
                            className="flex-1 gap-2 bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40"
                            size="sm"
                            variant="ghost"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Phone
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Join Date
                      </TableHead>
                      <TableHead className="hidden xl:table-cell">
                        Last Login
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user._id}
                        className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={getUserImage(user)}
                                alt={`${user.firstName} ${user.lastName}`}
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder-user.svg";
                                }}
                              />
                              <AvatarFallback>
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getRoleBadgeStyles(user.role)}
                          >
                            {getRoleIcon(user.role)}
                            <span className="ml-1">
                              {user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeStyles(user.status)}
                          >
                            {getStatusIcon(user.status)}
                            <span className="ml-1">
                              {user.status.charAt(0).toUpperCase() +
                                user.status.slice(1)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.phone}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openViewModal(user)}
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View user</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openEditModal(user)}
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit user</p>
                              </TooltipContent>
                            </Tooltip>
                            {user.role !== "Admin" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => openDeleteModal(user)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete user</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {/* Pagination */}
            {!isLoading && users.length > 0 && totalPages > 1 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, pagination.total)} of{" "}
                      {pagination.total} users
                    </div>
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
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              pagination.page === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
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
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* View User Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                User Profile - {selectedUser?.firstName}{" "}
                {selectedUser?.lastName}
              </DialogTitle>
              <DialogDescription>
                Complete user information and account details.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">
                          {selectedUser.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">
                          {selectedUser.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Date of Birth:
                        </span>
                        <span className="font-medium">
                          {selectedUser.dateOfBirth
                            ? new Date(
                                selectedUser.dateOfBirth,
                              ).toLocaleDateString()
                            : "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium text-right max-w-[200px]">
                          {selectedUser.address}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <Badge
                          variant="outline"
                          className={getRoleBadgeStyles(selectedUser.role)}
                        >
                          {getRoleIcon(selectedUser.role)}
                          <span className="ml-1">
                            {selectedUser.role.charAt(0).toUpperCase() +
                              selectedUser.role.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeStyles(selectedUser.status)}
                        >
                          {getStatusIcon(selectedUser.status)}
                          <span className="ml-1">
                            {selectedUser.status.charAt(0).toUpperCase() +
                              selectedUser.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verified:</span>
                        <Badge
                          variant={
                            selectedUser.verified ? "default" : "secondary"
                          }
                          className={
                            selectedUser.verified
                              ? "bg-emerald-500 text-white border-0"
                              : ""
                          }
                        >
                          {selectedUser.verified ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Join Date:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedUser.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Updated:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedUser.updatedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedUser.bio}
                    </p>
                  </CardContent>
                </Card>

                {/* Role-specific Information */}
                {selectedUser.role === "Customer" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            Contact Info
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedUser.phone}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            Status
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedUser.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedUser.role === "Influencer" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Influencer Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {selectedUser.followers?.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Followers
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {selectedUser.platform || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Platform
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {selectedUser.commissionRate || 0}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Commission Rate
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedUser.role === "Doctor" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Doctor Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {selectedUser.experience || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Years Experience
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {selectedUser.hospital || "Not specified"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Hospital
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {selectedUser.consultationFee || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Consultation Fee
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit User - {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogTitle>
              <DialogDescription>
                Update user information and account settings.
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* Avatar Section - Top Center */}
                <div className="flex flex-col items-center space-y-4 py-4">
                  <Label htmlFor="avatar" className="text-lg font-medium">
                    Profile Picture
                  </Label>
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={selectedUser.imageUrl || "/placeholder-user.svg"}
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    />
                    <AvatarFallback className="text-xl">
                      {selectedUser.firstName[0]}
                      {selectedUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAvatarUpload}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button onClick={removeAvatar} variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={selectedUser.firstName}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={selectedUser.lastName}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={selectedUser.phone}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(
                        value: "Admin" | "Doctor" | "Influencer" | "Customer",
                      ) => setSelectedUser({ ...selectedUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Doctor">Doctor</SelectItem>
                        <SelectItem value="Influencer">Influencer</SelectItem>
                        <SelectItem value="Customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedUser.status}
                      onValueChange={(value: "Active" | "Inactive") =>
                        setSelectedUser({ ...selectedUser, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={selectedUser.dateOfBirth}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="verified">Verified</Label>
                    <Select
                      value={selectedUser.verified ? "true" : "false"}
                      onValueChange={(value) =>
                        setSelectedUser({
                          ...selectedUser,
                          verified: value === "true",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Verified</SelectItem>
                        <SelectItem value="false">Not Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={selectedUser.address}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={selectedUser.bio}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, bio: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={modalLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={modalLoading}>
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add User Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with the required information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Avatar Section - Top Center */}
              <div className="flex flex-col items-center space-y-4 py-4">
                <Label htmlFor="newAvatar" className="text-lg font-medium">
                  Profile Picture
                </Label>
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={newUser.imageUrl || "/placeholder-user.svg"}
                    alt={`${newUser.firstName} ${newUser.lastName}`}
                  />
                  <AvatarFallback className="text-xl">
                    {newUser.firstName ? newUser.firstName[0] : "?"}
                    {newUser.lastName ? newUser.lastName[0] : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-3">
                  <Button
                    onClick={handleNewUserAvatarUpload}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button
                    onClick={removeNewUserAvatar}
                    variant="outline"
                    size="sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <input
                  ref={newUserFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewUserFileSelect}
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="newFirstName">First Name</Label>
                  <Input
                    id="newFirstName"
                    placeholder="Enter first name"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="newLastName">Last Name</Label>
                  <Input
                    id="newLastName"
                    placeholder="Enter last name"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="newEmail">Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="newPhone">Phone</Label>
                  <Input
                    id="newPhone"
                    placeholder="Enter phone number"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="newRole">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(
                      value: "Admin" | "Doctor" | "Influencer" | "Customer",
                    ) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Doctor">Doctor</SelectItem>
                      <SelectItem value="Influencer">Influencer</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newStatus">Status</Label>
                  <Select
                    value={newUser.status}
                    onValueChange={(value: "Active" | "Inactive") =>
                      setNewUser({ ...newUser, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newDateOfBirth">Date of Birth</Label>
                  <Input
                    id="newDateOfBirth"
                    type="date"
                    value={newUser.dateOfBirth}
                    onChange={(e) =>
                      setNewUser({ ...newUser, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="newVerified">Verified</Label>
                  <Select
                    value={newUser.verified ? "true" : "false"}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, verified: value === "true" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Verified</SelectItem>
                      <SelectItem value="false">Not Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="newAddress">Address</Label>
                <Textarea
                  id="newAddress"
                  placeholder="Enter address"
                  value={newUser.address}
                  onChange={(e) =>
                    setNewUser({ ...newUser, address: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="newBio">Bio</Label>
                <Textarea
                  id="newBio"
                  placeholder="Enter bio"
                  value={newUser.bio}
                  onChange={(e) =>
                    setNewUser({ ...newUser, bio: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={modalLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={modalLoading}>
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.firstName}{" "}
                {selectedUser?.lastName}? This action cannot be undone.
                {(selectedUser?.role === "Admin" ||
                  selectedUser?.role === "admin") && (  
                  <span className="text-red-500 font-semibold">
                    {" "}
                    Admin users cannot be deleted.
                  </span> 
                
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={
                  isLoading ||
                  selectedUser?.role === "Admin" ||
                  selectedUser?.role === "admin"
                
                }
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

export default UsersPage;
