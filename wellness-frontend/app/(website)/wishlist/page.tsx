"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/context/wishlistContext";
import { useCart } from "@/lib/context/CartContext";

const WishlistPage = () => {
  const { wishlistItems, toggleWishlistItem } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-pink-600 fill-pink-100" />
              My Wishlist
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-pink-300 dark:text-pink-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
              Looks like you haven&apos;t added anything to your wishlist yet. Explore our products and save your favorites!
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-8">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-300 relative flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleWishlistItem(item)}
                      className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-lg"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <Link href={`/product/${item.id}`} className="block flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 line-clamp-1 group-hover:text-pink-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </Link>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
