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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new product category with all necessary details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Basic Information
                </h3>
                <div>
                  <Label htmlFor="add-category-name" className="mb-2 block">
                    Category Name
                  </Label>
                  <Input
                    id="add-category-name"
                    type="text"
                    placeholder="Enter category name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="add-category-slug" className="mb-2 block">
                    Slug
                  </Label>
                  <Input
                    id="add-category-slug"
                    type="text"
                    placeholder="category-slug"
                    value={newCategory.slug}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, slug: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="add-category-description"
                    className="mb-2 block"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="add-category-description"
                    placeholder="Enter category description"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="add-category-image" className="mb-2 block">
                    Category Image
                  </Label>
                  {newCategory.imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-48 overflow-hidden rounded-lg border">
                        <Image
                          src={newCategory.imageUrl}
                          alt={newCategory.name || "New category"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Convert file to URL for preview
                              const imageUrl = URL.createObjectURL(file);
                              setNewCategory({ ...newCategory, imageUrl });
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newUrl = prompt(
                              "Enter new image URL:",
                              newCategory.imageUrl,
                            );
                            if (
                              newUrl !== null &&
                              newUrl !== newCategory.imageUrl
                            ) {
                              setNewCategory({
                                ...newCategory,
                                imageUrl: newUrl,
                              });
                              setNewCategoryImageFile(null);
                            }
                          }}
                        >
                          Edit URL
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setNewCategory({ ...newCategory, imageUrl: "" });
                            setNewCategoryImageFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="mb-2">No image selected</div>
                          <div className="text-sm">
                            Choose a file or enter a URL
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Store the actual file
                              setNewCategoryImageFile(file);
                              // Convert file to URL for preview
                              const imageUrl = URL.createObjectURL(file);
                              setNewCategory({ ...newCategory, imageUrl });
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newUrl = prompt("Enter image URL:", "");
                            if (newUrl !== null && newUrl.trim()) {
                              setNewCategory({
                                ...newCategory,
                                imageUrl: newUrl.trim(),
                              });
                              setNewCategoryImageFile(null);
                            }
                          }}
                        >
                          Enter URL
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Category Settings
                </h3>
                <div>
                  <Label htmlFor="add-category-status" className="mb-2 block">
                    Status
                  </Label>
                  <Select
                    value={newCategory.status || "Active"}
                    onValueChange={(value) =>
                      setNewCategory({ ...newCategory, status: value })
                    }
                  >
                    <SelectTrigger id="add-category-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="add-category-meta-title"
                    className="mb-2 block"
                  >
                    Meta Title
                  </Label>
                  <Input
                    id="add-category-meta-title"
                    type="text"
                    placeholder="SEO meta title"
                    value={newCategory.metaTitle}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        metaTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="add-category-meta-description"
                    className="mb-2 block"
                  >
                    Meta Description
                  </Label>
                  <Textarea
                    id="add-category-meta-description"
                    placeholder="SEO meta description"
                    value={newCategory.metaDescription}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        metaDescription: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
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
              <Button onClick={handleAddCategory} disabled={modalLoading}>
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category information and settings.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Basic Information
                  </h3>
                  <div>
                    <Label htmlFor="edit-category-name" className="mb-2 block">
                      Category Name
                    </Label>
                    <Input
                      id="edit-category-name"
                      type="text"
                      placeholder="Enter category name"
                      value={selectedCategory.name}
                      onChange={(e) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category-slug" className="mb-2 block">
                      Slug
                    </Label>
                    <Input
                      id="edit-category-slug"
                      type="text"
                      placeholder="category-slug"
                      value={selectedCategory.slug}
                      onChange={(e) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          slug: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-category-description"
                      className="mb-2 block"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="edit-category-description"
                      placeholder="Enter category description"
                      value={selectedCategory.description}
                      onChange={(e) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category-image" className="mb-2 block">
                      Category Image
                    </Label>
                    {selectedCategory.imageUrl ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 overflow-hidden rounded-lg border">
                          <Image
                            src={selectedCategory.imageUrl}
                            alt={selectedCategory.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Store the actual file
                                setEditCategoryImageFile(file);
                                // Convert file to URL for preview
                                const imageUrl = URL.createObjectURL(file);
                                setSelectedCategory({
                                  ...selectedCategory,
                                  imageUrl,
                                });
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "text";
                              input.value = selectedCategory.imageUrl;
                              input.placeholder = "Enter image URL";
                              input.className =
                                "w-full px-3 py-2 border rounded-md";
                              const newUrl = prompt(
                                "Enter new image URL:",
                                selectedCategory.imageUrl,
                              );
                              if (
                                newUrl !== null &&
                                newUrl !== selectedCategory.imageUrl
                              ) {
                                setSelectedCategory({
                                  ...selectedCategory,
                                  imageUrl: newUrl,
                                });
                                setEditCategoryImageFile(null);
                              }
                            }}
                          >
                            Edit URL
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <div className="mb-2">No image selected</div>
                            <div className="text-sm">
                              Choose a file or enter a URL
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Store the actual file
                                setEditCategoryImageFile(file);
                                // Convert file to URL for preview
                                const imageUrl = URL.createObjectURL(file);
                                setSelectedCategory({
                                  ...selectedCategory,
                                  imageUrl,
                                });
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const newUrl = prompt("Enter image URL:", "");
                              if (newUrl !== null && newUrl.trim()) {
                                setSelectedCategory({
                                  ...selectedCategory,
                                  imageUrl: newUrl.trim(),
                                });
                                setEditCategoryImageFile(null);
                              }
                            }}
                          >
                            Enter URL
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Category Settings
                  </h3>
                  <div>
                    <Label
                      htmlFor="edit-category-status"
                      className="mb-2 block"
                    >
                      Status
                    </Label>
                    <Select
                      value={selectedCategory.status}
                      onValueChange={(value) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger id="edit-category-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-category-meta-title"
                      className="mb-2 block"
                    >
                      Meta Title
                    </Label>
                    <Input
                      id="edit-category-meta-title"
                      type="text"
                      placeholder="SEO meta title"
                      value={selectedCategory.metaTitle}
                      onChange={(e) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          metaTitle: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-category-meta-description"
                      className="mb-2 block"
                    >
                      Meta Description
                    </Label>
                    <Textarea
                      id="edit-category-meta-description"
                      placeholder="SEO meta description"
                      value={selectedCategory.metaDescription}
                      onChange={(e) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
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
              <Button onClick={handleEditCategory} disabled={modalLoading}>
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete category &quot;
                {selectedCategory?.name}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={modalLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCategory}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default CategoriesPage;
