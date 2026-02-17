"use client";

import { CartProvider } from "@/lib/context/CartContext";
import { WishlistProvider } from "@/lib/context/wishlistContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}
