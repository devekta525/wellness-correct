"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getApiV1Url } from "@/lib/utils/api";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/wishlistContext";
import Swal from "sweetalert2";

interface Product {
  _id: string;
  slug: string;
  name: string;
  images: string[];
  price?: {
    amount: number;
    mrp?: number;
  };
}

const FeaturedCollectionSection = () => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlistItem, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch(getApiV1Url("/products/public"));
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        if (data.success) {
          setProducts(data.data.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-[600px] flex items-center justify-center">
        <div className="animate-pulse text-blue-600 font-semibold">
          Loading Featured Collection...
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-900/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block"
            >
              Curated For You
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight"
            >
              Featured Collection
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              Handpicked wellness essentials designed to elevate your daily
              routine with science-backed formulations.
            </motion.p>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
              View All Products
            </span>
            <div className="bg-blue-50 dark:bg-slate-700 group-hover:bg-blue-600 rounded-full p-1.5 transition-colors duration-300">
              <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-white" />
            </div>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const discount = product.price?.mrp
              ? Math.round(
                  ((product.price.mrp - product.price.amount) /
                    product.price.mrp) *
                    100,
                )
              : 0;
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => router.push(`/product/${product.slug}`)}
              >
                {/* Card Container */}
                <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-4 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:shadow-blue-500/10 border border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-800/50 h-full flex flex-col">
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-6 left-6 z-20">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-red-500/30">
                        {discount}% OFF
                      </span>
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <div className="absolute top-6 right-6 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlistItem({
                          id: product._id,
                          name: product.name,
                          price: product.price?.amount || 0,
                          imageUrl: product.images?.[0] || "/placeholder.png",
                        });
                      }}
                      className={`p-2 rounded-full shadow-sm transition-all duration-300 ${
                        isInWishlist(product._id)
                          ? "bg-red-50 text-red-500 hover:bg-red-100"
                          : "bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-red-500 hover:bg-white"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${isInWishlist(product._id) ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Image Area */}
                  <div className="relative w-full aspect-[4/5] mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-slate-800/30">
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-110">
                        <Image
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          fill
                          className={`object-contain transition-opacity duration-500 ${product.images?.[1] ? "group-hover:opacity-0" : ""}`}
                        />
                        {product.images?.[1] && (
                          <Image
                            src={product.images[1]}
                            alt={product.name}
                            fill
                            className="object-contain absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          />
                        )}
                      </div>
                    </div>

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: product._id,
                            name: product.name,
                            price: product.price?.amount || 0,
                            image: product.images?.[0] || "/placeholder.png",
                          });
                          Swal.fire({
                            title: "Added to Cart!",
                            text: `${product.name} has been added to your cart.`,
                            icon: "success",
                            showCancelButton: true,
                            confirmButtonColor: "#2563eb",
                            cancelButtonColor: "#64748b",
                            confirmButtonText: "Go to Cart",
                            cancelButtonText: "Continue Shopping",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              router.push("/cart");
                            }
                          });
                        }}
                        className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-blue-600 hover:text-white text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-blue-600 rounded-xl shadow-lg h-12 font-semibold transition-all duration-300"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2 px-2 pb-2 mt-auto">
                    {/* Rating Mock */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-yellow-400 fill-current"
                        />
                      ))}
                      <span className="text-xs text-slate-400 ml-1 font-medium">
                        (4.9)
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(product.price?.amount || 0)}
                      </span>
                      {product.price?.mrp && (
                        <span className="text-sm text-slate-400 line-through font-medium">
                          {formatPrice(product.price.mrp)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollectionSection;
