"use client";

import { CartProvider } from "@/lib/context/CartContext";
import { WishlistProvider } from "@/lib/context/wishlistContext";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
        <Toaster position="bottom-right" richColors />
      </WishlistProvider>
    </CartProvider>
  );
}
