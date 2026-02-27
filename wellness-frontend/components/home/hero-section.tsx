"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HERO_IMAGE from "../../public/Hero.png";

interface Banner {
  _id: string;
  imageUrl: string;
}

import { getApiBaseUrl, getApiV1BaseUrl } from "@/lib/utils/api";

// base endpoints (helper handles trailing slashes and existing `/v1` fragments)
const API_BASE = getApiBaseUrl();
const API_V1_BASE = getApiV1BaseUrl();

const getImageUrl = (url?: string) => {
  if (!url) return HERO_IMAGE;
  // if it's already a full URL we trust it, otherwise prefix with base
  let finalUrl = url;
  if (!url.startsWith("http")) {
    finalUrl = url.startsWith("/") ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
  }
  // encode each path segment so spaces/parentheses/etc. are safe
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

const HeroSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Initialize Embla Carousel with Autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  // Navigation callbacks
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  // Update selected index
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_V1_BASE}/banners`);
      if (res.data.success && res.data.data.length > 0) {
        setBanners(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch banners", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSlides = () => {
    const slidesToRender =
      loading || banners.length === 0
        ? [{ _id: "default", imageUrl: HERO_IMAGE }]
        : banners;

    return slidesToRender.map((banner, idx) => (
      <div
        key={banner._id}
        className="flex-[0_0_100%] min-w-0 w-full relative h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[720px]"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10" />

        {/* Side Gradient for better text visibility */}
        <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-transparent z-10" />

        {/* Banner Image */}
        <Image
          src={
            typeof banner.imageUrl === "string"
              ? getImageUrl(banner.imageUrl)
              : HERO_IMAGE
          }
          alt={`Banner ${idx + 1}`}
          fill
          className="object-cover object-center"
          priority={idx === 0}
          sizes="100vw"
          unoptimized
        />

        {/* Content Overlay - You can add your content here */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-8 sm:p-12 lg:p-16 xl:p-20">
          <div className="max-w-7xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 
                         drop-shadow-2xl animate-fadeInUp"
            >
              Welcome to Our Store
            </h1>
            <p
              className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl drop-shadow-lg 
                        animate-fadeInUp animation-delay-200"
            >
              Discover amazing products at unbeatable prices
            </p>
            <button
              className="px-8 py-3 bg-white text-black font-semibold rounded-full 
                             hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 
                             shadow-lg animate-fadeInUp animation-delay-400"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    ));
  };

  const totalSlides = loading || banners.length === 0 ? 1 : banners.length;

  return (
    <section className="relative w-full overflow-hidden bg-gray-900 group">
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-900">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-200" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce animation-delay-400" />
          </div>
        </div>
      )}

      {/* Embla Viewport */}
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex touch-pan-y">{renderSlides()}</div>
      </div>

      {/* Navigation Arrows - Only show if more than 1 slide */}
      {totalSlides > 1 && (
        <>
          <button
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 
                     bg-white/20 backdrop-blur-sm rounded-full text-white 
                     hover:bg-white/30 transition-all duration-300 
                     opacity-0 group-hover:opacity-100 transform hover:scale-110"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 
                     bg-white/20 backdrop-blur-sm rounded-full text-white 
                     hover:bg-white/30 transition-all duration-300 
                     opacity-0 group-hover:opacity-100 transform hover:scale-110"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 slide */}
      {totalSlides > 1 && (
        <div
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 
                      flex items-center gap-2"
        >
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 rounded-full 
                        ${
                          selectedIndex === index
                            ? "w-8 h-2 bg-white"
                            : "w-2 h-2 bg-white/50 hover:bg-white/70"
                        }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
