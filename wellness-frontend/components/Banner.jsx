/* Server Component */

import Link from "next/link";
import { ArrowRight, Shield, Award, Star, Truck, Zap } from "lucide-react";

const stats = [
  { icon: Shield, label: "100% Authentic" },
  { icon: Award, label: "Quality Certified" },
  { icon: Star, label: "50K+ Happy Customers" },
  { icon: Truck, label: "Free Shipping ₹999+" },
];

export default function Banner() {
  return (
    /*
      The design spec requests 1920×250 with 25% side padding.
      25% of 1920px = 480px on each side → content width = 960px centred.
      We achieve this with px-[25%] on the inner container.
    */
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "250px" }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900" />

      {/* Cross / healthcare SVG pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="banner-hc"
            x="0"
            y="0"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <rect x="28" y="14" width="8" height="36" rx="2" fill="white" />
            <rect x="14" y="28" width="36" height="8" rx="2" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#banner-hc)" />
      </svg>

      {/* Glow orbs */}
      <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-[20%] top-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* ── Content ── */}
      <div
        className="relative h-full flex items-center px-6 sm:px-[10%] lg:px-[15%]"
        style={{ minHeight: "250px" }}
      >
        <div className="w-full text-center py-8 sm:py-10">
          {/* Stat pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
            {stats.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-blue-200 text-[10px] sm:text-xs font-semibold"
              >
                <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400" />
                {label}
              </div>
            ))}
          </div>

          {/* Headline */}
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Unlock Nature's Most Potent{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-blue-300">
              Wellness Secrets
            </span>
          </h2>

          {/* Sub-copy */}
          <p className="text-blue-200/80 text-[11px] sm:text-sm mb-6 sm:mb-8">
            Free shipping on orders over ₹999 &nbsp;·&nbsp; Use code{" "}
            <span className="font-extrabold text-cyan-300">WELLNESS20</span> for
            20% off
          </p>

          {/* CTA */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-linear-to-r from-cyan-400 to-blue-400 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-300 hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-4 h-4" />
            Shop Now
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
