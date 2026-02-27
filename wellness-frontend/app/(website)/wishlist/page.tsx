"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/formatters";

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return; // Not logged in
      }
      const res = await fetch(`${API_URL}/v1/wishlist/my-wishlist`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // If backend returns HTML (404/500), log it and throw error
        console.error("API Error (Non-JSON):", await res.text());
        throw new Error("Invalid API response");
      }

      if (!res.ok) throw new Error(`Failed to fetch wishlist: ${res.statusText}`);
      const data = await res.json();
      if (data.success) {
        setWishlistItems(data.data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    const result = await Swal.fire({
      title: "Remove Item?",
      text: "Are you sure you want to remove this from your wishlist?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, remove it!",
      background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#0f172a",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${API_URL}/v1/wishlist/remove/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("API Error (Non-JSON):", await res.text());
        throw new Error("Invalid API response");
      }

      if (!res.ok) throw new Error("Failed to remove item");
      const data = await res.json();
      if (data.success) {
        setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
        Swal.fire({
          title: "Removed",
          text: "Item removed from wishlist",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      Swal.fire("Error", "Could not remove item", "error");
    }
  };

  const handleAddToCart = (product: any) => {
    setAddingId(product._id);
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price?.amount || 0,
      image: product.images?.[0] || "/placeholder.png",
    });

    Swal.fire({
      title: "Added to Cart",
      text: `${product.name} is now in your cart`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });

    setTimeout(() => setAddingId(null), 2000);
  };

  const isInCart = (productId: string) => {
    return cartItems.some((item) => item.id === productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 relative z-10"
        >
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Wishlist
              </span>
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-pink-500 fill-pink-500 animate-pulse" />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-24 px-4 text-center relative z-10"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-blue-900/5"
            >
              <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-lg">
              Looks like you haven&apos;t added anything to your wishlist yet. Explore our products and save your favorites!
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full px-8 h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10"
          >
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((product, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={product._id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-blue-900/20 hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-500 relative flex flex-col h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-800/50 p-6">
                    <Image
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-lg border border-slate-100 dark:border-slate-800"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <Link href={`/product/${product.slug}`} className="block flex-1 mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatPrice ? formatPrice(product.price?.amount || 0) : `₹${product.price?.amount?.toFixed(2)}`}
                      </p>
                    </Link>

                    <div className="mt-auto">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={isInCart(product._id)}
                        className={`w-full rounded-xl h-11 font-medium transition-all duration-300 ${isInCart(product._id)
                            ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                            : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-slate-200 hover:shadow-lg hover:shadow-blue-600/20"
                          }`}
                      >
                        {addingId === product._id ? (
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                          >
                            <Check className="w-4 h-4 mr-2" />
                          </motion.div>
                        ) : isInCart(product._id) ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
