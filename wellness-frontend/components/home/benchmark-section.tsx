"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
// ...existing code...
import Product1 from "../../public/supplement-bottle-blue.png";
import Product2 from "../../public/1.jpg";
import Product4 from "../../public/4.jpg";
import img from "../../public/Hero.png"

const BenchmarkSection = () => {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-blue-900 dark:text-white leading-[1.1] tracking-tight">
              He’s not our ambassador. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">He’s our benchmark.</span>
            </h2>

            <div className="space-y-4 relative">
              <div className="hidden lg:block absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent rounded-full" />
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">for Wellness.</p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Because longevity isn’t a trend, it’s a standard. We set the bar high so you can live your best life, every single day.
              </p>
            </div>

            <div className="pt-6">
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-10 py-7 rounded-full shadow-lg shadow-blue-300/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  Explore Our Products
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Image & Floating Cards */}
          <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end mt-12 lg:mt-0">
            {/* Main Image Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[600px] h-[500px] md:h-[600px] rounded-[3rem] overflow-visible"
            >
              {/* Placeholder for  holding products */}
              <div className="relative w-full h-full mix-blend-multiply dark:mix-blend-normal z-10">
                <Image
                  src= {img}
                  alt="Benchmark"
                  fill
                  className="object-contain object-bottom drop-shadow-2xl"
                  priority
                />
              </div>

              {/* Floating Product Cards */}
              {/* Card 1: Top Left */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-0 md:-left-8 w-36 md:w-44 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 z-20 hidden sm:block"
              >
                <div className="relative w-full aspect-square mb-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
                  <Image
                    src={Product1}
                    alt="Longevity Pro"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">
                  Longevity Pro
                </p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>

              {/* Card 2: Top Right */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-20 right-0 md:-right-4 w-40 md:w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 z-20 hidden sm:block"
              >
                <div className="relative w-full aspect-square mb-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
                  <Image
                    src={Product2}
                    alt="Superfoods"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">
                  Complete Superfoods
                </p>
                <div className="flex gap-0.5">
                   {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>

              {/* Card 3: Bottom Left */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-32 -left-4 md:-left-12 w-36 md:w-44 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 z-20 hidden sm:block"
              >
                <div className="relative w-full aspect-square mb-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
                  <Image
                    src={Product1}
                    alt="Gut Fibre"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">
                  Complete Gut Fibre
                </p>
                <div className="flex gap-0.5">
                   {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>

              {/* Card 4: Bottom Right */}
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-20 right-0 md:-right-8 w-32 md:w-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 z-20 hidden sm:block"
              >
                <div className="relative w-full aspect-square mb-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2">
                  <Image
                    src={Product4}
                    alt="Forever Gut"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1">
                  Forever Gut
                </p>
                <div className="flex gap-0.5">
                   {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenchmarkSection;
