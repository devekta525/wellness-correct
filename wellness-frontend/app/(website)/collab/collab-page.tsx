"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchProducts as fetchProductsApi } from "../../lib/apiProducts";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, SlidersHorizontal, ShoppingCart, Filter, X, Star, Sparkles } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import CollabFeatured from "./collab-featured";
import Image1 from "../../../public/1.jpg";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/formatters";
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from "framer-motion";

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
					animate={{ y: [0, -20, 0], scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl"
				/>
				<motion.div
					animate={{ y: [0, 20, 0], scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
					transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
							Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Science.</span>
							<br />
							Tested by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">You.</span>
						</h1>
						<p className="max-w-xl mx-auto lg:mx-0 text-lg text-slate-600 dark:text-slate-300 mb-10">
							From cellular repair to gut balance. The 4-step foundation of daily longevity, crafted with the purest ingredients and backed by rigorous testing.
						</p>
						<Button
							onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, cartItems } = useCart();
  const router = useRouter(); // Keep for potential future use (e.g., go to cart)

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
  }, [products, categoryFilter, sortBy]);
  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label;

  if (loading) {
		return (
			<div id="product-grid" className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16">
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
									{[...Array(4)].map((_, j) => <div key={j} className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />)}
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
    <div id="product-grid" className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-16">
      {/* Category Title */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          {displayTitle}
        </h2>
        <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
      </div>
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-slate-500">
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </div>
          <Button 
            variant="outline"
            className="lg:hidden gap-2 border-slate-200" 
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Sort by:</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{currentSortLabel}</span>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
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
                                            ${sortBy === option.value ? "font-bold text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
							<div className="space-y-8">
								{categoryFilter && (
									<Button variant="outline" className="w-full" onClick={() => { handleCategoryChange(null); setShowMobileFilters(false); }}>
										Clear Filters
									</Button>
								)}
								<div>
									<h4 className="font-semibold text-slate-900 dark:text-white mb-4">Categories</h4>
									<ul className="space-y-2">
										<li>
											<button onClick={() => { handleCategoryChange(null); setShowMobileFilters(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryFilter ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>All Products</button>
										</li>
										{Object.entries(categoryNames).map(([slug, name]) => (
											<li key={slug}>
												<button onClick={() => { handleCategoryChange(slug); setShowMobileFilters(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === slug ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
													{name}
												</button>
											</li>
										))}
									</ul>
								</div>
								<div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
									<div className="flex items-center justify-between">
										<span className="font-medium text-slate-700 dark:text-slate-300">In stock only</span>
										<Switch />
									</div>
								</div>
							</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          {/* In Stock Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="font-medium text-slate-700 dark:text-slate-300">In stock only</span>
            <Switch />
          </div>
          {/* Price Filter Accordion Mock */}
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <button className="flex items-center justify-between w-full py-2 font-medium text-slate-700 dark:text-slate-300">
              <span>Price</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <motion.div 
            layout
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          >
            <AnimatePresence mode="popLayout">
            {sortedProducts.map((product) => {
              const discount = product.price?.mrp ? Math.round(((product.price.mrp - product.price.amount) / product.price.mrp) * 100) : 0;
              
              return (
								<motion.div
									layout
									variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ duration: 0.3 }}
									key={product._id}
								>
									<Link href={`/product/${product.slug}`} className="group block h-full">
										<div className="relative h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-500 overflow-hidden hover:-translate-y-1">
											<div className="relative aspect-[4/5] bg-slate-50 dark:bg-slate-800/50 overflow-hidden p-8">
												{discount > 0 && (
													<div className="absolute top-3 left-3 z-20">
														<span className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-slate-100 dark:border-slate-800">
															{discount}% OFF
														</span>
													</div>
												)}
												<div className="absolute inset-0 p-6 flex items-center justify-center">
													<div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-110">
														<Image src={product.images?.[0] || "/placeholder.png"} alt={product.name} fill className={`object-contain transition-opacity duration-500 ${product.images?.[1] ? 'group-hover:opacity-0' : ''}`} sizes="(max-width: 768px) 50vw, 33vw" />
														{product.images?.[1] && (
															<Image src={product.images[1]} alt={product.name} fill className="object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" sizes="(max-width: 768px) 50vw, 33vw" />
														)}
													</div>
												</div>
												<div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
													<Button
														className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-lg rounded-full h-12 font-medium flex items-center justify-center gap-2 transition-all"
														onClick={(e) => {
															e.preventDefault(); e.stopPropagation();
															addToCart({ id: product._id, name: product.name, price: product.price?.amount || 0, image: product.images?.[0] || "/placeholder.png" });
															Swal.fire({ title: "Added!", text: `${product.name} added to cart.`, icon: "success", timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
														}}
													>
														<ShoppingCart className="w-4 h-4" /> Quick Add
													</Button>
												</div>
											</div>
											<div className="p-6 flex flex-col flex-1">
												<div className="flex items-center gap-1 mb-2">
													{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />)}
													<span className="text-xs text-slate-400 ml-1">(4.8)</span>
												</div>
												<h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
													{product.name}
												</h3>
												{product.shortDescription && (
													<p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow">
														{product.shortDescription}
													</p>
												)}
												<div className="mt-auto flex items-baseline gap-2">
													<span className="text-xl font-bold text-slate-900 dark:text-white">
														{formatPrice(product.price?.amount || 0)}
													</span>
													{product.price?.mrp && (
														<span className="text-sm text-slate-400 line-through">
															{formatPrice(product.price.mrp)}
														</span>
													)}
												</div>
											</div>
										</div>
									</Link>
								</motion.div>
            )})}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const CollabPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Hero />
      <ProductGrid />
      <div className="pb-20">
        <CollabFeatured />
      </div>
    </div>
  );
};

export default CollabPage;
