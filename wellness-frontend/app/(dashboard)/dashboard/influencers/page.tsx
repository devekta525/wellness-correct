"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

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

  useEffect(() => {
    if (searchParams?.get("action") === "add") {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

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
              <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Megaphone className="w-6 h-6 text-primary" />
                      </div>
                      Influencer Procurement
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      Onboard new social capital nodes into the Wellness Fuel growth network.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-180px)]">
                  {/* Avatar Section - Top Center */}
                  <div className="flex flex-col items-center space-y-4 py-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Visualizer</Label>
                    <div className="relative group">
                      <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-2xl transition-all duration-500 group-hover:scale-105">
                        <AvatarImage src="/placeholder-influencer.svg" />
                        <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">INF</AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-1 right-1 p-2.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900 shadow-sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Identity
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] text-destructive hover:bg-red-50 dark:hover:bg-red-950/30">
                        Purge
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="addName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Designation</Label>
                      <Input id="addName" placeholder="Full Name" className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="addEmail" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Email Node</Label>
                      <div className="relative">
                        <Input
                          id="addEmail"
                          type="email"
                          placeholder="influencer@wellness.com"
                          className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="addPhone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Contact Vector</Label>
                      <Input id="addPhone" placeholder="+91 XXXXX XXXXX" className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="addPlatform" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Network Focus</Label>
                      <Select>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 shadow-sm font-bold">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Instagram" className="rounded-lg font-bold">Instagram</SelectItem>
                          <SelectItem value="Youtube" className="rounded-lg font-bold">YouTube</SelectItem>
                          <SelectItem value="Twitter" className="rounded-lg font-bold">Twitter</SelectItem>
                          <SelectItem value="Facebook" className="rounded-lg font-bold">Facebook</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="addFollowers" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Relative Reach Index</Label>
                      <Input
                        id="addFollowers"
                        type="number"
                        placeholder="Total Followers"
                        className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="addCommission" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Remuneration Rate (%)</Label>
                      <Input id="addCommission" type="number" placeholder="Percentage" className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="addCategory" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Niche Classification</Label>
                      <Input id="addCategory" placeholder="e.g. Health & Wellness" className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="addSocialLinks" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Platform Identity Link</Label>
                      <Input
                        id="addSocialLinks"
                        placeholder="URL Handle"
                        className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] border-slate-200 hover:bg-slate-100 dark:border-slate-800"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Abort Onboarding
                  </Button>
                  <Button
                    onClick={() => handleAddInfluencer({})}
                    disabled={modalLoading}
                    className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Finalize Procurement"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Influencer Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      Influence Matrix Intelligence
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      Calibrate social engagement parameters and monitor conversion trajectory.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                {selectedInfluencer && (
                  <div className="overflow-y-auto max-h-[70vh]">
                    <div className="p-8">
                      {/* Identity Header */}
                      <div className="mb-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Megaphone className="w-32 h-32 text-primary" />
                        </div>

                        <div className="relative group z-10">
                          <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-2xl transition-all duration-500 group-hover:scale-105">
                            <AvatarImage
                              src={selectedInfluencer.imageUrl || "/placeholder-influencer.svg"}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                              {selectedInfluencer.firstName[0]}{selectedInfluencer.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <button className="absolute bottom-1 right-1 p-2.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110">
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2 z-10">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                              {selectedInfluencer.firstName} {selectedInfluencer.lastName}
                            </h3>
                            <Badge variant="outline" className="w-fit mx-auto md:mx-0 font-black uppercase tracking-widest text-[10px] px-3 py-1 bg-white dark:bg-slate-900 shadow-sm border-slate-200 text-primary">
                              {selectedInfluencer.platform}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.1em]">{selectedInfluencer.category}</p>

                          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md border-slate-200">
                              <Upload className="w-3.5 h-3.5 mr-2" />
                              Update Identity
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl">
                              Purge Avatar
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 px-8 py-2 border-l border-slate-200 dark:border-slate-800 hidden lg:grid z-10">
                          <div className="text-center space-y-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Followers</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{((selectedInfluencer.followers ?? 0) / 1000).toFixed(1)}K</p>
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Commission</p>
                            <div className="flex items-center justify-center gap-1.5">
                              <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{selectedInfluencer.commissionRate}%</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Tabs defaultValue="details" className="w-full">
                        <TabsList className="flex w-full overflow-x-auto h-auto p-1.5 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl mb-8 no-scrollbar border shadow-inner">
                          <TabsTrigger value="details" className="flex-1 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold gap-2 text-xs uppercase tracking-widest">
                            Identity Analytics
                          </TabsTrigger>
                          <TabsTrigger value="performance" className="flex-1 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold gap-2 text-xs uppercase tracking-widest">
                            Reach Data
                          </TabsTrigger>
                          <TabsTrigger value="campaigns" className="flex-1 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold gap-2 text-xs uppercase tracking-widest">
                            Collab Log
                          </TabsTrigger>
                          <TabsTrigger value="notes" className="flex-1 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold gap-2 text-xs uppercase tracking-widest">
                            Internal Intel
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Designation</Label>
                              <Input
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                defaultValue={`${selectedInfluencer.firstName} ${selectedInfluencer.lastName}`}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Email Node</Label>
                              <Input
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                defaultValue={selectedInfluencer.email}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct Contact Vector</Label>
                              <Input
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                defaultValue={selectedInfluencer.phone}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Network Focus</Label>
                              <Select defaultValue={selectedInfluencer.platform}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 shadow-sm font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="Instagram" className="rounded-lg font-bold">Instagram</SelectItem>
                                  <SelectItem value="Youtube" className="rounded-lg font-bold">YouTube</SelectItem>
                                  <SelectItem value="Twitter" className="rounded-lg font-bold">Twitter</SelectItem>
                                  <SelectItem value="Facebook" className="rounded-lg font-bold">Facebook</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Relative Reach Index</Label>
                              <Input
                                type="number"
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                defaultValue={selectedInfluencer.followers}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Remuneration Rate (%)</Label>
                              <Input
                                type="number"
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                defaultValue={selectedInfluencer.commissionRate}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Niche Classification</Label>
                              <Input
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                defaultValue={selectedInfluencer.category}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Platform Identity Link</Label>
                              <Input
                                className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                defaultValue={selectedInfluencer.socialMediaLinks}
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="performance" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl mb-6 transform transition-transform hover:rotate-12 border border-slate-100">
                              <TrendingUp className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
                              Performance Analytics Matrix
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm px-8 text-sm leading-relaxed font-bold">
                              Comprehensive metrics across engagement depth, conversion rates, and ROI trajectory for this node.
                            </p>
                            <Button className="mt-8 h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">
                              Access Deep Analytics
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="campaigns" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl mb-6 transform transition-transform hover:-rotate-12 border border-slate-100">
                              <Calendar className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
                              Collaboration Registry
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm px-8 text-sm leading-relaxed font-bold">
                              Historical campaign interactions, active project protocols, and future activation schedules.
                            </p>
                            <Button variant="outline" className="mt-8 h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] border-slate-200">
                              Sync Registry
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="notes" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Internal Intelligence Node</Label>
                            <Textarea
                              placeholder="Document private performance metrics, affiliation observations, or restrictive negotiation parameters..."
                              className="min-h-[200px] rounded-3xl border-slate-200 p-8 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner resize-none text-sm font-bold leading-relaxed"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] border-slate-200 hover:bg-slate-100 dark:border-slate-800"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Abort Interaction
                  </Button>
                  <Button
                    onClick={handleUpdateInfluencer}
                    disabled={modalLoading}
                    className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      "Commit Updates"
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
