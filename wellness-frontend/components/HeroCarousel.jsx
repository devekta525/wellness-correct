"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getApiBaseUrl, getApiV1BaseUrl } from "@/lib/utils/api";

const API_BASE = getApiBaseUrl();
const API_V1_BASE = getApiV1BaseUrl();

const getImageUrl = (url) => {
  if (!url) return "/Hero.png";
  // Handle base64 data URIs
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

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/banners`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setSlides(data.data);
        } else {
          // Fallback if no specific banners
          setSlides([{ _id: "1", imageUrl: "/Hero.png" }]);
        }
      } catch (error) {
        console.error("Failed to fetch banners for carousel:", error);
        setSlides([{ _id: "1", imageUrl: "/Hero.png" }]);
      }
    };

    fetchBanners();
  }, []);

  const goTo = useCallback(
    (idx) => {
      if (animating || slides.length <= 1) return;
      setAnimating(true);
      setCurrent(idx);
      setTimeout(() => setAnimating(false), 700);
    },
    [animating, slides.length],
  );

  const next = useCallback(
    () => goTo((current + 1) % slides.length),
    [current, goTo, slides.length],
  );
  const prev = useCallback(
    () => goTo((current - 1 + slides.length) % slides.length),
    [current, goTo, slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(next, 5500);
    return () => clearInterval(timerRef.current);
  }, [next, slides.length]);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(next, 5500);
  };

  if (slides.length === 0) {
    return (
      <section
        className="relative overflow-hidden w-full bg-slate-100 animate-pulse"
        style={{ height: "clamp(520px, 39.0625vw, 750px)" }}
      />
    );
  }

  return (
    <section
      className="relative overflow-hidden w-full group"
      style={{ height: "clamp(520px, 39.0625vw, 750px)" }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={slide._id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={!isActive}
          >
            <div className="relative z-10 h-full w-full">
              <img
                src={getImageUrl(slide.imageUrl)}
                alt={`Banner slide ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-white hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-white hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-400 ${
                  i === current
                    ? "w-8 h-2.5 bg-slate-600 shadow-md"
                    : "w-2.5 h-2.5 bg-white/60 hover:bg-white/90 backdrop-blur-sm"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
