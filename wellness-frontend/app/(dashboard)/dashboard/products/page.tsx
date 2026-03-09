"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
  FileText,
  Info,
  Image as ImageIcon,
  Tag,
  Barcode,
  Clock,
  Settings,
  AlertCircle,
  LayoutGrid,
  ChevronLeft as ChevronLeftIcon,
} from "lucide-react";
import { FormSteps } from "@/components/ui/form-steps";
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
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStep, setEditStep] = useState(1);
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
    for: "",
    with: "",
  });

  const resetAddForm = () => {
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
      for: "",
      with: "",
    });
    setProductImages([]);
    setUrlInput("");
  };

  // Fetch data on component mount or filter/pagination change
  useEffect(() => {
    dispatch(fetchProductsData());
  }, [dispatch, filters, pagination.page]);

  useEffect(() => {
    if (searchParams?.get("action") === "add") {
      resetAddForm();
      setShowAddModal(true);
    }
  }, [searchParams]);

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
      // Build plain object for create
      const productPayload = {
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
        for: newProduct.for,
        with: newProduct.with,
      };

      const success = (await dispatch(
        createProduct(productPayload),
      )) as unknown as boolean;
      if (success) {
        setShowAddModal(false);
        resetAddForm();
        dispatch(fetchProductsData());
        Swal.fire({
          title: "Success!",
          text: "Product added successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to add product. Please check the fields and try again.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred while adding the product.",
        icon: "error",
      });
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
        for: newProduct.for,
        with: newProduct.with,
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
      productImages: (product.images || []).map((img, index) => ({
        id: `img-${index}`,
        url: img,
        alt: product.name || "",
        caption: "",
      })),
    };
    setSelectedProduct(productWithImages);
    setProductImages(productWithImages.productImages || []);

    setNewProduct({
      name: product.name || "",
      slug: product.slug || "",
      category: product.category || "",
      price: {
        amount: product.price?.amount?.toString() || "",
        currency: product.price?.currency || "INR",
        mrp: product.price?.mrp?.toString() || "",
      },
      stockQuantity: product.stockQuantity?.toString() || "0",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      longDescription: product.longDescription || "",
      weightSize: {
        value: product?.weightSize?.value?.toString() || "",
        unit: product?.weightSize?.unit || "g",
      },
      // Formatting date safely
      expiryDate: product.expiryDate
        ? new Date(product.expiryDate).toISOString().split("T")[0]
        : "",
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(", ") : "",
      benefits: Array.isArray(product.benefits) ? product.benefits.join("\n") : "",
      dosageInstructions: product.dosageInstructions || "",
      manufacturer: product.manufacturer || "",
      images:
        product.imageUrl ||
        (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ""),
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      for: product.for || "",
      with: product.with || "",
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
                      onClick={() => {
                        resetAddForm();
                        setShowAddModal(true);
                      }}
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
                      className="gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
              <Card className="border-none shadow-sm">
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
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
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
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
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
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
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
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
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
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 flex flex-col h-full relative"
                      >
                        <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden">
                          <Image
                            src={getProductImage(product)}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={() => handleImageError(product._id)}
                          />
                          <div className="absolute top-3 right-3 shadow-sm z-10">
                            <Badge
                              className={`shadow-sm border-0 font-bold px-3 py-1 text-[10px] tracking-wide uppercase ${product.status === "active"
                                ? "bg-blue-600 text-white"
                                : product.status === "inactive"
                                  ? "bg-slate-500 text-white"
                                  : "bg-red-500 text-white"
                                }`}
                            >
                              {product.status?.replace("_", " ") || "active"}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col pt-6 relative bg-white z-10 rounded-t-2xl -mt-4 border-t border-slate-100">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold mb-1 text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </CardTitle>
                            <CardDescription className="mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              {product.category}
                            </CardDescription>

                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-xl font-bold text-slate-900">
                                ₹{product.price.amount}
                              </span>
                              {product.price.mrp &&
                                product.price.mrp > product.price.amount && (
                                  <span className="text-xs font-medium text-slate-400 line-through">
                                    ₹{product.price.mrp}
                                  </span>
                                )}
                            </div>

                            <p className="text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed">
                              {product.shortDescription}
                            </p>

                            <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl mb-6 border border-slate-100">
                              <span>Stock: <span className={`font-bold ${Number(product.stockQuantity) < 10 ? 'text-red-500' : 'text-slate-800'}`}>{product.stockQuantity || 0}</span></span>
                              {product?.weightSize?.value && (
                                <>
                                  <span className="mx-2 text-slate-300">•</span>
                                  <span>{product.weightSize.value} {product.weightSize.unit || ""}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3 mt-auto pt-2 grid-cols-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openEditModal(product)}
                                  className="w-full gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-0 shadow-none transition-colors rounded-xl font-semibold h-11"
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
                                  className="w-full gap-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border-0 shadow-none transition-colors rounded-xl font-semibold h-11"
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
                      <TableHeader className="bg-slate-50 font-bold">
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
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
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
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
                                      onClick={() =>
                                        handleDeleteProduct(product)
                                      }
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
            <Dialog open={showAddModal} onOpenChange={(open) => {
              setShowAddModal(open);
              if (!open) setAddStep(1);
            }}>
              <DialogContent className="max-w-3xl p-0 gap-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight mb-1">Add New Product</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                      Create a new product entry in your inventory.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <div className="bg-white px-8 pt-8 pb-4">
                  <FormSteps
                    currentStep={addStep}
                    steps={[
                      { id: 1, name: "Basic Info" },
                      { id: 2, name: "Descriptions" },
                      { id: 3, name: "Pricing & Stock" },
                      { id: 4, name: "Visuals" },
                    ]}
                  />
                </div>

                <div className="px-8 py-6 bg-[#F8FAFC] min-h-[450px]">
                  {addStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="form-grid">
                        <div className="form-field form-field-full">
                          <label className="form-label form-label-required">Product Name</label>
                          <input className="form-input" placeholder="e.g. Organic Whey Protein" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label form-label-required">Category</label>
                          <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                            <SelectTrigger className="form-select-trigger"><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>
                              {categories.slice(1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="form-field">
                          <label className="form-label form-label-required">Manufacturer</label>
                          <input className="form-input" placeholder="Brand Name" value={newProduct.manufacturer} onChange={(e) => setNewProduct({ ...newProduct, manufacturer: e.target.value })} />
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label">Product Slug</label>
                          <input className="form-input" placeholder="product-url-slug" value={newProduct.slug} onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {addStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="form-grid">
                        <div className="form-field form-field-full">
                          <label className="form-label form-label-required">Short Summary</label>
                          <input className="form-input" placeholder="Brief catchphrase or pitch" value={newProduct.shortDescription} onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })} />
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label form-label-required">Detailed Description</label>
                          <textarea className="form-textarea" placeholder="Full product features and details" rows={4} value={newProduct.longDescription} onChange={(e) => setNewProduct({ ...newProduct, longDescription: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Key Benefits</label>
                          <textarea className="form-textarea" placeholder="One benefit per line" rows={3} value={newProduct.benefits} onChange={(e) => setNewProduct({ ...newProduct, benefits: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Ingredients</label>
                          <textarea className="form-textarea" placeholder="Separated by commas" rows={3} value={newProduct.ingredients} onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {addStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label form-label-required">Selling Price (₹)</label>
                          <input className="form-input" type="number" placeholder="0.00" value={newProduct.price.amount} onChange={(e) => setNewProduct({ ...newProduct, price: { ...newProduct.price, amount: e.target.value } })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">MRP (₹)</label>
                          <input className="form-input" type="number" placeholder="0.00" value={newProduct.price.mrp} onChange={(e) => setNewProduct({ ...newProduct, price: { ...newProduct.price, mrp: e.target.value } })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label form-label-required">Stock Quantity</label>
                          <input className="form-input" type="number" placeholder="Units in stock" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label form-label-required">Weight/Size</label>
                          <div className="flex gap-2">
                            <input className="form-input flex-1" placeholder="Value" value={newProduct.weightSize.value} onChange={(e) => setNewProduct({ ...newProduct, weightSize: { ...newProduct.weightSize, value: e.target.value } })} />
                            <Select value={newProduct.weightSize.unit} onValueChange={(v) => setNewProduct({ ...newProduct, weightSize: { ...newProduct.weightSize, unit: v } })}>
                              <SelectTrigger className="form-select-trigger w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["g", "kg", "ml", "L", "lb", "capsules", "tablets"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Expiry Date</label>
                          <input className="form-input" type="date" value={newProduct.expiryDate} onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Dosage Instructions</label>
                          <input className="form-input" placeholder="e.g. 1 scoop with water" value={newProduct.dosageInstructions} onChange={(e) => setNewProduct({ ...newProduct, dosageInstructions: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {addStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="form-grid">
                        <div className="form-field form-field-full">
                          <label className="form-label">Visual Assets (Max 5)</label>
                          <div className="flex gap-3 mb-4">
                            <input className="form-input flex-1" placeholder="Image URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                            <button type="button" className="btn-secondary" onClick={addImageFromUrl}>Add URL</button>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                            <button
                              onClick={addImageFromFile}
                              disabled={productImages.length >= 5}
                              className="upload-dropzone min-h-0 aspect-square p-0 flex flex-col items-center justify-center gap-1 border-2"
                            >
                              <Upload className="w-5 h-5 text-blue-500" />
                              <span className="text-[10px] font-bold">Upload</span>
                            </button>
                            {productImages.map((img) => (
                              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                                <img src={img.url} className="w-full h-full object-cover" alt="Preview" />
                                <button
                                  onClick={() => removeImage(img.id)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Meta Title</label>
                          <input className="form-input" placeholder="SEO Title" value={newProduct.metaTitle} onChange={(e) => setNewProduct({ ...newProduct, metaTitle: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Meta Description</label>
                          <input className="form-input" placeholder="SEO Description" value={newProduct.metaDescription} onChange={(e) => setNewProduct({ ...newProduct, metaDescription: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center gap-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => addStep > 1 ? setAddStep(addStep - 1) : setShowAddModal(false)}
                  >
                    {addStep === 1 ? "Cancel" : "Previous"}
                  </button>
                  <div className="flex gap-3">
                    {addStep < 4 ? (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setAddStep(addStep + 1)}
                      >
                        Next Step <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    ) : (
                      <button onClick={handleAddProduct} disabled={isLoading} className="btn-primary">
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                        ) : (
                          "Add Product"
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
              </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            <Dialog open={showEditModal} onOpenChange={(open) => {
              setShowEditModal(open);
              if (!open) setEditStep(1);
            }}>
              <DialogContent className="max-w-3xl p-0 gap-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight mb-1">Edit Product</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                      Update product details and specifications.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <div className="bg-white px-8 pt-8 pb-4">
                  <FormSteps
                    currentStep={editStep}
                    steps={[
                      { id: 1, name: "Basic Info" },
                      { id: 2, name: "Descriptions" },
                      { id: 3, name: "Pricing & Stock" },
                      { id: 4, name: "Visuals" },
                    ]}
                  />
                </div>

                <div className="px-8 py-6 bg-[#F8FAFC] min-h-[450px]">
                  {editStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="form-grid">
                        <div className="form-field form-field-full">
                          <label className="form-label form-label-required">Product Name</label>
                          <input className="form-input" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Category</label>
                          <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                            <SelectTrigger className="form-select-trigger"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {categories.slice(1).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Manufacturer</label>
                          <input className="form-input" value={newProduct.manufacturer} onChange={(e) => setNewProduct({ ...newProduct, manufacturer: e.target.value })} />
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label">Product Slug</label>
                          <input className="form-input" value={newProduct.slug} onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {editStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="form-grid">
                        <div className="form-field form-field-full">
                          <label className="form-label">Short Summary</label>
                          <input className="form-input" value={newProduct.shortDescription} onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })} />
                        </div>
                        <div className="form-field form-field-full">
                          <label className="form-label">Detailed Description</label>
                          <textarea className="form-textarea" rows={4} value={newProduct.longDescription} onChange={(e) => setNewProduct({ ...newProduct, longDescription: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Key Benefits</label>
                          <textarea className="form-textarea" rows={3} value={newProduct.benefits} onChange={(e) => setNewProduct({ ...newProduct, benefits: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Ingredients</label>
                          <textarea className="form-textarea" rows={3} value={newProduct.ingredients} onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {editStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label">Selling Price (₹)</label>
                          <input className="form-input" type="number" value={newProduct.price.amount} onChange={(e) => setNewProduct({ ...newProduct, price: { ...newProduct.price, amount: e.target.value } })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">MRP (₹)</label>
                          <input className="form-input" type="number" value={newProduct.price.mrp} onChange={(e) => setNewProduct({ ...newProduct, price: { ...newProduct.price, mrp: e.target.value } })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Stock Quantity</label>
                          <input className="form-input" type="number" value={newProduct.stockQuantity} onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Weight/Size</label>
                          <div className="flex gap-2">
                            <input className="form-input flex-1" value={newProduct.weightSize.value} onChange={(e) => setNewProduct({ ...newProduct, weightSize: { ...newProduct.weightSize, value: e.target.value } })} />
                            <Select value={newProduct.weightSize.unit} onValueChange={(v) => setNewProduct({ ...newProduct, weightSize: { ...newProduct.weightSize, unit: v } })}>
                              <SelectTrigger className="form-select-trigger w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["g", "kg", "ml", "L", "lb", "capsules", "tablets"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Expiry Date</label>
                          <input className="form-input" type="date" value={newProduct.expiryDate} onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Dosage Instructions</label>
                          <input className="form-input" value={newProduct.dosageInstructions} onChange={(e) => setNewProduct({ ...newProduct, dosageInstructions: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {editStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="form-grid">
                        <div className="form-field form-field-full">
                          <label className="form-label">Visual Assets (Max 5)</label>
                          <div className="flex gap-3 mb-4">
                            <input className="form-input flex-1" placeholder="Image URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                            <button type="button" className="btn-secondary" onClick={addImageFromUrl}>Add URL</button>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                            <button
                              onClick={addImageFromFile}
                              disabled={productImages.length >= 5}
                              className="upload-dropzone min-h-0 aspect-square p-0 flex flex-col items-center justify-center gap-1 border-2"
                            >
                              <Upload className="w-5 h-5 text-blue-500" />
                              <span className="text-[10px] font-bold">Upload</span>
                            </button>
                            {productImages.map((img) => (
                              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                                <img src={img.url} className="w-full h-full object-cover" alt="Preview" />
                                <button
                                  onClick={() => removeImage(img.id)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Meta Title</label>
                          <input className="form-input" value={newProduct.metaTitle} onChange={(e) => setNewProduct({ ...newProduct, metaTitle: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Meta Description</label>
                          <input className="form-input" value={newProduct.metaDescription} onChange={(e) => setNewProduct({ ...newProduct, metaDescription: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center gap-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => editStep > 1 ? setEditStep(editStep - 1) : setShowEditModal(false)}
                  >
                    {editStep === 1 ? "Cancel" : "Previous"}
                  </button>
                  <div className="flex gap-3">
                    {editStep < 4 ? (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setEditStep(editStep + 1)}
                      >
                        Next Step <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    ) : (
                      <button onClick={handleEditProduct} disabled={isLoading} className="btn-primary">
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                        ) : (
                          "Update Product"
                        )}
                      </button>
                    )}
                  </div>
                </div>
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
