"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ShoppingCart,
  Sparkles,
  Heart,
  BadgePercent,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/formatters";
import { getApiV1Url } from "@/lib/utils/api";

// Define the Product interface based on expected API response
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

const ScienceFeatured = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // The API endpoint is /v1/products/public on the backend.
        const res = await fetch(getApiV1Url("/products/public"));
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        if (data.success) {
          // Take the first 5 products for the featured collection
          setProducts(data.data.slice(0, 5));
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
    // Optional: Render a loading skeleton here
    return (
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-64 animate-pulse" />
              <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-40 animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse hidden sm:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[...Array(5)].map((_, i) => (
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
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render the section if there are no products
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                Top Picks
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Featured{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Collection
              </span>
            </h2>
          </div>

          <Link
            href="/products"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:shadow-md"
          >
            <span className="font-medium">View all products</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
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
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="group block h-full"
                >
                  <div className="relative h-full flex flex-col">
                    {/* Image Card */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:shadow-xl group-hover:shadow-blue-900/5 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-all duration-500">
                      {/* Badges & Actions */}
                      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                        {discount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <BadgePercent className="w-3 h-3" />
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      <button
                        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Heart className="w-4 h-4" />
                      </button>

                      {/* Image */}
                      <div className="absolute inset-0 p-8 flex items-center justify-center">
                        <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-110">
                          <Image
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            fill
                            className={`object-contain transition-opacity duration-500 ${product.images?.[1] ? "group-hover:opacity-0" : ""}`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                          />
                          {product.images?.[1] && (
                            <Image
                              src={product.images[1]}
                              alt={product.name}
                              fill
                              className="object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                            />
                          )}
                        </div>
                      </div>

                      {/* Quick Add Button - Slide Up */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl h-11 font-medium flex items-center justify-center gap-2 backdrop-blur-sm">
                          <ShoppingCart className="w-4 h-4" />
                          Quick Add
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="mt-5 space-y-1.5 px-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(product.price?.amount || 0)}
                        </span>
                        {product.price?.mrp && (
                          <span className="text-sm text-slate-400 line-through decoration-slate-400/50">
                            {formatPrice(product.price.mrp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ScienceFeatured;
