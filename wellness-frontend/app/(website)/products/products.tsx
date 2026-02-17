"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Grid3X3,
  List,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/wishlistContext";
import CommonHero from "@/components/common/common-hero";
import { formatPrice } from "@/lib/formatters";

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchProductsData,
  setFilters,
  selectProductsData,
  selectProductsLoading,
} from "@/lib/redux/features/productSlice";

interface UIProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge: string | null;
  rating: number;
  reviews: number;
  inStock: boolean;
  description: string;
  tags: string[];
}

const categories = [
  "All Categories",
  "Nutraceutical Development",
  "Skin Health",
  "Detox & Immunity",
  "Preventive Health",
  "Quality Assurance",
  "Supplements",
  "Wellness",
];

const sortOptions = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "price-asc", label: "Price Low to High" },
  { value: "price-desc", label: "Price High to Low" },
  { value: "newest", label: "Newest First" },
];

const ProductsPage = () => {
  const dispatch = useAppDispatch();

  // Redux State
  const reduxProducts = useAppSelector(selectProductsData);
  const isLoading = useAppSelector(selectProductsLoading);

  // Contexts
  const { addToCart, cartItems } = useCart();
  const { toggleWishlistItem, isInWishlist } = useWishlist();

  // Local UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("name-asc");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Fetch Data on Mount
  useEffect(() => {
    dispatch(setFilters({ status: "active" }));
    dispatch(fetchProductsData());
  }, [dispatch]);

  // Transform Redux Data to UI Format
  const formattedProducts: UIProduct[] = useMemo(() => {
    if (!reduxProducts || reduxProducts.length === 0) return [];

    const products = reduxProducts.map((p) => {
      const currentPrice = p.price.amount;
      const mrp = p.price.mrp || currentPrice;

      let badge = null;
      if (p.stockQuantity < 10 && p.stockQuantity > 0) badge = "Low Stock";
      else if (p.stockQuantity === 0) badge = "Out of Stock";
      else if (mrp > currentPrice) badge = "Sale";

      return {
        id: p._id,
        name: p.name,
        category: p.category,
        price: currentPrice,
        originalPrice: mrp > currentPrice ? mrp : undefined,
        imageUrl:
          p.imageUrl ||
          (p.images && p.images.length > 0 ? p.images[0] : "/placeholder.png"),
        badge: badge,
        rating: 4.8,
        reviews: 45,
        inStock: p.stockQuantity > 0 && p.status === "active",
        description: p.shortDescription || p.description || "",
        tags: p.benefits || [],
      };
    });

    const highestPrice = Math.max(...products.map((p) => p.price), 1000);
    if (highestPrice !== maxPrice && highestPrice > 0) {
      setMaxPrice(highestPrice);
      setPriceRange([0, highestPrice]);
    }

    return products;
  }, [reduxProducts, maxPrice]);

  // Filter and Sort Products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = formattedProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All Categories" ||
        product.category === selectedCategory;

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, priceRange, formattedProducts]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < Math.floor(rating)
          ? "text-yellow-400 fill-current"
          : "text-gray-300"
          }`}
      />
    ));
  };

  // Product Card Component
  const ProductCard = ({ product }: { product: UIProduct }) => {
    const cartItem = cartItems.find((item) => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    return (
    <motion.div
      className={`bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/30 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 ${viewMode === "list" ? "flex-row" : ""
        }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`relative ${viewMode === "list" ? "w-48 h-48" : "aspect-square w-full"}`}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={
            viewMode === "list"
              ? "192px"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
        {product.badge && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
            {product.badge}
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <div
        className={`p-6 flex flex-col flex-grow ${viewMode === "list" ? "flex-1" : ""}`}
      >
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-semibold">
          {product.category}
        </p>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex-grow">
          {product.name}
        </h3>

        {viewMode === "grid" && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-slate-600">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-slate-500 dark:text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-3">
          <Button
            onClick={() =>
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.imageUrl,
              })
            }
            disabled={!product.inStock}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-full shadow-xl shadow-blue-500/50 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.inStock ? (quantityInCart > 0 ? `Add Another (${quantityInCart})` : "Add to Cart") : "Out of Stock"}
          </Button>
          <Button
            onClick={() =>
              toggleWishlistItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.imageUrl,
              })
            }
            variant="outline"
            size="icon"
            className="rounded-xl border-2 hover:border-red-500 hover:text-red-500"
            title="Add to Wishlist"
          >
            <Heart
              className={`w-5 h-5 transition-all ${isInWishlist(product.id)
                ? "text-red-500 fill-current"
                : "text-slate-600"
                }`}
            />
          </Button>
        </div>
      </div>
    </motion.div>
    );
  };

  // ... (rest of the return statement remains exactly the same as previous code)
  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 min-h-screen">
      <CommonHero
        title="Our Products"
        description="Discover our premium collection of wellness products designed to support your health journey."
        image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop"
        breadcrumbs={[{ label: "Products", href: "/products" }]}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/30 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl border-2 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600"
              />
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:outline-none dark:bg-slate-700 dark:text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-xl"
                >
                  <Grid3X3 className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-xl"
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 rounded-xl"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </Button>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <motion.div
              className="lg:hidden mt-6 pt-6 border-t border-slate-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:outline-none dark:bg-slate-700 dark:text-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/30 p-6 sticky top-8">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Category
                </h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700"
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Price Range
                </h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Categories");
                  setPriceRange([0, maxPrice]);
                  setSortBy("name-asc");
                }}
                className="w-full rounded-xl"
              >
                Clear All Filters
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                Showing {isLoading ? 0 : startIndex + 1}-
                {Math.min(endIndex, filteredAndSortedProducts.length)} of{" "}
                {filteredAndSortedProducts.length} products
              </p>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Products */}
                <div
                  className={`grid gap-6 ${viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                    }`}
                >
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* No Results */}
                {currentProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No products found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All Categories");
                        setPriceRange([0, maxPrice]);
                      }}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white rounded-full shadow-xl shadow-blue-500/50"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className={`rounded-xl ${currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg"
                            : ""
                            }`}
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-xl"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;