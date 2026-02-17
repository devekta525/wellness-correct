"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
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
import NoData from "@/components/common/dashboard/NoData";
import Loader from "@/components/common/dashboard/Loader";
import Error from "@/components/common/dashboard/Error";
import {
  fetchProductsData,
  setFilters,
  setPagination,
  selectProductsData,
  selectProductsLoading,
  selectProductsError,
  selectProductsFilters,
  selectProductsPagination,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "@/lib/redux/features/productSlice";
import Swal from "sweetalert2";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

interface ProductWithImages extends Product {
  productImages?: ProductImage[];
}

const categories = [
  "All",
  "Supplements",
  "Vitamins",
  "Beverages",
  "Wellness",
  "Fitness & Nutrition",
];
const statuses = ["All", "active", "out_of_stock", "inactive"];

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProductsData);
  const isLoading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  const filters = useAppSelector(selectProductsFilters);
  const pagination = useAppSelector(selectProductsPagination);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithImages | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const getProductImage = (product: Product) => {
    const hasError = imageErrors[product._id];
    if (hasError) {
      return "/placeholder-product.svg";
    }
    return (
      product.images?.[0] || product.imageUrl || "/placeholder-product.svg"
    );
  };

  // Image management functions
  const addImageFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && productImages.length < 5) {
      files.slice(0, 5 - productImages.length).forEach((file) => {
        if (file && productImages.length < 5) {
          const reader = new FileReader();
          reader.onload = () => {
            const newImage: ProductImage = {
              id: `${Date.now()}-${Math.random()}`,
              url: reader.result as string,
              alt: file.name.split(".")[0],
              caption: "",
            };
            setProductImages((prev) => [...prev, newImage]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const addImageFromUrl = () => {
    if (urlInput.trim() && productImages.length < 5) {
      const newImage: ProductImage = {
        id: `${Date.now()}-${Math.random()}`,
        url: urlInput.trim(),
        alt: urlInput.split("/").pop()?.split(".")[0] || "Image",
        caption: "",
      };
      setProductImages((prev) => [...prev, newImage]);
      setUrlInput("");
    }
  };

  const removeImage = (id: string) => {
    setProductImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updateImage = (
    id: string,
    field: keyof ProductImage,
    value: string,
  ) => {
    setProductImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [field]: value } : img)),
    );
  };

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    category: "",
    price: {
      amount: "",
      currency: "INR",
      mrp: "",
    },
    stockQuantity: "",
    shortDescription: "",
    description: "",
    longDescription: "",
    weightSize: {
      value: "",
      unit: "g",
    },
    expiryDate: "",
    ingredients: "",
    benefits: "",
    dosageInstructions: "",
    manufacturer: "",
    images: "",
    metaTitle: "",
    metaDescription: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchProductsData());
  }, [dispatch]);

  // Pagination logic using Redux pagination
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleCategoryChange = (value: string) => {
    dispatch(setFilters({ category: value === "All" ? "" : value }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    dispatch(setFilters({ status: value === "All" ? "" : value }));
    dispatch(setPagination({ page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ page }));
  };

  // --- FIXED ADD FUNCTION ---
  const handleAddProduct = async () => {
    try {
      const formData = new FormData();

      // Direct Fields (Must match Schema exact keys)
      formData.append("name", newProduct.name);
      formData.append("category", newProduct.category);
      formData.append("shortDescription", newProduct.shortDescription);
      formData.append("longDescription", newProduct.longDescription);
      // Sending short description as fallback for description if needed
      formData.append("description", newProduct.longDescription);
      formData.append("stockQuantity", newProduct.stockQuantity);
      formData.append("expiryDate", newProduct.expiryDate);
      formData.append("manufacturer", newProduct.manufacturer);
      formData.append("dosageInstructions", newProduct.dosageInstructions);

      // Nested Objects (Using bracket notation for standard parsers)
      formData.append("price[amount]", newProduct.price.amount);
      formData.append("price[currency]", newProduct.price.currency);
      if (newProduct.price.mrp)
        formData.append("price[mrp]", newProduct.price.mrp);

      formData.append("weightSize[value]", newProduct.weightSize.value);
      formData.append("weightSize[unit]", newProduct.weightSize.unit);

      // Arrays (Split strings and append multiple times)
      const ingredientsArray = newProduct.ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      ingredientsArray.forEach((ing) => {
        formData.append("ingredients", ing);
      });

      const benefitsArray = newProduct.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean);
      benefitsArray.forEach((ben) => {
        formData.append("benefits", ben);
      });

      // Images
      productImages.forEach((img, index) => {
        formData.append(`images[${index}]`, img.url);
      });
      // Legacy/Fallback image field
      if (productImages.length > 0) {
        formData.append("imageUrl", productImages[0].url);
      }

      // Optional
      if (newProduct.slug) formData.append("slug", newProduct.slug);
      if (newProduct.metaTitle)
        formData.append("metaTitle", newProduct.metaTitle);
      if (newProduct.metaDescription)
        formData.append("metaDescription", newProduct.metaDescription);

      const success = (await dispatch(
        createProduct(formData),
      )) as unknown as boolean;
      if (success) {
        setShowAddModal(false);
        setNewProduct({
          name: "",
          slug: "",
          category: "",
          price: { amount: "", currency: "INR", mrp: "" },
          stockQuantity: "",
          shortDescription: "",
          description: "",
          longDescription: "",
          weightSize: { value: "", unit: "g" },
          expiryDate: "",
          ingredients: "",
          benefits: "",
          dosageInstructions: "",
          manufacturer: "",
          images: "",
          metaTitle: "",
          metaDescription: "",
        });
        setProductImages([]);
        setUrlInput("");
        dispatch(fetchProductsData());
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // --- FIXED EDIT FUNCTION ---
  const handleEditProduct = async () => {
    try {
      if (!selectedProduct) return;

      // Build plain object for update
      const updatedProduct = {
        name: newProduct.name,
        category: newProduct.category,
        shortDescription: newProduct.shortDescription,
        longDescription: newProduct.longDescription,
        description: newProduct.longDescription,
        stockQuantity: Number(newProduct.stockQuantity),
        expiryDate: newProduct.expiryDate,
        manufacturer: newProduct.manufacturer,
        dosageInstructions: newProduct.dosageInstructions,
        price: {
          amount: Number(newProduct.price.amount),
          currency: newProduct.price.currency,
          mrp: newProduct.price.mrp ? Number(newProduct.price.mrp) : undefined,
        },
        weightSize: {
          value: Number(newProduct.weightSize.value),
          unit: newProduct.weightSize.unit,
        },
        ingredients: newProduct.ingredients
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        benefits: newProduct.benefits
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
        images: productImages.map((img) => img.url),
        imageUrl: productImages[0]?.url || "",
        slug: newProduct.slug,
        metaTitle: newProduct.metaTitle,
        metaDescription: newProduct.metaDescription,
      };

      const success = (await dispatch(
        updateProduct(selectedProduct._id, updatedProduct),
      )) as unknown as boolean;
      if (success) {
        setShowEditModal(false);
        setSelectedProduct(null);
        dispatch(fetchProductsData());
        Swal.fire({
          title: "Success!",
          text: "Product updated successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${product.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const success = (await dispatch(
            deleteProduct(product._id),
          )) as unknown as boolean;
          if (success) {
            dispatch(fetchProductsData());
            Swal.fire({
              title: "Deleted!",
              text: "Product has been deleted.",
              icon: "success",
            });
          }
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete product.",
            icon: "error",
          });
        }
      }
    });
  };

  const openEditModal = (product: Product) => {
    const productWithImages: ProductWithImages = {
      ...product,
      productImages: product.images.map((img, index) => ({
        id: `img-${index}`,
        url: img,
        alt: product.name,
        caption: "",
      })),
    };
    setSelectedProduct(productWithImages);
    setProductImages(productWithImages.productImages || []);

    setNewProduct({
      name: product.name,
      slug: product.slug || "",
      category: product.category,
      price: {
        amount: product.price.amount.toString(),
        currency: product.price.currency,
        mrp: product.price.mrp?.toString() || "",
      },
      stockQuantity: product.stockQuantity.toString(),
      shortDescription: product.shortDescription,
      description: product.description || "",
      longDescription: product.longDescription,
      weightSize: {
        value: product.weightSize.value.toString(),
        unit: product.weightSize.unit,
      },
      // Formatting date safely
      expiryDate: product.expiryDate
        ? new Date(product.expiryDate).toISOString().split("T")[0]
        : "",
      ingredients: product.ingredients.join(", "),
      benefits: product.benefits.join("\n"),
      dosageInstructions: product.dosageInstructions,
      manufacturer: product.manufacturer,
      images:
        product.imageUrl ||
        (product.images.length > 0 ? product.images[0] : ""),
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
    });
    setUrlInput("");
    setShowEditModal(true);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading products" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Products</h1>
                <p className="text-muted-foreground">
                  Manage your product inventory
                </p>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a new product to inventory</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        (window.location.href =
                          "/dashboard/products/addProduct")
                      }
                      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Add Product
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add product using AI image analysis</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {pagination.total}
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
                        Active Products
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {
                          (products || []).filter((p) => p.status === "active")
                            .length
                        }
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Inactive Products
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {
                          (products || []).filter(
                            (p) => p.status === "inactive",
                          ).length
                        }
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Value
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        ₹
                        {(products || [])
                          .reduce(
                            (sum, p) => sum + p.price.amount * p.stockQuantity,
                            0,
                          )
                          .toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
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
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filter */}
                  <Select
                    value={filters.category || "All"}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select
                    value={filters.status || "All"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}
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
              <Loader variant="skeleton" message="Loading products..." />
            ) : products.length === 0 ? (
              <NoData
                message="No products found"
                description="Get started by adding your first product"
                icon={
                  <Package className="w-full h-full text-muted-foreground/60" />
                }
                action={{
                  label: "Add Product",
                  onClick: () => setShowAddModal(true),
                }}
                size="lg"
              />
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <Card
                        key={product._id}
                        className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                      >
                        <div className="relative">
                          <Image
                            src={getProductImage(product)}
                            alt={product.name}
                            width={300}
                            height={192}
                            className="w-full h-48 object-cover"
                            onError={() => handleImageError(product._id)}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge
                              variant={
                                product.status === "active"
                                  ? "default"
                                  : product.status === "inactive"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {product.status?.replace("_", " ") || "active"}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">
                              {product.name}
                            </CardTitle>
                            <CardDescription className="mb-2">
                              {product.category}
                            </CardDescription>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-foreground">
                                  ₹{product.price.amount}
                                </span>
                                {product.price.mrp &&
                                  product.price.mrp > product.price.amount && (
                                    <span className="text-sm text-muted-foreground line-through">
                                      ₹{product.price.mrp}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {product.shortDescription}
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Stock: {product.stockQuantity} •{" "}
                              {product.weightSize.value}{" "}
                              {product.weightSize.unit}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-auto">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openEditModal(product)}
                                  className="flex-1 gap-2"
                                  size="sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit product details</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleDeleteProduct(product)}
                                  variant="outline"
                                  className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  size="sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete this product</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  onError={() => handleImageError(product._id)}
                                />
                                <div>
                                  <p className="font-medium text-foreground">
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {product.shortDescription}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="font-medium">
                              ₹{product.price.amount}
                            </TableCell>
                            <TableCell>{product.stockQuantity}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.status === "active"
                                    ? "default"
                                    : product.status === "inactive"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {product.status?.replace("_", " ") || "active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openEditModal(product)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit product</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => handleDeleteProduct(product)}
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete product</p>
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

                {/* Pagination */}
                {!isLoading && products.length > 0 && totalPages > 1 && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(endIndex, pagination.total)} of{" "}
                          {pagination.total} products
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
                                  pagination.page === page
                                    ? "default"
                                    : "outline"
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

            {/* Add Product Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Create a new product with all the necessary details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Basic Information
                    </h3>
                    <div>
                      <Label htmlFor="add-product-name" className="mb-2 block">
                        Product Name
                      </Label>
                      <Input
                        id="add-product-name"
                        type="text"
                        placeholder="Enter product name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="add-product-category"
                        className="mb-2 block"
                      >
                        Category
                      </Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) =>
                          setNewProduct({ ...newProduct, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="add-product-short-desc"
                        className="mb-2 block"
                      >
                        Short Description
                      </Label>
                      <Input
                        id="add-product-short-desc"
                        type="text"
                        placeholder="Brief product description"
                        value={newProduct.shortDescription}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            shortDescription: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="add-product-long-desc"
                        className="mb-2 block"
                      >
                        Long Description
                      </Label>
                      <Textarea
                        id="add-product-long-desc"
                        placeholder="Detailed product description"
                        value={newProduct.longDescription}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            longDescription: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Pricing & Inventory
                    </h3>
                    <div>
                      <Label htmlFor="add-product-price" className="mb-2 block">
                        Price (₹)
                      </Label>
                      <Input
                        id="add-product-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newProduct.price.amount}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: {
                              ...newProduct.price,
                              amount: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-product-stock" className="mb-2 block">
                        Stock Quantity
                      </Label>
                      <Input
                        id="add-product-stock"
                        type="number"
                        placeholder="0"
                        value={newProduct.stockQuantity}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stockQuantity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="add-product-weight"
                        className="mb-2 block"
                      >
                        Weight/Size
                      </Label>
                      <Input
                        id="add-product-weight"
                        type="text"
                        placeholder="e.g., 2.2 lbs (1kg)"
                        value={newProduct.weightSize.value}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            weightSize: {
                              ...newProduct.weightSize,
                              value: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Product Details
                    </h3>
                    <div>
                      <Label
                        htmlFor="add-product-ingredients"
                        className="mb-2 block"
                      >
                        Ingredients
                      </Label>
                      <Textarea
                        id="add-product-ingredients"
                        placeholder="List all ingredients separated by commas"
                        value={newProduct.ingredients}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            ingredients: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="add-product-dosage"
                        className="mb-2 block"
                      >
                        Dosage Instructions
                      </Label>
                      <Textarea
                        id="add-product-dosage"
                        placeholder="e.g., 1 capsule daily with food"
                        value={newProduct.dosageInstructions}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            dosageInstructions: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="add-product-benefits"
                        className="mb-2 block"
                      >
                        Benefits (one per line)
                      </Label>
                      <Textarea
                        id="add-product-benefits"
                        placeholder="Builds lean muscle mass&#10;Supports post-workout recovery&#10;Contains all essential amino acids"
                        value={newProduct.benefits}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            benefits: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Additional Information
                    </h3>
                    <div>
                      <Label
                        htmlFor="add-product-manufacturer"
                        className="mb-2 block"
                      >
                        Manufacturer
                      </Label>
                      <Input
                        id="add-product-manufacturer"
                        type="text"
                        placeholder="Enter manufacturer name"
                        value={newProduct.manufacturer}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            manufacturer: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="add-product-expiry"
                        className="mb-2 block"
                      >
                        Expiry Date
                      </Label>
                      <Input
                        id="add-product-expiry"
                        type="date"
                        value={newProduct.expiryDate}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            expiryDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Product Images (Limit: 5)
                    </h3>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Product Images {productImages.length}/5</Label>
                        <div className="flex gap-2">
                          {productImages.length < 5 && (
                            <Button
                              onClick={addImageFromFile}
                              size="sm"
                              variant="outline"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Upload Files
                            </Button>
                          )}
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {productImages.length < 5 && (
                        <div className="flex gap-2 mb-3">
                          <Input
                            placeholder="Image URL"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                          />
                          <Button
                            onClick={addImageFromUrl}
                            size="sm"
                            variant="outline"
                          >
                            Add URL
                          </Button>
                        </div>
                      )}
                      {productImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {productImages.map((image) => (
                            <div
                              key={image.id}
                              className="border rounded-lg p-3 space-y-2"
                            >
                              <div className="relative w-full h-20 overflow-hidden rounded-lg">
                                <img
                                  src={image.url}
                                  alt={image.alt}
                                  className="object-cover"
                                />
                                <Button
                                  onClick={() => removeImage(image.id)}
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-5 w-5"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <Input
                                placeholder="Alt text"
                                value={image.alt}
                                onChange={(e) =>
                                  updateImage(image.id, "alt", e.target.value)
                                }
                                className="text-sm"
                              />
                              <Input
                                placeholder="Caption (optional)"
                                value={image.caption || ""}
                                onChange={(e) =>
                                  updateImage(
                                    image.id,
                                    "caption",
                                    e.target.value,
                                  )
                                }
                                className="text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Update the product details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Basic Information
                    </h3>
                    <div>
                      <Label htmlFor="edit-product-name" className="mb-2 block">
                        Product Name
                      </Label>
                      <Input
                        id="edit-product-name"
                        type="text"
                        placeholder="Enter product name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-category"
                        className="mb-2 block"
                      >
                        Category
                      </Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) =>
                          setNewProduct({ ...newProduct, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-short-desc"
                        className="mb-2 block"
                      >
                        Short Description
                      </Label>
                      <Input
                        id="edit-product-short-desc"
                        type="text"
                        placeholder="Brief product description"
                        value={newProduct.shortDescription}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            shortDescription: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-long-desc"
                        className="mb-2 block"
                      >
                        Long Description
                      </Label>
                      <Textarea
                        id="edit-product-long-desc"
                        placeholder="Detailed product description"
                        value={newProduct.longDescription}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            longDescription: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Pricing & Inventory
                    </h3>
                    <div>
                      <Label
                        htmlFor="edit-product-price"
                        className="mb-2 block"
                      >
                        Price (₹)
                      </Label>
                      <Input
                        id="edit-product-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newProduct.price.amount}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: {
                              ...newProduct.price,
                              amount: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-original-price"
                        className="mb-2 block"
                      >
                        Original Price (₹)
                      </Label>
                      <Input
                        id="edit-product-original-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newProduct.price.mrp}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: { ...newProduct.price, mrp: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-stock"
                        className="mb-2 block"
                      >
                        Stock Quantity
                      </Label>
                      <Input
                        id="edit-product-stock"
                        type="number"
                        placeholder="0"
                        value={newProduct.stockQuantity}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stockQuantity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-weight"
                        className="mb-2 block"
                      >
                        Weight/Size
                      </Label>
                      <Input
                        id="edit-product-weight"
                        type="text"
                        placeholder="e.g., 2.2 lbs (1kg)"
                        value={newProduct.weightSize.value}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            weightSize: {
                              ...newProduct.weightSize,
                              value: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Product Details
                    </h3>
                    <div>
                      <Label
                        htmlFor="edit-product-ingredients"
                        className="mb-2 block"
                      >
                        Ingredients
                      </Label>
                      <Textarea
                        id="edit-product-ingredients"
                        placeholder="List all ingredients separated by commas"
                        value={newProduct.ingredients}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            ingredients: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-dosage"
                        className="mb-2 block"
                      >
                        Dosage Instructions
                      </Label>
                      <Textarea
                        id="edit-product-dosage"
                        placeholder="e.g., 1 capsule daily with food"
                        value={newProduct.dosageInstructions}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            dosageInstructions: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-benefits"
                        className="mb-2 block"
                      >
                        Benefits (one per line)
                      </Label>
                      <Textarea
                        id="edit-product-benefits"
                        placeholder="Builds lean muscle mass&#10;Supports post-workout recovery&#10;Contains all essential amino acids"
                        value={newProduct.benefits}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            benefits: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Additional Information
                    </h3>
                    <div>
                      <Label
                        htmlFor="edit-product-manufacturer"
                        className="mb-2 block"
                      >
                        Manufacturer
                      </Label>
                      <Input
                        id="edit-product-manufacturer"
                        type="text"
                        placeholder="Enter manufacturer name"
                        value={newProduct.manufacturer}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            manufacturer: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-product-expiry"
                        className="mb-2 block"
                      >
                        Expiry Date
                      </Label>
                      <Input
                        id="edit-product-expiry"
                        type="date"
                        value={newProduct.expiryDate}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            expiryDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      Product Images (Limit: 5)
                    </h3>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>
                          Product Images{" "}
                          {productImages.length}/5
                        </Label>
                        <div className="flex gap-2">
                          {productImages.length < 5 && (
                            <Button
                              onClick={addImageFromFile}
                              size="sm"
                              variant="outline"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Upload More
                            </Button>
                          )}
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {productImages.length < 5 && (
                        <div className="flex gap-2 mb-3">
                          <Input
                            placeholder="Image URL"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                          />
                          <Button
                            onClick={addImageFromUrl}
                            size="sm"
                            variant="outline"
                          >
                            Add URL
                          </Button>
                        </div>
                      )}
                      {productImages.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {productImages.map((image) => (
                              <div
                                key={image.id}
                                className="border rounded-lg p-3 space-y-2"
                              >
                                <div className="relative w-full h-20 overflow-hidden rounded-lg">
                                  <img
                                    src={image.url}
                                    alt={image.alt}
                                    className="object-cover"
                                  />
                                  <Button
                                    onClick={() => removeImage(image.id)}
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-5 w-5"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Input
                                  placeholder="Alt text"
                                  value={image.alt}
                                  onChange={(e) => updateImage(image.id, "alt", e.target.value)}
                                  className="text-sm"
                                />
                                <Input
                                  placeholder="Caption (optional)"
                                  value={image.caption || ""}
                                  onChange={(e) => updateImage(image.id, "caption", e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditProduct} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Product"
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
export default dynamic(() => Promise.resolve(ProductsPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  ),
});
