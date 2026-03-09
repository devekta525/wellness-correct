"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getApiBaseUrl, getApiV1BaseUrl } from "@/lib/utils/api";

const API_BASE = getApiBaseUrl();
const API_V1_BASE = getApiV1BaseUrl();

const getImageUrl = (url) => {
  if (!url) return "/Hero.png";
  if (url.startsWith("data:")) return url;
  let finalUrl = url;
  if (!url.startsWith("http")) {
    finalUrl = url.startsWith("/") ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
  }
  try {
    const u = new URL(finalUrl);
    u.pathname = u.pathname
      .split("/")
      .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
      .join("/");
    return u.toString();
  } catch {
    return encodeURI(finalUrl);
  }
};

const defaultContent = [
  {
    title: "Premium Nutrition for Your Best Self",
    desc: "Discover our curated collection of superfoods and supplements designed for optimal health.",
    cta: "Shop Now",
    link: "/shop"
  },
  {
    title: "Pure Himalayan Shilajit",
    desc: "Experience the power of nature with our authentic, lab-tested Himalayan Shilajit.",
    cta: "Learn More",
    link: "/product/himalayan-shilajit"
  },
  {
    title: "Marine Collagen Peptides",
    desc: "Revitalize your skin, hair, and nails with our premium quality marine collagen.",
    cta: "Buy Now",
    link: "/shop"
  }
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/banners`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setSlides(data.data.map((s, i) => ({
            ...s,
            ...(defaultContent[i % defaultContent.length])
          })));
        } else {
          setSlides(defaultContent.map((c, i) => ({
            _id: `default-${i}`,
            imageUrl: "/Hero.png",
            ...c
          })));
        }
      } catch (error) {
        console.error("Failed to fetch banners for carousel:", error);
        setSlides(defaultContent.map((c, i) => ({
          _id: `default-${i}`,
          imageUrl: "/Hero.png",
          ...c
        })));
      }
    };

    fetchBanners();
  }, []);

  const next = useCallback(() => {
    if (slides.length > 1) {
      setCurrent((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length > 1) {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [next, slides.length]);

  if (slides.length === 0) {
    return (
      <section className="relative w-full bg-slate-100 animate-pulse h-[300px] sm:h-[450px] md:h-[600px] lg:h-[750px]" />
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 h-[320px] sm:h-[450px] md:h-[600px] lg:h-[750px] group">
      <AnimatePresence mode="wait">
        {slides.map((slide, idx) => (
          idx === current && (
            <motion.div
              key={slide._id || idx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 z-0"
            >
              {/* Image with overlay */}
              <div className="relative w-full h-full">
                <img
                  src={getImageUrl(slide.imageUrl)}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If the image fails (e.g. backend unreachable), fall back to local Hero.png
                    if (e.currentTarget.src !== window.location.origin + '/Hero.png') {
                      e.currentTarget.src = '/Hero.png';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent sm:bg-gradient-to-r sm:from-slate-900/70 sm:to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 z-10 flex items-center">
                <div className="max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
                  <div className="max-w-xl w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-serif font-bold text-white leading-tight mb-3 sm:mb-4 px-2 sm:px-0">
                        {slide.title}
                      </h1>
                    </motion.div>

                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-sm sm:text-base md:text-lg text-slate-200 mb-6 sm:mb-8 w-full max-w-md mx-auto sm:ml-0 px-2 sm:px-0"
                    >
                      {slide.desc}
                    </motion.p>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 w-full px-6 sm:px-0"
                    >
                      <Link
                        href={slide.link || "/shop"}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        {slide.cta || "Shop Now"}
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-500 ${i === current
                  ? "w-8 h-1.5 bg-blue-500 rounded-full"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60 rounded-full"
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
