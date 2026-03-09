"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
  ShieldCheck,
  AlertCircle,
  Activity,
  History,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserMinus,
  Settings,
  Crown,
  Stethoscope,
  Megaphone,
  ShoppingBag,
  CheckCircle,
  Clock,
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
  role:
  | "Admin"
  | "Doctor"
  | "Influencer"
  | "Customer"
  | "admin"
  | "doctor"
  | "influencer"
  | "customer";
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

const UsersPageContent = () => {
  const searchParams = useSearchParams();
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

      // Attach auth token if available
      let token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("authToken") ||
            localStorage.getItem("accessToken"))) ||
        null;

      if (token && typeof token === "string") token = token.replace(/^"|"$/g, "");

      if (!token) {
        setError("Could not find authentication token. Please log in again.");
        setIsLoading(false);
        return;
      }

      const res = await fetch(getApiV1Url(`/users?${queryParams.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  useEffect(() => {
    if (searchParams?.get("action") === "add") {
      setShowAddModal(true);
    }
  }, [searchParams]);

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
        return "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100";
      case "Doctor":
        return "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100";
      case "Influencer":
        return "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100";
      case "Customer":
        return "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
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
        return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100";
      case "Inactive":
        return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
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
      selectedUser?.role === "Admin" || selectedUser?.role === "admin";

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
          // include auth token for protected route
          let token =
            (typeof window !== "undefined" &&
              (localStorage.getItem("authToken") ||
                localStorage.getItem("accessToken"))) ||
            null;

          if (token && typeof token === "string") token = token.replace(/^"|"$/g, "");

          const res = await fetch(getApiV1Url(`/users/${selectedUser._id}`), {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
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

      // include auth token for protected route
      let token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("authToken") ||
            localStorage.getItem("accessToken"))) ||
        null;

      if (token && typeof token === "string") token = token.replace(/^"|"$/g, "");

      const res = await fetch(getApiV1Url(`/users/${selectedUser._id}`), {
        method: "PUT",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

      // include auth token for protected route
      let token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("authToken") ||
            localStorage.getItem("accessToken"))) ||
        null;

      if (token && typeof token === "string") token = token.replace(/^"|"$/g, "");

      const res = await fetch(getApiV1Url("/users"), {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Users Management
                </h1>
                <p className="text-slate-500 mt-1 font-medium">
                  Manage user accounts, roles, and platform permissions
                </p>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="gap-2 shadow-md hover:shadow-lg transition-all bg-primary text-white border-0"
              >
                <UserPlus className="w-4 h-4" />
                Create New User
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">
                        Total Registry
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {pagination.total}
                      </p>
                    </div>
                    <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl transition-transform duration-500 group-hover:scale-110">
                      <User className="w-6 h-6 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">
                        Active Nodes
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
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
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl transition-transform duration-500 group-hover:scale-110">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Medical Professionals</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {
                          (users || []).filter((u) => u.role === "Doctor")
                            .length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl transition-transform duration-500 group-hover:scale-110">
                      <Stethoscope className="w-6 h-6 text-sky-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">
                        Influencer Index
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {
                          (users || []).filter((u) => u.role === "Influencer")
                            .length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl transition-transform duration-500 group-hover:scale-110">
                      <Megaphone className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            {/* Filters and Search */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Search */}
                  <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Search entity registry..."
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="h-14 pl-14 pr-6 rounded-xl bg-slate-50 border-transparent focus:border-primary/20 focus:bg-white shadow-sm transition-all text-sm font-bold placeholder:font-medium w-full"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {/* Role Filter */}
                    <Select value={filters.role} onValueChange={handleRoleChange}>
                      <SelectTrigger className="w-full sm:w-[180px] h-14 rounded-xl bg-slate-50 border-transparent text-xs font-black uppercase tracking-widest text-slate-600 transition-all">
                        <SelectValue placeholder="System Role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-2">
                        {userRoles.map((role) => (
                          <SelectItem key={role} value={role} className="rounded-xl mb-1 focus:bg-primary/5 focus:text-primary font-bold uppercase tracking-tighter text-[11px]">
                            {role === "All" ? "Complete Matrix" : role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={filters.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full sm:w-[180px] h-14 rounded-xl bg-slate-50 border-transparent text-xs font-black uppercase tracking-widest text-slate-600 transition-all">
                        <SelectValue placeholder="Node Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-2">
                        {userStatuses.map((status) => (
                          <SelectItem key={status} value={status} className="rounded-xl mb-1 focus:bg-primary/5 focus:text-primary font-bold uppercase tracking-tighter text-[11px]">
                            {status === "All" ? "All States" : status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                      {[
                        { mode: 'grid', icon: Grid3X3 },
                        { mode: 'list', icon: List },
                      ].map((item) => (
                        <Button
                          key={item.mode}
                          variant={viewMode === (item.mode as any) ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => setViewMode(item.mode as any)}
                          className={`h-12 w-12 rounded-lg transition-all ${viewMode === item.mode
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                          <item.icon className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
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
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group border-slate-200 bg-white rounded-2xl">
                      <CardHeader className="pb-4 relative">
                        <div className="absolute top-0 left-0 w-full h-16 bg-slate-50 border-b border-slate-100 z-0" />
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="w-14 h-14 border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300 flex-shrink-0 ring-4 ring-slate-100">
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
                        <div className="pt-3 mt-auto border-t border-slate-100">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openViewModal(user)}
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 gap-1.5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 font-semibold text-xs transition-all"
                            >
                              <Eye className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">View</span>
                            </Button>
                            <Button
                              onClick={() => openEditModal(user)}
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 gap-1.5 rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 font-semibold text-xs transition-all"
                            >
                              <Edit className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Edit</span>
                            </Button>
                            {user.role !== "Admin" && (
                              <Button
                                onClick={() => openDeleteModal(user)}
                                size="sm"
                                variant="outline"
                                className="flex-1 h-9 gap-1.5 rounded-xl border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 font-semibold text-xs transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Delete</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-xl bg-white">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Registry Entity</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Permission Tier</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Operational State</TableHead>
                      <TableHead className="hidden md:table-cell font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                        Communication
                      </TableHead>
                      <TableHead className="hidden lg:table-cell font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                        Entry Vector
                      </TableHead>
                      <TableHead className="hidden xl:table-cell font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                        Last Signal
                      </TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Protocol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user._id}
                        className="transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-950 shadow-sm">
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
                          <div className="flex gap-1.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openViewModal(user)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Access intelligence</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openEditModal(user)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Calibrate entity</p>
                              </TooltipContent>
                            </Tooltip>
                            {user.role !== "Admin" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => openDeleteModal(user)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Decommission node</p>
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
              <Card className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Mapping index {startIndex + 1} &mdash;{" "}
                      {Math.min(endIndex, pagination.total)} of{" "}
                      {pagination.total} entities
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handlePageChange(Math.max(pagination.page - 1, 1))
                        }
                        disabled={pagination.page === 1}
                        className="rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-widest hover:bg-slate-100"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <div className="flex items-center gap-1 mx-2">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              pagination.page === page ? "default" : "ghost"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${pagination.page === page
                              ? 'shadow-lg shadow-primary/20 scale-110'
                              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handlePageChange(
                            Math.min(pagination.page + 1, totalPages),
                          )
                        }
                        disabled={pagination.page === totalPages}
                        className="rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-widest hover:bg-slate-100"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
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
          <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
            <DialogHeader className="p-8 pb-6 border-b sticky top-0 z-10 bg-white">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    Entity Intelligence Registry
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Comprehensive profile breakdown and account metadata for the selected node.
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getRoleBadgeStyles(selectedUser?.role || "")}>
                    {selectedUser && getRoleIcon(selectedUser.role)}
                    <span className="ml-1 uppercase font-black text-[10px] tracking-widest">{selectedUser?.role}</span>
                  </Badge>
                  <Badge variant="outline" className={getStatusBadgeStyles(selectedUser?.status || "")}>
                    <span className="uppercase font-black text-[10px] tracking-widest">{selectedUser?.status}</span>
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            {selectedUser && (
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Sidebar Info */}
                  <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-slate-50 rounded-3xl p-6 border-slate-100 shadow-sm text-center">
                      <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-xl mb-4 ring-8 ring-slate-100/50">
                        <AvatarImage src={getUserImage(selectedUser)} />
                        <AvatarFallback className="text-2xl font-black">{selectedUser.firstName[0]}{selectedUser.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-black text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-4">{selectedUser.email}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {selectedUser.verified && (
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">Verified Entity</Badge>
                        )}
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">ID: {selectedUser._id.slice(-6)}</Badge>
                      </div>
                    </Card>

                    <Card className="bg-white rounded-3xl p-6 border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <Activity className="w-3 h-3" /> System Logs
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">Join Protocol</span>
                          <span className="font-bold text-slate-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">Last Modulation</span>
                          <span className="font-bold text-slate-900">{new Date(selectedUser.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-8 space-y-8">
                    {/* Identity Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-slate-50 rounded-xl text-primary">
                          <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Identity Context</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication Uplink</p>
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Phone className="w-4 h-4 text-slate-400" /> {selectedUser.phone || "No signal"}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Origin (DOB)</p>
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Calendar className="w-4 h-4 text-slate-400" /> {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : "Not disclosed"}
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geographic Base (Address)</p>
                          <div className="flex items-start gap-2 text-slate-900 font-bold">
                            <MapPin className="w-4 h-4 text-slate-400 mt-1" /> {selectedUser.address || "Legacy address not found"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta Section */}
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-slate-50 rounded-xl text-primary">
                          <Settings className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Entity Intel</h3>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Biographical Fragment</p>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                          "{selectedUser.bio || "No biographical intelligence provided for this entity."}"
                        </p>
                      </div>
                    </div>

                    {/* Role-specific Parameters */}
                    {selectedUser.role === "Customer" && (
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100/50 dark:border-blue-900/20">
                        <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Consumer Analytics</h4>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Activity State</p>
                            <span className="text-lg font-black">{selectedUser.isActive ? "OPERATIONAL" : "IDLE"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedUser.role === "Influencer" && (
                      <div className="bg-fuchsia-50/50 dark:bg-fuchsia-900/10 p-6 rounded-3xl border border-fuchsia-100/50 dark:border-fuchsia-900/20">
                        <h4 className="text-sm font-black text-fuchsia-600 uppercase tracking-widest mb-4">Influencer Intelligence</h4>
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <p className="text-[10px] text-fuchsia-400 font-bold uppercase mb-1">Follower Scale</p>
                            <span className="text-lg font-black">{selectedUser.followers?.toLocaleString() || 0}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-fuchsia-400 font-bold uppercase mb-1">Primary Grid</p>
                            <span className="text-lg font-black">{selectedUser.platform || "N/A"}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-fuchsia-400 font-bold uppercase mb-1">Margin Rate</p>
                            <span className="text-lg font-black">{selectedUser.commissionRate || 0}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedUser.role === "Doctor" && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20">
                        <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-4">Medical Metadata</h4>
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Clinical Age</p>
                            <span className="text-lg font-black">{selectedUser.experience || 0}y</span>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Assigned Facility</p>
                            <span className="text-lg font-black truncate block">{selectedUser.hospital || "Independent Agent"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="p-8 bg-white border-t sticky bottom-0 z-10">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
                className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 hover:bg-slate-50"
              >
                Close Registry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="modal-header">
              <DialogHeader>
                <DialogTitle>Edit User Profile</DialogTitle>
                <DialogDescription>Update user account details and permissions</DialogDescription>
              </DialogHeader>
            </div>

            {selectedUser && (
              <div className="modal-container space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Avatar className="w-24 h-24 shadow-xl ring-4 ring-white">
                    <AvatarImage src={selectedUser.imageUrl || "/placeholder-user.svg"} />
                    <AvatarFallback className="text-2xl font-bold">{selectedUser.firstName[0]}{selectedUser.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <button onClick={handleAvatarUpload} className="btn-secondary h-10 px-4 text-sm font-semibold">
                      <Upload className="w-4 h-4 mr-2" /> Upload Photo
                    </button>
                    <button onClick={removeAvatar} className="btn-secondary h-10 px-4 text-sm font-semibold text-rose-500 hover:text-rose-600">
                      Remove
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label form-label-required">First Name</label>
                    <input className="form-input" value={selectedUser.firstName}
                      onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">Last Name</label>
                    <input className="form-input" value={selectedUser.lastName}
                      onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">Email Address</label>
                    <input className="form-input" type="email" value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={selectedUser.phone}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">Role</label>
                    <Select value={selectedUser.role} onValueChange={(value: "Admin" | "Doctor" | "Influencer" | "Customer") => setSelectedUser({ ...selectedUser, role: value })}>
                      <SelectTrigger className="form-select-trigger"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Administrator</SelectItem>
                        <SelectItem value="Doctor">Medical Professional</SelectItem>
                        <SelectItem value="Influencer">Influencer</SelectItem>
                        <SelectItem value="Customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">Status</label>
                    <Select value={selectedUser.status} onValueChange={(value: "Active" | "Inactive") => setSelectedUser({ ...selectedUser, status: value })}>
                      <SelectTrigger className="form-select-trigger"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active (Live)</SelectItem>
                        <SelectItem value="Inactive">Inactive (Disabled)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-field form-field-full">
                    <label className="form-label">Bio / Professional Notes</label>
                    <textarea className="form-textarea" rows={3}
                      value={selectedUser.bio || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, bio: e.target.value })}
                      placeholder="Enter a brief background or notes..." />
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={modalLoading}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateUser} disabled={modalLoading}>
                {modalLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...</> : <><Edit className="w-5 h-5 mr-2" /> Save Changes</>}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add User Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="modal-header">
              <DialogHeader>
                <DialogTitle>Onboard New User</DialogTitle>
                <DialogDescription>Create a new account with role-based access control</DialogDescription>
              </DialogHeader>
            </div>

            <div className="modal-container space-y-8">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-4 py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Avatar className="w-24 h-24 shadow-xl bg-white ring-4 ring-white">
                  <AvatarImage src={newUser.imageUrl || "/placeholder-user.svg"} />
                  <AvatarFallback className="text-2xl font-bold">?</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <button onClick={handleNewUserAvatarUpload} className="btn-secondary h-10 px-4 text-sm font-semibold">
                    <Upload className="w-4 h-4 mr-2" /> Upload Photo
                  </button>
                  <button onClick={removeNewUserAvatar} className="btn-secondary h-10 px-4 text-sm font-semibold text-rose-500 hover:text-rose-600">
                    Remove
                  </button>
                </div>
                <input ref={newUserFileInputRef} type="file" accept="image/*" onChange={handleNewUserFileSelect} className="hidden" />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label form-label-required">First Name</label>
                  <input className="form-input" placeholder="e.g. John"
                    value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label form-label-required">Last Name</label>
                  <input className="form-input" placeholder="e.g. Doe"
                    value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label form-label-required">Email Address</label>
                  <input className="form-input" type="email" placeholder="john.doe@company.com"
                    value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+1 (555) 000-0000"
                    value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label form-label-required">Role Assignment</label>
                  <Select value={newUser.role} onValueChange={(value: "Admin" | "Doctor" | "Influencer" | "Customer") => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger className="form-select-trigger"><SelectValue placeholder="Select access level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Administrator</SelectItem>
                      <SelectItem value="Doctor">Medical Professional</SelectItem>
                      <SelectItem value="Influencer">Influencer</SelectItem>
                      <SelectItem value="Customer">Standard User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-field">
                  <label className="form-label form-label-required">Account Status</label>
                  <Select value={newUser.status} onValueChange={(value: "Active" | "Inactive") => setNewUser({ ...newUser, status: value })}>
                    <SelectTrigger className="form-select-trigger"><SelectValue placeholder="Select initial state" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active (Instant Access)</SelectItem>
                      <SelectItem value="Inactive">Inactive (Hold Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-field form-field-full">
                  <label className="form-label">Internal Biography / Notes</label>
                  <textarea className="form-textarea" rows={3}
                    placeholder="Brief professional summary or internal notes..."
                    value={newUser.bio} onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)} disabled={modalLoading}>Cancel</button>
              <button className="btn-primary" onClick={handleAddUser} disabled={modalLoading}>
                {modalLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating...</> : <><UserPlus className="w-5 h-5 mr-2" /> Create Account</>}
              </button>
            </div>
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

export default function UsersPage() {
  return (
    <React.Suspense fallback={<Loader variant="skeleton" message="Loading users..." />}>
      <UsersPageContent />
    </React.Suspense>
  );
}
