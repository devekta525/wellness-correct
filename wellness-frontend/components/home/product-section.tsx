"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Heart,
  ShoppingCart,
  Pill,
  Shield,
  Zap,
  Stethoscope,
  Activity,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchProductsData,
  setFilters,
  selectProductsData,
  selectProductsLoading,
} from "@/lib/redux/features/productSlice";
import { useCart } from "@/lib/context/CartContext";

const ProductSection = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const productsData = useAppSelector(selectProductsData);
  const isLoading = useAppSelector(selectProductsLoading);
  const { addToCart } = useCart();

  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    dispatch(setFilters({ status: "active" }));
    dispatch(fetchProductsData());
  }, [dispatch]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const getIconForCategory = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("supplement")) return Heart;
    if (cat.includes("medicine") || cat.includes("pharmacy")) return Pill;
    if (cat.includes("monitor") || cat.includes("device")) return Zap;
    if (cat.includes("first aid") || cat.includes("safety")) return Shield;
    if (cat.includes("fitness")) return Activity;
    return Stethoscope;
  };

  const displayProducts =
    productsData?.slice(0, 6).map((product) => {
      const features =
        product.benefits && product.benefits.length > 0
          ? product.benefits
          : ["Premium Quality", "Certified Authentic", "Fast Delivery"];

      const currentPrice = product.price?.amount || 0;
      const mrp = product.price?.mrp || currentPrice * 1.2;

      return {
        id: product._id,
        slug: product.slug,
        title: product.name,
        description: product.shortDescription || "Premium health product",
        features: features,
        price: `₹${currentPrice.toLocaleString("en-IN")}`,
        originalPrice: `₹${mrp.toLocaleString("en-IN")}`,
        popular: product.stockQuantity < 50,
        image:
          product.imageUrl ||
          (product.images && product.images.length > 0
            ? product.images[0]
            : ""),
        icon: getIconForCategory(product.category),
        rating: 4.8,
        reviews: 120 + Math.floor(Math.random() * 100),
      };
    }) || [];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-blue-400/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-indigo-500/8 to-indigo-400/5 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], rotate: [360, 180, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/4 to-indigo-500/4 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold mb-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ShoppingCart className="w-4 h-4 text-[#ea8f39]" />
            <span>Premium Healthcare Products</span>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="text-foreground">
              Our Curated <span className="text-primary">Products</span>
            </span>
          </motion.h2>

          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="h-1 w-24 bg-primary rounded-full shadow-lg"></div>
          </motion.div>

          <motion.p
            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Discover our premium pharmacy products and health essentials
            designed to support your wellness journey with quality and
            convenience.
          </motion.p>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}

        {!isLoading && displayProducts.length === 0 && (
          <div className="text-center text-muted-foreground py-20">
            <p>No products found.</p>
          </div>
        )}

        {!isLoading && displayProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className={`group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl ${product.popular
                  ? "ring-2 ring-[#ea8f39] shadow-[#ea8f39]/20"
                  : ""
                  }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {product.popular && (
                  <motion.div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20" />
                )}

                <motion.div
                  className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20"
                  initial={{ scale: 0, rotate: -10 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  Save{" "}
                  {Math.round(
                    ((parseFloat(product.originalPrice.replace(/[^\d.]/g, "")) -
                      parseFloat(product.price.replace(/[^\d.]/g, ""))) /
                      parseFloat(
                        product.originalPrice.replace(/[^\d.]/g, "")
                      )) *
                    100
                  ) || 10}
                  %
                </motion.div>

                <div className="relative w-full h-64 overflow-hidden">
                  {!imageErrors[product.id] && product.image ? (
                    <>
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => handleImageError(product.id)}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative">
                      <product.icon className="w-20 h-20 text-[#ea8f39] relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    </div>
                  )}

                  <motion.div
                    className="absolute bottom-4 left-4 right-4 z-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h3 className="text-xl font-bold text-white drop-shadow-lg mb-2 line-clamp-1">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-400"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-white/90 font-medium">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </motion.div>

                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-20">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed text-sm line-clamp-2 h-10">
                    {product.description}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {product.features
                      .slice(0, 2)
                      .map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.4,
                            delay: 0.2 + featureIndex * 0.1,
                          }}
                        >
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 text-sm font-medium line-clamp-1">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                  </ul>

                  <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-left">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Price
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-primary">
                            {product.price}
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            {product.originalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        router.push(`/product/${product.slug || product.id}`);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg py-2 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div className="flex justify-center">
          <Button className="px-10 py-4 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            Explore All Products
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
export default ProductSection;