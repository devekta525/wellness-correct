"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { addToCart } from "@/lib/redux/features/cartSlice";
import { toggleWishlist } from "@/lib/redux/features/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils/getImageUrl";
import {
  ShoppingCart,
  Heart,
  Star,
  Eye
} from "lucide-react";

const AUTO_SLIDE_MS = 4000;

export default function ProductCard({ product }) {
  const [imageIndex, setImageIndex] = useState(0);
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const isInWishlist = (id) => wishlistItems.some((item) => item.id === id);

  const productId = product?._id || product?.id;

  let currentPrice = 0;
  let orgPrice = 0;

  if (typeof product?.price === "object" && product?.price !== null) {
    currentPrice = product.price.amount || 0;
    orgPrice = product.price.mrp || product.originalPrice || 0;
  } else {
    currentPrice = product?.price || 0;
    orgPrice = product?.originalPrice || 0;
  }

  const savings = orgPrice && orgPrice > currentPrice ? orgPrice - currentPrice : 0;
  const isOutOfStock = product?.stockQuantity === 0 || product?.inStock === false;

  const images = (
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : []
  ).map((u) => {
    const raw = typeof u === "string" ? u : u?.url || "";
    return getImageUrl(raw);
  }).filter((src) => !!src);

  const IMAGE_COUNT = images.length > 0 ? images.length : 1;

  useEffect(() => {
    if (IMAGE_COUNT <= 1) return;
    const t = setInterval(() => {
      setImageIndex((i) => (i + 1) % IMAGE_COUNT);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(t);
  }, [IMAGE_COUNT]);

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        price: currentPrice,
        image: getImageUrl(product.imageUrl || images[0] || ""),
      })
    );
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist({
      id: productId,
      name: product.name,
      price: currentPrice,
      image: getImageUrl(product.imageUrl || images[0] || ""),
    }));
  };

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 flex flex-col h-full bg-slate-50/20">
      {/* ── Image Section ── */}
      <div className="relative w-full aspect-square sm:aspect-[4/5] overflow-hidden bg-slate-100">
        {images.length > 0 ? (
          <Image
            src={images[imageIndex] || "/placeholder-product.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
            No Image
          </div>
        )}

        {/* Wishlist Icon */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:bg-white"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${isInWishlist(productId) ? "fill-red-500 text-red-500" : "text-slate-400"}`}
          />
        </button>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 z-20 px-2 py-1 bg-blue-600 text-white text-[9px] font-bold rounded-lg uppercase tracking-wider">
            {product.badge}
          </span>
        )}
      </div>

      {/* ── Content Section ── */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1.5 overflow-hidden">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">{product.rating || "5.0"}</span>
        </div>

        <Link href={`/product/${product.slug || productId}`} className="block mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-[16px] font-bold text-slate-900 leading-tight line-clamp-2 hover:text-blue-600 transition-colors h-10 sm:h-12">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base sm:text-xl font-extrabold text-blue-600 leading-none">
              ₹{currentPrice.toLocaleString("en-IN")}
            </span>
            {orgPrice > currentPrice && (
              <span className="text-[10px] sm:text-[13px] text-slate-400 line-through">
                ₹{orgPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <button
            onClick={handleCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 py-2 sm:py-3 rounded-xl text-[11px] sm:text-[13px] font-bold transition-all ${isOutOfStock
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-black active:scale-[0.98]"
              }`}
          >
            {isOutOfStock ? "Sold Out" : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
