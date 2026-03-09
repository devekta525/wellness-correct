"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Package,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  Upload,
  X,
  FileText,
  Globe,
  Settings,
  Activity,
  Link,
} from "lucide-react";
import Loader from "@/components/common/dashboard/Loader";
import Error from "@/components/common/dashboard/Error";
import NoData from "@/components/common/dashboard/NoData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  fetchCategoriesData,
  setFilters,
  selectCategoriesData,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCategoriesFilters,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "@/lib/redux/features/categorySlice";

const categoryStatuses = ["All", "Active", "Inactive"];

const CategoriesPage = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategoriesData);
  const isLoading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  const filters = useAppSelector(selectCategoriesFilters);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [modalLoading, setModalLoading] = useState(false);

  // File states for actual file objects
  const [newCategoryImageFile, setNewCategoryImageFile] = useState<File | null>(
    null,
  );
  const [editCategoryImageFile, setEditCategoryImageFile] =
    useState<File | null>(null);

  // New category state
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    status: "Active",
    metaTitle: "",
    metaDescription: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCategoriesData());
  }, [dispatch]);

  // Filter categories using Redux filters
  const filteredCategories = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];

    return categories.filter((category) => {
      const matchesSearch =
        filters.name === "" ||
        category.name
          .toLowerCase()
          .includes(filters.name?.toLowerCase() || "") ||
        category.description
          .toLowerCase()
          .includes(filters.name?.toLowerCase() || "") ||
        category.slug.toLowerCase().includes(filters.name?.toLowerCase() || "");

      const matchesStatus =
        filters.status === "" ||
        category.status?.toLowerCase() === filters.status?.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [categories, filters]);

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ name: value || "" }));
  };

  const handleStatusChange = (value: string) => {
    dispatch(setFilters({ status: value === "All" ? "" : value }));
  };

  const handleAddCategory = async () => {
    setModalLoading(true);
    try {
      const formData = new FormData();
      // Send with backend expected field names
      formData.append("name", newCategory.name);
      formData.append("slug", newCategory.slug);
      formData.append("description", newCategory.description);

      // Send file if uploaded, otherwise send URL string
      if (newCategoryImageFile) {
        formData.append("imageUrl", newCategoryImageFile);
      } else if (newCategory.imageUrl) {
        formData.append("imageUrl", newCategory.imageUrl);
      }

      formData.append("status", newCategory.status || "Active");
      formData.append("metaTitle", newCategory.metaTitle || "");
      formData.append("metaDescription", newCategory.metaDescription || "");
      formData.append("parentCategory", ""); // Keep for hierarchical support

      const success = await dispatch(createCategory(formData));
      if (success) {
        setShowAddModal(false);
        setNewCategory({
          name: "",
          slug: "",
          description: "",
          imageUrl: "",
          status: "Active",
          metaTitle: "",
          metaDescription: "",
        });
        setNewCategoryImageFile(null);
        // Refetch data to get updated list
        dispatch(fetchCategoriesData());
      }
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditCategory = async () => {
    setModalLoading(true);
    try {
      if (!selectedCategory) return;

      const formData = new FormData();
      // Send with backend expected field names
      formData.append("name", selectedCategory.name);
      formData.append("description", selectedCategory.description);

      // Send file if uploaded, otherwise send URL string
      if (editCategoryImageFile) {
        formData.append("imageUrl", editCategoryImageFile);
      } else if (selectedCategory.imageUrl) {
        formData.append("imageUrl", selectedCategory.imageUrl);
      }

      formData.append("status", selectedCategory.status || "Active");
      formData.append("metaTitle", selectedCategory.metaTitle || "");
      formData.append(
        "metaDescription",
        selectedCategory.metaDescription || "",
      );
      formData.append("parentCategory", ""); // Keep for hierarchical support

      const success = await dispatch(
        updateCategory(selectedCategory._id, formData),
      );
      if (success) {
        setShowEditModal(false);
        setSelectedCategory(null);
        setEditCategoryImageFile(null);
        // Refetch data to get updated list
        dispatch(fetchCategoriesData());
      }
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    setModalLoading(true);
    try {
      if (!selectedCategory) return;

      const success = await dispatch(deleteCategory(selectedCategory._id));
      if (success) {
        setShowDeleteModal(false);
        setSelectedCategory(null);
        // Refetch data to get updated list
        dispatch(fetchCategoriesData());
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory({
      ...category,
    });
    setEditCategoryImageFile(null); // Clear previous file selection
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading categories" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Product Categories
                </h1>
                <p className="text-muted-foreground">
                  Manage product categories and organization
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new product category</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Categories
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {categories?.length || 0}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Categories
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {
                          (categories || []).filter(
                            (c) => c.status?.toLowerCase() === "active",
                          ).length
                        }
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search categories..."
                      value={filters.name?.toLowerCase() || ""}
                      onChange={(e) => handleSearchChange(e.target.value || "")}
                      className="pl-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select
                    value={filters.status || "All"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "All"
                            ? "All Statuses"
                            : status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("list")}
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
              </CardContent>
            </Card>

            {/* Content */}
            {isLoading ? (
              <Loader variant="skeleton" message="Loading categories..." />
            ) : filteredCategories.length === 0 ? (
              <NoData
                message="No categories found"
                description="Get started by creating your first category"
                icon={
                  <Package className="w-full h-full text-muted-foreground/60" />
                }
                action={{
                  label: "Add Category",
                  onClick: () => setShowAddModal(true),
                }}
                size="lg"
              />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <Card
                    key={category._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                  >
                    <div className="relative h-48">
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={
                            getStatusColor(category.status) as
                            | "default"
                            | "secondary"
                            | "destructive"
                            | "outline"
                          }
                        >
                          {category.status.charAt(0).toUpperCase() +
                            category.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-1 flex flex-col">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Slug:
                            </span>
                            <span className="text-sm font-medium">
                              {category.slug}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 mt-auto">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => openEditModal(category)}
                                className="flex-1 gap-2"
                                size="sm"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit category</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => openDeleteModal(category)}
                                className="flex-1 gap-2 text-destructive border border-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
                                size="sm"
                                variant="ghost"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete category</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={category.imageUrl}
                                alt={category.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {category.name}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {category.slug}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              getStatusColor(category.status) as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                            }
                          >
                            {category.status.charAt(0).toUpperCase() +
                              category.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(category.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openEditModal(category)}
                                  variant="default"
                                  size="icon"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit category</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openDeleteModal(category)}
                                  variant="default"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete category</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </>
        )}

        {/* Add Category Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
            <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  Taxonomy Definition
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  Initialize a new product classification node with optimized routing mapping.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[75vh]">
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Left Column: Core Info */}
                  <div className="space-y-12">
                    {/* Section 1: Basic Information */}
                    <section className="space-y-8">
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Identity Context</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="add-category-name" className="text-xs font-black text-slate-400 uppercase tracking-widest">Classification Label</Label>
                          <Input
                            id="add-category-name"
                            className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                            placeholder="e.g. Wellness Supplements"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="add-category-slug" className="text-xs font-black text-slate-400 uppercase tracking-widest">Routing Identifier (Slug)</Label>
                          <div className="relative">
                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="add-category-slug"
                              className="h-12 pl-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                              placeholder="wellness-supplements"
                              value={newCategory.slug}
                              onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="add-category-description" className="text-xs font-black text-slate-400 uppercase tracking-widest">Abstract Summary</Label>
                          <Textarea
                            id="add-category-description"
                            className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner focus:ring-primary/20 resize-none p-5 text-sm leading-relaxed"
                            placeholder="Briefly describe what products belong in this category..."
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Section 2: Media */}
                    <section className="space-y-8">
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Visual Correlation</h3>
                      </div>
                      <div className="space-y-4">
                        {newCategory.imageUrl ? (
                          <div className="space-y-4">
                            <div className="relative group aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-lg">
                              <Image
                                src={newCategory.imageUrl}
                                alt="Preview"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="rounded-xl px-5 h-10 font-black uppercase tracking-widest text-[10px]"
                                  onClick={() => {
                                    setNewCategory({ ...newCategory, imageUrl: "" });
                                    setNewCategoryImageFile(null);
                                  }}
                                >
                                  <X className="w-4 h-4 mr-2" /> De-Link Asset
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col items-center justify-center p-14 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Upload className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                              </div>
                              <p className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-2">Ingest Visual Asset</p>
                              <p className="text-[10px] text-slate-500 text-center mb-8 uppercase tracking-tighter">High-Resolution taxonomy illustration required</p>
                              <div className="flex gap-4">
                                <Button
                                  variant="outline"
                                  className="h-11 px-6 rounded-xl bg-white dark:bg-slate-950 font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all"
                                  onClick={() => document.getElementById('category-upload-add')?.click()}
                                >
                                  Local File
                                </Button>
                                <Button
                                  variant="secondary"
                                  className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]"
                                  onClick={() => {
                                    const url = prompt("Enter category image URL:");
                                    if (url?.trim()) setNewCategory({ ...newCategory, imageUrl: url.trim() });
                                  }}
                                >
                                  Cloud URL
                                </Button>
                              </div>
                              <input
                                id="category-upload-add"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setNewCategoryImageFile(file);
                                    setNewCategory({ ...newCategory, imageUrl: URL.createObjectURL(file) });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Settings & SEO */}
                  <div className="space-y-12">
                    {/* Section 3: Status & Hierarchy */}
                    <section className="space-y-8">
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                          <Settings className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Operational Logic</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="add-category-status" className="text-xs font-black text-slate-400 uppercase tracking-widest">Visibility Lifecycle</Label>
                          <Select
                            value={newCategory.status || "Active"}
                            onValueChange={(val) => setNewCategory({ ...newCategory, status: val })}
                          >
                            <SelectTrigger id="add-category-status" className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">
                                <div className="flex items-center gap-2 font-bold text-emerald-600">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Deployment
                                </div>
                              </SelectItem>
                              <SelectItem value="Inactive">
                                <div className="flex items-center gap-2 font-bold text-slate-400">
                                  <div className="w-2 h-2 rounded-full bg-slate-300" /> Statically Halted
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </section>

                    {/* Section 4: SEO Optimizations */}
                    <section className="space-y-8">
                      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                          <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">SEO Calibration</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="add-category-meta-title" className="text-xs font-black text-slate-400 uppercase tracking-widest">Meta Descriptor Title</Label>
                          <Input
                            id="add-category-meta-title"
                            className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                            placeholder="Highly relevant SEO title..."
                            value={newCategory.metaTitle}
                            onChange={(e) => setNewCategory({ ...newCategory, metaTitle: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="add-category-meta-description" className="text-xs font-black text-slate-400 uppercase tracking-widest">Indexable Crawler Context</Label>
                          <Textarea
                            id="add-category-meta-description"
                            className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner focus:ring-primary/20 resize-none p-5 text-sm"
                            placeholder="The description users see on search engines..."
                            value={newCategory.metaDescription}
                            onChange={(e) => setNewCategory({ ...newCategory, metaDescription: e.target.value })}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Audit Trail Preview */}
                    <section className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Activity className="w-20 h-20 text-primary" />
                      </div>

                      <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 font-black uppercase text-xs tracking-widest mb-6 relative z-10">
                        <Activity className="w-5 h-5 text-primary" />
                        System Validation
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Uniform Resource String</p>
                          <p className="text-xs font-mono font-bold text-primary truncate">
                            /{newCategory.slug || 'awaiting-input'}
                          </p>
                        </div>
                        <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Protocol Sync</p>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">
                            DRAFT_INITIALIZING
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 gap-3">
              <Button
                variant="outline"
                className="h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-[11px] border-slate-200 dark:border-slate-800"
                onClick={() => setShowAddModal(false)}
              >
                Discard Proposal
              </Button>
              <Button
                onClick={handleAddCategory}
                disabled={modalLoading}
                className="h-11 px-10 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Committing...
                  </>
                ) : (
                  "Authorize Deployment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
            <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Edit className="w-6 h-6 text-primary" />
                  </div>
                  Taxonomy Calibration
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  Refine classification parameters, visibility protocols, and indexing metadata.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[75vh]">
              {selectedCategory && (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Core Info */}
                    <div className="space-y-12">
                      {/* Section 1: Basic Information */}
                      <section className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                            <Package className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Identity Context</h3>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="edit-category-name" className="text-xs font-black text-slate-400 uppercase tracking-widest">Classification Label</Label>
                            <Input
                              id="edit-category-name"
                              className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                              value={selectedCategory.name}
                              onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="edit-category-slug" className="text-xs font-black text-slate-400 uppercase tracking-widest">Routing Identifier (Slug)</Label>
                            <div className="relative">
                              <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="edit-category-slug"
                                className="h-12 pl-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                                value={selectedCategory.slug}
                                onChange={(e) => setSelectedCategory({ ...selectedCategory, slug: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="edit-category-description" className="text-xs font-black text-slate-400 uppercase tracking-widest">Abstract Summary</Label>
                            <Textarea
                              id="edit-category-description"
                              className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner focus:ring-primary/20 resize-none p-5 text-sm leading-relaxed"
                              value={selectedCategory.description}
                              onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                            />
                          </div>
                        </div>
                      </section>

                      {/* Section 2: Media */}
                      <section className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Visual Correlation</h3>
                        </div>
                        <div className="space-y-4">
                          {selectedCategory.imageUrl ? (
                            <div className="space-y-4">
                              <div className="relative group aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-lg">
                                <Image
                                  src={selectedCategory.imageUrl}
                                  alt="Preview"
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-xl px-5 h-10 font-black uppercase tracking-widest text-[10px]"
                                    onClick={() => {
                                      setSelectedCategory({ ...selectedCategory, imageUrl: "" });
                                      setEditCategoryImageFile(null);
                                    }}
                                  >
                                    <X className="w-4 h-4 mr-2" /> De-Link Asset
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4">
                              <div className="flex flex-col items-center justify-center p-14 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                  <Upload className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                <p className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-2">Refine Visual Asset</p>
                                <p className="text-[10px] text-slate-500 text-center mb-8 uppercase tracking-tighter">Taxonomy asset re-assignment protocols</p>
                                <div className="flex gap-4">
                                  <Button
                                    variant="outline"
                                    className="h-11 px-6 rounded-xl bg-white dark:bg-slate-950 font-black uppercase tracking-widest text-[10px]"
                                    onClick={() => document.getElementById('category-upload-edit')?.click()}
                                  >
                                    Replace File
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]"
                                    onClick={() => {
                                      const url = prompt("Enter category image URL:", selectedCategory.imageUrl);
                                      if (url?.trim()) setSelectedCategory({ ...selectedCategory, imageUrl: url.trim() });
                                    }}
                                  >
                                    External URL
                                  </Button>
                                </div>
                                <input
                                  id="category-upload-edit"
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setEditCategoryImageFile(file);
                                      setSelectedCategory({ ...selectedCategory, imageUrl: URL.createObjectURL(file) });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                    {/* Right Column: Settings & SEO */}
                    <div className="space-y-12">
                      {/* Section 3: Status & Hierarchy */}
                      <section className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                            <Settings className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Operational Logic</h3>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="edit-category-status" className="text-xs font-black text-slate-400 uppercase tracking-widest">Visibility Lifecycle</Label>
                            <Select
                              value={selectedCategory.status || "Active"}
                              onValueChange={(val) => setSelectedCategory({ ...selectedCategory, status: val })}
                            >
                              <SelectTrigger id="edit-category-status" className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">
                                  <div className="flex items-center gap-2 font-bold text-emerald-600">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Deployment
                                  </div>
                                </SelectItem>
                                <SelectItem value="Inactive">
                                  <div className="flex items-center gap-2 font-bold text-slate-400">
                                    <div className="w-2 h-2 rounded-full bg-slate-300" /> Statically Halted
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </section>

                      {/* Section 4: SEO Optimizations */}
                      <section className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                            <Globe className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">SEO Calibration</h3>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="edit-category-meta-title" className="text-xs font-black text-slate-400 uppercase tracking-widest">Meta Descriptor Title</Label>
                            <Input
                              id="edit-category-meta-title"
                              className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20"
                              value={selectedCategory.metaTitle}
                              onChange={(e) => setSelectedCategory({ ...selectedCategory, metaTitle: e.target.value })}
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="edit-category-meta-description" className="text-xs font-black text-slate-400 uppercase tracking-widest">Indexable Crawler Context</Label>
                            <Textarea
                              id="edit-category-meta-description"
                              className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner focus:ring-primary/20 resize-none p-5 text-sm"
                              value={selectedCategory.metaDescription}
                              onChange={(e) => setSelectedCategory({ ...selectedCategory, metaDescription: e.target.value })}
                            />
                          </div>
                        </div>
                      </section>

                      {/* Audit Trail Preview */}
                      <section className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                          <Activity className="w-20 h-20 text-primary" />
                        </div>

                        <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 font-black uppercase text-xs tracking-widest mb-6 relative z-10">
                          <Activity className="w-5 h-5 text-primary" />
                          Historical Intelligence
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Uniform Resource String</p>
                            <p className="text-xs font-mono font-bold text-primary truncate">
                              /{selectedCategory.slug}
                            </p>
                          </div>
                          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Temporal Sync</p>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">
                              {new Date(selectedCategory.updatedAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 gap-3">
              <Button
                variant="outline"
                className="h-11 px-8 rounded-xl font-bold uppercase tracking-widest text-[11px] border-slate-200 dark:border-slate-800"
                onClick={() => setShowEditModal(false)}
              >
                Discard Revisions
              </Button>
              <Button
                onClick={handleEditCategory}
                disabled={modalLoading}
                className="h-11 px-10 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calibrating...
                  </>
                ) : (
                  "Commit Updates"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white dark:bg-slate-950">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-10 h-10 text-rose-500 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Purge Taxonomy?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed px-4">
                  You are about to permanently delete the <span className="font-bold text-slate-900 dark:text-slate-100">&quot;{selectedCategory?.name}&quot;</span> classification. This action is irreversible within the current architecture.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="destructive"
                  onClick={handleDeleteCategory}
                  disabled={modalLoading}
                  className="h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-500/20"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Purging...
                    </>
                  ) : (
                    "Confirm Permanent Deletion"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={modalLoading}
                  className="h-12 rounded-2xl font-bold uppercase tracking-widest text-xs border-slate-100 dark:border-slate-800"
                >
                  Retain Entity
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
};

export default CategoriesPage;
