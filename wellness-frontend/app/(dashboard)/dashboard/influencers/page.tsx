"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Megaphone,
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
  Instagram,
  Youtube,
  Twitter,
  Facebook,
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
import Loader from "@/components/common/dashboard/Loader";
import Error from "@/components/common/dashboard/Error";
import NoData from "@/components/common/dashboard/NoData";
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

// Influencer type definition
type Influencer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  imageUrl: string;
  status: string;
  platform: string;
  followers: number;
  category: string;
  commissionRate: number;
  joinDate: string;
  location: string;
  socialMediaLinks: string;
  availability: string;
  languages: string[];
  tags: string[];
  note: string;
};

const InfluencersPage = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsersData);
  const isLoading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);
  const pagination = useAppSelector(selectUsersPagination);

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedInfluencer, setSelectedInfluencer] = useState<UserType | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch influencers data on component mount
  useEffect(() => {
    dispatch(setFilters({ role: "Influencer" }));
    dispatch(fetchUsersData());
  }, [dispatch]);

  // Convert users to influencers format and filter
  const influencers: Influencer[] = users
    .filter((user) => user.role === "Influencer")
    .map((user) => ({
      id: parseInt(user._id.slice(-8), 16) || Math.random(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      imageUrl: "",
      status: user.status.toLowerCase(),
      platform: user.platform || "Instagram",
      followers: user.followers || 0,
      category: user.category || "Health & Wellness",
      commissionRate: user.commissionRate || 10,
      joinDate: user.createdAt,
      location: user.address || "Not specified",
      socialMediaLinks: user.socialMediaLinks || "",
      availability: user.availability || "Mon-Fri 9AM-5PM",
      languages: user.language || ["English"],
      tags: user.category ? [user.category] : [],
      note: user.note || "",
    }));

  // Filter and sort influencers
  const filteredInfluencers = influencers
    .filter((influencer) => {
      const matchesSearch =
        influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.phone.includes(searchTerm) ||
        influencer.platform.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || influencer.status === statusFilter;
      const matchesPlatform =
        platformFilter === "all" || influencer.platform === platformFilter;
      return matchesSearch && matchesStatus && matchesPlatform;
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
  const paginatedInfluencers = filteredInfluencers.slice(
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

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return Instagram;
      case "youtube":
        return Youtube;
      case "twitter":
        return Twitter;
      case "facebook":
        return Facebook;
      default:
        return Megaphone;
    }
  };

  const handleEditInfluencer = (influencer: Influencer) => {
    const user = users.find(
      (u) =>
        u.role === "Influencer" &&
        `${u.firstName} ${u.lastName}` === influencer.name,
    );
    if (user) {
      setSelectedInfluencer(user);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteInfluencer = async (influencerId: number) => {
    setModalLoading(true);
    try {
      const user = users.find(
        (u) =>
          u.role === "Influencer" &&
          parseInt(u._id.slice(-8), 16) === influencerId,
      );
      if (user) {
        const success = (await dispatch(
          deleteUser(user._id),
        )) as unknown as boolean;
        if (success) {
          dispatch(fetchUsersData());
        }
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddInfluencer = async (influencerData: Partial<Influencer>) => {
    setModalLoading(true);
    try {
      setIsAddModalOpen(false);
      dispatch(fetchUsersData());
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateInfluencer = async () => {
    setModalLoading(true);
    try {
      if (selectedInfluencer) {
        const success = (await dispatch(
          updateUser(selectedInfluencer._id, selectedInfluencer),
        )) as unknown as boolean;
        if (success) {
          setIsEditModalOpen(false);
          dispatch(fetchUsersData());
        }
      }
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading influencers" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Influencers
                </h1>
                <p className="text-muted-foreground">
                  Manage your social media influencers and partners
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
                  Add Influencer
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
                        Total Influencers
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {influencers.length}
                      </p>
                      <p className="text-sm text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12% from last month
                      </p>
                    </div>
                    <Megaphone className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Influencers
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {
                          influencers.filter((i) => i.status === "active")
                            .length
                        }
                      </p>
                      <p className="text-sm text-blue-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {Math.round(
                          (influencers.filter((i) => i.status === "active")
                            .length /
                            influencers.length) *
                            100,
                        ) || 0}
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
                      <p className="text-sm text-muted-foreground">Platforms</p>
                      <p className="text-2xl font-bold text-foreground">
                        {new Set(influencers.map((i) => i.platform)).size}
                      </p>
                      <p className="text-sm text-purple-600 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Social platforms
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
                        Avg. Commission
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {influencers.length > 0
                          ? (
                              influencers.reduce(
                                (sum, i) => sum + i.commissionRate,
                                0,
                              ) / influencers.length
                            ).toFixed(1)
                          : "0"}
                        %
                      </p>
                      <p className="text-sm text-orange-600 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Commission rate
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
                        placeholder="Search influencers by name, email, phone, or platform..."
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
                      value={platformFilter}
                      onValueChange={setPlatformFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Youtube">YouTube</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="platform">Platform</SelectItem>
                        <SelectItem value="followers">Followers</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="commissionRate">
                          Commission
                        </SelectItem>
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
              <Loader variant="skeleton" message="Loading influencers..." />
            ) : filteredInfluencers.length === 0 ? (
              <NoData
                message="No influencers found"
                description="Get started by adding your first influencer"
                icon={
                  <Megaphone className="w-full h-full text-muted-foreground/60" />
                }
                action={{
                  label: "Add Influencer",
                  onClick: () => setIsAddModalOpen(true),
                }}
                size="lg"
              />
            ) : (
              <>
                {viewMode === "table" && (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Influencer</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Followers</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Commission</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedInfluencers.map((influencer) => {
                            const PlatformIcon = getPlatformIcon(
                              influencer.platform,
                            );
                            return (
                              <TableRow key={influencer.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                      <AvatarImage src={influencer.imageUrl} />
                                      <AvatarFallback>
                                        {influencer.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">
                                        {influencer.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {influencer.location}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                                    <span>{influencer.platform}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={getStatusColor(influencer.status)}
                                  >
                                    {influencer.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    {influencer.followers.toLocaleString()}
                                  </div>
                                </TableCell>
                                <TableCell>{influencer.category}</TableCell>
                                <TableCell>
                                  <span className="font-medium">
                                    {influencer.commissionRate}%
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleEditInfluencer(influencer)
                                          }
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        View Details
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleEditInfluencer(influencer)
                                          }
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Edit Influencer
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteInfluencer(
                                              influencer.id,
                                            )
                                          }
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Delete Influencer
                                      </TooltipContent>
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
                )}

                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedInfluencers.map((influencer) => {
                      const PlatformIcon = getPlatformIcon(influencer.platform);
                      return (
                        <Card
                          key={influencer.id}
                          className="flex flex-col h-full"
                        >
                          <CardContent className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={influencer.imageUrl} />
                                <AvatarFallback>
                                  {influencer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold">
                                  {influencer.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {influencer.location}
                                </p>
                              </div>
                              <Badge
                                variant={getStatusColor(influencer.status)}
                                className="text-xs"
                              >
                                {influencer.status}
                              </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                                {influencer.platform}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {influencer.followers.toLocaleString()}{" "}
                                followers
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                {influencer.location}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Star className="w-4 h-4 text-orange-500" />
                                {influencer.commissionRate}% commission
                              </div>
                            </div>

                            <div className="mt-auto">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() =>
                                    handleEditInfluencer(influencer)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() =>
                                    handleEditInfluencer(influencer)
                                  }
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
                {!isLoading &&
                  filteredInfluencers.length > 0 &&
                  totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(
                          startIndex + pagination.limit,
                          filteredInfluencers.length,
                        )}{" "}
                        of {filteredInfluencers.length} influencers
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

            {/* Add Influencer Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Influencer</DialogTitle>
                  <DialogDescription>
                    Register a new social media influencer
                  </DialogDescription>
                </DialogHeader>
                {/* Avatar Section - Top Center */}
                <div className="flex flex-col items-center space-y-4 py-4">
                  <Label className="text-lg font-medium">Profile Picture</Label>
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/placeholder-influencer.svg" />
                    <AvatarFallback className="text-xl">INF</AvatarFallback>
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
                    <Input id="addName" placeholder="Influencer Name" />
                  </div>
                  <div>
                    <Label htmlFor="addEmail">Email</Label>
                    <Input
                      id="addEmail"
                      type="email"
                      placeholder="influencer@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addPhone">Phone</Label>
                    <Input id="addPhone" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <Label htmlFor="addPlatform">Platform</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Youtube">YouTube</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="addFollowers">Followers</Label>
                    <Input
                      id="addFollowers"
                      type="number"
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addCommission">Commission Rate (%)</Label>
                    <Input id="addCommission" type="number" placeholder="10" />
                  </div>
                  <div>
                    <Label htmlFor="addCategory">Category</Label>
                    <Input id="addCategory" placeholder="Health & Wellness" />
                  </div>
                  <div>
                    <Label htmlFor="addSocialLinks">Social Media Links</Label>
                    <Input
                      id="addSocialLinks"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleAddInfluencer({})}
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Influencer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Influencer Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Influencer Details</DialogTitle>
                  <DialogDescription>
                    View and edit influencer information
                  </DialogDescription>
                </DialogHeader>
                {selectedInfluencer && (
                  <>
                    {/* Avatar Section - Top Center */}
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <Label className="text-lg font-medium">
                        Profile Picture
                      </Label>
                      <Avatar className="w-24 h-24">
                        <AvatarImage
                          src={
                            selectedInfluencer.imageUrl ||
                            "/placeholder-influencer.svg"
                          }
                        />
                        <AvatarFallback className="text-xl">
                          {selectedInfluencer.firstName[0]}
                          {selectedInfluencer.lastName[0]}
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
                        <TabsTrigger value="performance">
                          Performance
                        </TabsTrigger>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editName">Full Name</Label>
                            <Input
                              id="editName"
                              defaultValue={`${selectedInfluencer.firstName} ${selectedInfluencer.lastName}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editEmail">Email</Label>
                            <Input
                              id="editEmail"
                              type="email"
                              defaultValue={selectedInfluencer.email}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editPhone">Phone</Label>
                            <Input
                              id="editPhone"
                              defaultValue={selectedInfluencer.phone}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editPlatform">Platform</Label>
                            <Select defaultValue={selectedInfluencer.platform}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Instagram">
                                  Instagram
                                </SelectItem>
                                <SelectItem value="Youtube">YouTube</SelectItem>
                                <SelectItem value="Twitter">Twitter</SelectItem>
                                <SelectItem value="Facebook">
                                  Facebook
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="editFollowers">Followers</Label>
                            <Input
                              id="editFollowers"
                              type="number"
                              defaultValue={selectedInfluencer.followers}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editCommission">
                              Commission Rate
                            </Label>
                            <Input
                              id="editCommission"
                              type="number"
                              defaultValue={selectedInfluencer.commissionRate}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editCategory">Category</Label>
                            <Input
                              id="editCategory"
                              defaultValue={selectedInfluencer.category}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editLinks">
                              Social Media Links
                            </Label>
                            <Input
                              id="editLinks"
                              defaultValue={selectedInfluencer.socialMediaLinks}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="performance" className="space-y-4">
                        <div className="text-center py-8">
                          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Performance Analytics
                          </h3>
                          <p className="text-muted-foreground">
                            Performance metrics and analytics will be displayed
                            here
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="campaigns" className="space-y-4">
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Campaign History
                          </h3>
                          <p className="text-muted-foreground">
                            Campaign history and collaborations will be
                            displayed here
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="notes" className="space-y-4">
                        <div>
                          <Label htmlFor="editNotes">Notes</Label>
                          <Textarea
                            id="editNotes"
                            placeholder="Add notes about this influencer"
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
                  <Button
                    onClick={handleUpdateInfluencer}
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Influencer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

// Export as dynamic component to prevent prerendering issues
export default dynamic(() => Promise.resolve(InfluencersPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  ),
});
