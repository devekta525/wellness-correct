"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchProducts as fetchProductsApi } from "../../lib/apiProducts";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  SlidersHorizontal,
  ShoppingCart,
  Filter,
  X,
  Star,
  Sparkles,
  Heart,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Image1 from "../../../public/1.jpg";
import { formatPrice } from "@/lib/formatters";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  slug: string;
  name: string;
  images: string[];
  price?: {
    amount: number;
    mrp?: number;
  };
  shortDescription?: string;
  category?: string;
  createdAt: string;
  inStock?: boolean;
  stockQuantity?: number;
  for?: string;
  with?: string;
  badge?: string;
  tagline?: string;
  rating?: number;
  reviews?: number;
}

// Hero Section Component
const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-950">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent dark:from-blue-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent dark:from-indigo-900/20" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-[30%] -left-[10%] w-[600px] h-[600px] bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 items-center gap-12 min-h-[calc(100vh-80px)] py-20 lg:py-0">
          {/* Text Left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-sm font-semibold mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Premium Wellness Collection</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-8">
              Built by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Science.
              </span>
              <br />
              Tested by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                You.
              </span>
            </h1>
            <p className="max-w-xl mx-auto lg:mx-0 text-lg text-slate-600 dark:text-slate-300 mb-10">
              From cellular repair to gut balance. The 4-step foundation of
              daily longevity, crafted with the purest ingredients and backed by
              rigorous testing.
            </p>
            <Button
              onClick={() =>
                document
                  .getElementById("product-grid")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-lg px-10 py-7 rounded-full shadow-xl shadow-slate-900/10 dark:shadow-white/5 transition-all hover:-translate-y-1 hover:scale-105"
            >
              Explore Our Products
            </Button>
          </motion.div>

          {/* Image Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative flex justify-center items-center h-full"
          >
            <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] lg:w-[500px] lg:h-[600px] group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-full blur-3xl" />
              <Image
                src={Image1}
                alt="Wellness Fuel product display"
                fill
                className="object-contain drop-shadow-2xl z-10 transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Filter & Grid Section

const ProductGrid = () => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const ABSOLUTE_MIN_PRICE = 0;
  const ABSOLUTE_MAX_PRICE = 10000;
  const [priceRange, setPriceRange] = useState({
    min: ABSOLUTE_MIN_PRICE,
    max: ABSOLUTE_MAX_PRICE,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter(); // Keep for potential future use (e.g., go to cart)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const addToWishlist = async (productId: string) => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("authToken");

      if (!token) {
        Swal.fire("Login Required", "Please login first", "warning");
        return;
      }

      const response = await fetch(`${API_URL}/v1/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire("Added to Wishlist ❤️", data.message, "success");
      } else {
        Swal.fire("Info", data.message, "info");
      }
    } catch (error) {
      Swal.fire("Error", "Could not add to wishlist", "error");
    }
  };

  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchProductsApi();
        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.message || "Failed to fetch products");
        }
      } catch (err) {
        setError("Failed to fetch products");
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Best selling", value: "best-selling" },
    { label: "Alphabetically, A-Z", value: "title-ascending" },
    { label: "Alphabetically, Z-A", value: "title-descending" },
    { label: "Price, low to high", value: "price-ascending" },
    { label: "Price, high to low", value: "price-descending" },
    { label: "Date, old to new", value: "created-ascending" },
    { label: "Date, new to old", value: "created-descending" },
  ];

  const categoryNames: { [key: string]: string } = {
    antioxidant: "Advanced Antioxidant Formulations",
    glutathione: "Glutathione-Based Wellness",
    brightening: "Skin Brightening & Pigmentation",
    "anti-aging": "Anti-Aging & Radiance",
    "liver-detox": "Liver Detox Support",
    immunity: "Immunity-Boosting Nutraceuticals",
    vitality: "Heart, Brain & Eye Health",
    cellular: "Cellular Defense Protection",
    fssai: "FSSAI-Compliant Products",
    premium: "Premium Ingredient Sourcing",
    gut: "Gut Health Solutions",
    nutraceutical: "Nutraceutical Development",
  };

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const displayTitle = categoryFilter
    ? categoryNames[categoryFilter] ||
    categoryFilter
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    : "All Products";

  const sortedProducts = useMemo(() => {
    let filtered = [...products];
    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // In stock filter
    if (inStockOnly) {
      filtered = filtered.filter(
        (p) => p.inStock !== false && p.stockQuantity !== 0,
      );
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const amount = p.price?.amount || 0;
      return amount >= priceRange.min && amount <= priceRange.max;
    });

    // Return a new sorted array to avoid mutation
    switch (sortBy) {
      case "title-ascending":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "title-descending":
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      case "price-ascending":
        return [...filtered].sort(
          (a, b) => (a.price?.amount || 0) - (b.price?.amount || 0),
        );
      case "price-descending":
        return [...filtered].sort(
          (a, b) => (b.price?.amount || 0) - (a.price?.amount || 0),
        );
      case "created-ascending":
        return [...filtered].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "created-descending":
        return [...filtered].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      default:
        return filtered;
    }
  }, [
    products,
    categoryFilter,
    sortBy,
    inStockOnly,
    priceRange.min,
    priceRange.max,
  ]);
  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label;

  if (loading) {
    return (
      <div
        id="product-grid"
        className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16"
      >
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-64 animate-pulse mb-3" />
        <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse mb-8" />
        <div className="flex justify-between items-center mb-8 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                <div className="space-y-2 px-2">
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-20 text-center text-red-600 font-bold text-xl">
        {error}
      </div>
    );
  }
  return (
    <div
      id="product-grid"
      className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16"
    >
      {/* Category Title */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#113A46] dark:text-white tracking-tight mb-4">
          {displayTitle}
        </h2>
        <div className="h-2 w-24 bg-blue-600 rounded-full"></div>
      </div>
      {/* Top Bar for Mobile + Sort has been consolidated into the Product Grid header */}

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-50 lg:hidden shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Filters
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-8">
                {categoryFilter && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      handleCategoryChange(null);
                      setShowMobileFilters(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Categories
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => {
                          handleCategoryChange(null);
                          setShowMobileFilters(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryFilter ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        All Products
                      </button>
                    </li>
                    {Object.entries(categoryNames).map(([slug, name]) => (
                      <li key={slug}>
                        <button
                          onClick={() => {
                            handleCategoryChange(slug);
                            setShowMobileFilters(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === slug ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      In stock only
                    </span>
                    <Switch
                      checked={inStockOnly}
                      onCheckedChange={setInStockOnly}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                      Price Range
                    </h4>

                    {/* Mobile Price Range Slider */}
                    <div className="space-y-6 pt-2">
                      <div className="relative h-[4px] bg-slate-200 dark:bg-slate-700 rounded-full mx-2">
                        <div
                          className="absolute h-full bg-[#35565c] rounded-full"
                          style={{
                            left: `${(priceRange.min / ABSOLUTE_MAX_PRICE) * 100}%`,
                            right: `${100 - (priceRange.max / ABSOLUTE_MAX_PRICE) * 100}%`,
                          }}
                        />

                        {/* Hidden True Inputs to actuate sliding */}
                        <input
                          type="range"
                          min={ABSOLUTE_MIN_PRICE}
                          max={ABSOLUTE_MAX_PRICE}
                          step="10"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              min: Math.min(
                                Number(e.target.value),
                                prev.max - 10,
                              ),
                            }))
                          }
                          className="absolute appearance-none w-full -top-2 h-4 opacity-0 cursor-pointer pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6"
                        />
                        <input
                          type="range"
                          min={ABSOLUTE_MIN_PRICE}
                          max={ABSOLUTE_MAX_PRICE}
                          step="10"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: Math.max(
                                Number(e.target.value),
                                prev.min + 10,
                              ),
                            }))
                          }
                          className="absolute appearance-none w-full -top-2 h-4 opacity-0 cursor-pointer pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6"
                        />

                        {/* Visual Thumbs */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#35565c] rounded-full shadow pointer-events-none"
                          style={{
                            left: `calc(${(priceRange.min / ABSOLUTE_MAX_PRICE) * 100}% - 8px)`,
                          }}
                        ></div>
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#35565c] rounded-full shadow pointer-events-none"
                          style={{
                            left: `calc(${(priceRange.max / ABSOLUTE_MAX_PRICE) * 100}% - 8px)`,
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange((prev) => ({
                                ...prev,
                                min: Number(e.target.value) || 0,
                              }))
                            }
                            className="w-full pl-7 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent dark:text-white"
                          />
                        </div>
                        <span className="text-slate-400 text-sm">to</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange((prev) => ({
                                ...prev,
                                max: Number(e.target.value) || 0,
                              }))
                            }
                            className="w-full pl-7 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar Filters */}
        <div className="hidden lg:block w-[240px] flex-shrink-0">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-6 font-semibold text-lg">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 py-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                In stock only
              </span>
              <Switch
                checked={inStockOnly}
                onCheckedChange={setInStockOnly}
                className="data-[state=checked]:bg-[#127a6f]"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 py-6">
            <div className="flex items-center justify-between w-full mb-6 font-bold text-slate-800 dark:text-slate-200">
              <span>Price</span>
              <div className="w-6 h-6 rounded-full bg-[#35565c] text-white flex items-center justify-center">
                <ChevronDown className="w-4 h-4 rotate-180" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="relative h-[4px] bg-slate-200 dark:bg-slate-700 rounded-full mx-2">
                <div
                  className="absolute h-full bg-[#35565c] rounded-full"
                  style={{
                    left: `${(priceRange.min / ABSOLUTE_MAX_PRICE) * 100}%`,
                    right: `${100 - (priceRange.max / ABSOLUTE_MAX_PRICE) * 100}%`,
                  }}
                />

                {/* Hidden True Inputs to actuate sliding */}
                <input
                  type="range"
                  min={ABSOLUTE_MIN_PRICE}
                  max={ABSOLUTE_MAX_PRICE}
                  step="10"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      min: Math.min(Number(e.target.value), prev.max - 10),
                    }))
                  }
                  className="absolute appearance-none w-full -top-2 h-4 opacity-0 cursor-pointer pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6"
                />
                <input
                  type="range"
                  min={ABSOLUTE_MIN_PRICE}
                  max={ABSOLUTE_MAX_PRICE}
                  step="10"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      max: Math.max(Number(e.target.value), prev.min + 10),
                    }))
                  }
                  className="absolute appearance-none w-full -top-2 h-4 opacity-0 cursor-pointer pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6"
                />

                {/* Visual Thumbs */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#35565c] rounded-full shadow pointer-events-none"
                  style={{
                    left: `calc(${(priceRange.min / ABSOLUTE_MAX_PRICE) * 100}% - 8px)`,
                  }}
                ></div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#35565c] rounded-full shadow pointer-events-none"
                  style={{
                    left: `calc(${(priceRange.max / ABSOLUTE_MAX_PRICE) * 100}% - 8px)`,
                  }}
                ></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full pl-7 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-[#35565c]"
                  />
                </div>
                <span className="text-slate-500 text-sm">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full pl-7 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-[#35565c]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1">
          {/* Top Bar (Active Filters & Sort) */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 mt-2 lg:mt-0 xl:gap-4">
            <div className="flex items-center flex-wrap gap-2 w-full xl:w-auto">
              <Button
                variant="outline"
                className="lg:hidden gap-2 border-slate-200 mr-2"
                onClick={() => setShowMobileFilters(true)}
              >
                <Filter className="w-4 h-4" /> Filters
              </Button>
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f0f4f4] dark:bg-slate-800 text-sm font-semibold text-[#113A46] dark:text-slate-300 transition-colors border border-transparent hover:border-slate-300">
                  In stock
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="hover:text-black dark:hover:text-white ml-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {(priceRange.min > ABSOLUTE_MIN_PRICE ||
                priceRange.max < ABSOLUTE_MAX_PRICE) && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f0f4f4] dark:bg-slate-800 text-sm font-semibold text-[#113A46] dark:text-slate-300 transition-colors border border-transparent hover:border-slate-300">
                    Rs. {priceRange.min.toLocaleString("en-IN")} - Rs.{" "}
                    {priceRange.max.toLocaleString("en-IN")}
                    <button
                      onClick={() =>
                        setPriceRange({
                          min: ABSOLUTE_MIN_PRICE,
                          max: ABSOLUTE_MAX_PRICE,
                        })
                      }
                      className="hover:text-black dark:hover:text-white ml-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
              {(inStockOnly ||
                priceRange.min > ABSOLUTE_MIN_PRICE ||
                priceRange.max < ABSOLUTE_MAX_PRICE) && (
                  <button
                    onClick={() => {
                      setInStockOnly(false);
                      setPriceRange({
                        min: ABSOLUTE_MIN_PRICE,
                        max: ABSOLUTE_MAX_PRICE,
                      });
                    }}
                    className="text-sm font-semibold text-[#113A46] dark:text-slate-300 hover:underline underline-offset-4 ml-3"
                  >
                    Clear all
                  </button>
                )}
            </div>

            <div className="relative shrink-0 z-20 self-end xl:self-auto">
              <div className="flex items-center gap-1.5 text-[#113A46] dark:text-slate-200">
                <span className="text-sm font-bold">Sort by:</span>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-1 text-sm bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-1.5 rounded transition-colors"
                >
                  {currentSortLabel}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              {/* Dropdown Menu */}
              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800
                                  ${sortBy === option.value ? "font-bold text-[#127a6f]" : "text-slate-600 dark:text-slate-400"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 lg:py-32 w-full">
              <div className="relative mb-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#113A46] dark:border-slate-500 flex items-center justify-center bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <div className="w-16 h-[2.5px] bg-[#113A46] dark:bg-slate-500 rotate-45" />
                </div>
                <div className="absolute -top-1 -right-2 w-6 h-6 bg-[#127a6f] rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                  0
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-[#113A46] dark:text-white mb-8 tracking-tight">
                No products match those filters.
              </h3>
              <Button
                onClick={() => {
                  setInStockOnly(false);
                  setPriceRange({
                    min: ABSOLUTE_MIN_PRICE,
                    max: ABSOLUTE_MAX_PRICE,
                  });
                  handleCategoryChange(null);
                }}
                className="bg-[#127a6f] hover:bg-[#0e635a] text-white rounded-full px-8 py-6 text-base font-bold shadow-md transition-all hover:scale-105"
              >
                Clear all
              </Button>
            </div>
          ) : (
            <motion.div
              layout
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {sortedProducts.map((product) => {
                  const formattedProduct = {
                    id: product._id,
                    slug: product.slug,
                    name: product.name,
                    images: product.images,
                    price: product.price?.amount || 0,
                    originalPrice: product.price?.mrp,
                    category: product.category,
                    description: product.shortDescription,
                    inStock:
                      product.inStock !== false && product.stockQuantity !== 0,
                    for: product.for,
                    with: product.with,
                    badge: product.badge,
                    tagline: product.tagline,
                    rating: product.rating,
                    reviews: product.reviews,
                  };

                  return (
                    <motion.div
                      layout
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 },
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      key={product._id}
                      className="h-full"
                    >
                      <ProductCard product={formattedProduct} viewMode="grid" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const CollabPage = ({ showHero = true }: { showHero?: boolean }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {showHero && <Hero />}
      <React.Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <ProductGrid />
      </React.Suspense>
    </div>
  );
};

export default CollabPage;
