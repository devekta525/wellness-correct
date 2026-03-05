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

export default function ProductCard({ product, viewMode = "grid" }) {
  const [imageIndex, setImageIndex] = useState(0);
  const dispatch = useDispatch();

  // Safely get context
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const isInWishlist = (id) => wishlistItems.some((item) => item.id === id);

  const isList = viewMode === "list";

  // Unified identifier
  const productId = product?._id || product?.id;

  // Format data dynamically to handle both sources
  // Backend returns price as an object { amount, mrp, currency }, Redux/Homepage may use flat values
  let currentPrice = 0;
  let orgPrice = 0;

  if (typeof product?.price === "object" && product?.price !== null) {
    currentPrice = product.price.amount || 0;
    orgPrice = product.price.mrp || product.originalPrice || 0;
  } else {
    currentPrice = product?.price || 0;
    orgPrice = product?.originalPrice || 0;
  }

  const savings =
    orgPrice && orgPrice > currentPrice ? orgPrice - currentPrice : 0;
  const isOutOfStock =
    product?.stockQuantity === 0 || product?.inStock === false;

  // build a safe array of image URLs; the data coming straight from the
  // public API can contain objects or empty strings so we coerce to a
  // string and run through `getImageUrl`.  We also filter out anything
  // falsy so the sliding logic never tries to render a bad entry.
  const images = (
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : []
  )
    .map((u) => {
      // some endpoints return objects like { url: '/foo' }
      const raw = typeof u === "string" ? u : u?.url || "";
      return getImageUrl(raw);
    })
    .filter((src) => !!src);

  const IMAGE_COUNT = images.length > 0 ? images.length : 1;

  const goToImage = useCallback(
    (idx) => {
      setImageIndex(idx % IMAGE_COUNT);
    },
    [IMAGE_COUNT],
  );

  useEffect(() => {
    if (IMAGE_COUNT <= 1) return;
    const t = setInterval(() => {
      setImageIndex((i) => (i + 1) % IMAGE_COUNT);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(t);
  }, [IMAGE_COUNT]);

  const cartItem = cartItems?.find((item) => item.id === productId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

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
    <div
      className={`product-card group relative bg-white dark:bg-slate-800/90 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-100/60 dark:hover:shadow-blue-900/40 min-w-0 h-full ${isList ? "flex flex-col sm:flex-row" : "flex flex-col"}`}
    >
      {/* ── Image Section ── */}
      <div
        className={`relative bg-slate-100 dark:bg-slate-800 ${isList ? "w-full sm:w-48 h-48 sm:h-auto min-h-[200px] shrink-0" : "w-full aspect-[4/5]"} overflow-hidden`}
      >
        {IMAGE_COUNT > 0
          ? [...Array(IMAGE_COUNT)].map((_, idx) => {
            const src = images[idx] || "/placeholder-product.svg";
            const isPlaceholder = src.endsWith("/placeholder-product.svg");
            return (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${idx === imageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                aria-hidden={idx !== imageIndex}
              >
                {isPlaceholder ? (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
                    Placeholder {idx + 1}
                  </div>
                ) : (
                  <Image
                    src={src}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes={
                      isList
                        ? "192px"
                        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    }
                  />
                )}
              </div>
            );
          })
          : null}

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white text-slate-400 hover:text-red-500 transition-all shadow-sm"
          aria-label="Toggle Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-all ${isInWishlist(productId) ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>

        {/* Badge Overlay */}
        {product.badge && (
          <Badge className="absolute top-3 left-3 z-30 bg-linear-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg pointer-events-none">
            {product.badge}
          </Badge>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-bold tracking-wide px-4 py-2 border-2 border-white/50 rounded-xl backdrop-blur-md">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Nav dots */}
        {IMAGE_COUNT > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-1.5">
            {[...Array(IMAGE_COUNT)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToImage(i);
                }}
                aria-label={`View image ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${i === imageIndex
                  ? "w-2 h-2 bg-blue-600 shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                  : "w-1.5 h-1.5 bg-white/80 hover:bg-white"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div
        className={`p-5 flex flex-col grow ${isList ? "justify-center" : ""}`}
      >
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          {product.category && (
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              {product.category}
            </span>
          )}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < (product.rating || 5)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200 fill-slate-100 dark:text-slate-700 dark:fill-slate-800"
                  }`}
              />
            ))}
            <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 font-medium">
              ({product.reviews || 0})
            </span>
          </div>
        </div>

        {/* Product name */}
        <div className="min-h-[3.5rem] mb-1">
          <h3 className="font-serif font-bold text-[16px] leading-snug text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Tagline / Description */}
        <div className="min-h-[2.5rem] mb-4">
          {(product.tagline ||
            product.description ||
            product.shortDescription) ? (
            <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2">
              {product.tagline ? (
                <span className="italic">{product.tagline}</span>
              ) : (
                product.shortDescription || product.description
              )}
            </p>
          ) : (
            <div className="h-full" /> // Placeholder to maintain height
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center flex-wrap gap-2.5 mb-4">
          <span className="text-xl font-extrabold bg-linear-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>
          {savings > 0 && (
            <>
              <span className="text-sm text-slate-400 dark:text-slate-500 line-through font-medium">
                ₹{orgPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-lg">
                Save ₹{savings.toLocaleString("en-IN")}
              </span>
            </>
          )}
        </div>

        {/* For / With (Render with min-height to ensure alignment) */}
        {!isList && (
          <div className="space-y-2 mb-5 min-h-[4.5rem]">
            {product.for && (
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5 text-[9px] font-extrabold text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-800 border border-blue-100 px-2 py-0.5 rounded-lg tracking-wide uppercase">
                  FOR
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                  {Array.isArray(product.for)
                    ? product.for.join(", ")
                    : product.for}
                </p>
              </div>
            )}
            {product.with && (
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5 text-[9px] font-extrabold text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:border-cyan-800 border border-cyan-100 px-2 py-0.5 rounded-lg tracking-wide uppercase">
                  WITH
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {Array.isArray(product.with)
                    ? product.with.join(", ")
                    : product.with}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-4" />

        {/* Action buttons */}
        <div className="flex gap-2.5">
          <Link
            href={`/product/${product.slug || productId}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-2 border-blue-100 dark:border-slate-700 text-blue-700 dark:text-blue-400 rounded-xl text-[12px] font-bold hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <Eye className="w-3.5 h-3.5" />
            Explore
          </Link>

          <button
            onClick={handleCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 ${isOutOfStock
              ? "bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed"
              : quantityInCart > 0
                ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 hover:scale-[1.02]"
                : "bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 hover:scale-[1.02]"
              }`}
          >
            {quantityInCart > 0 ? (
              <span className="flex items-center gap-1.5">
                ✓ Added ({quantityInCart})
              </span>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
