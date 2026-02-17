"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface WishlistItem {
  id: string; // CHANGED from number to string
  name: string;
  price: number;
  imageUrl: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  toggleWishlistItem: (product: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean; // CHANGED from number to string
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const WISHLIST_STORAGE_KEY = "wellness_wishlist";

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setWishlistItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }, []);

  // Save to localStorage on change
  React.useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  }, [wishlistItems]);

  const toggleWishlistItem = (product: WishlistItem) => {
    setWishlistItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        toast.error(`"${product.name}" removed from wishlist.`);
        return prevItems.filter((item) => item.id !== product.id);
      } else {
        toast.success(`"${product.name}" added to wishlist!`);
        return [...prevItems, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, toggleWishlistItem, isInWishlist, wishlistCount }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};