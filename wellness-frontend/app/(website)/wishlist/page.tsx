"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { removeFromWishlist } from "@/lib/redux/features/wishlistSlice";
import { addToCart } from "@/lib/redux/features/cartSlice";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items || []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
              Your Wishlist
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-slate-300 dark:text-slate-500 stroke-1" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              Save your favorite items here to easily find them later.
            </p>
            <Link href="/shop">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 shadow-lg shadow-blue-500/20 text-lg">
                Explore Products
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            layout
          >
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-blue-900/20 border border-slate-100 dark:border-slate-700 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => dispatch(removeFromWishlist(item.id))}
                    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-900/30 transition-all group/heart"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 group-hover/heart:text-red-500 transition-colors" />
                  </button>

                  <Link href={`/product/${item.id}`} className="block relative w-full aspect-square bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                    <Image
                      src={item.image || "/placeholder-product.svg"}
                      alt={item.name}
                      fill
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>

                  <div className="p-5 flex flex-col flex-grow">
                    <Link href={`/product/${item.id}`} className="block">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 transition-colors h-14">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {formatPrice(item.price)}
                      </span>

                      <Button
                        onClick={() => {
                          dispatch(addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image
                          }));
                          // dispatch(removeFromWishlist(item.id)); // Requirement says "Optionally remove it from wishlist"
                        }}
                        size="icon"
                        className="rounded-full bg-slate-900 hover:bg-blue-600 text-white shadow-md transition-all duration-300 w-10 h-10 shrink-0"
                      >
                        <ShoppingCart className="w-4 h-4" />
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
}
