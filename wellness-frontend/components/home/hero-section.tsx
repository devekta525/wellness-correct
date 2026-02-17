"use client";
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star } from "lucide-react";
import Image from 'next/image';
import { motion } from "framer-motion";
import HERO_IMAGE from '../../public/Hero.png';
import Product1 from "../../public/supplement-bottle-blue.png"
import Product2 from "../../public/1.jpg"
import Product4 from "../../public/4.jpg"

const HeroSection = () => {
  const products = [
    { name: "Longevity Pro", rating: 5, image: Product1 },
    { name: "Complete Superfoods Blend", rating: 5, image: Product2 },
    { name: "Complete Gut Fibre", rating: 5, image: Product1 },
    { name: "Forever Gut", rating: 5, image: Product4 },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 dark:from-slate-900 dark:to-slate-950 min-h-[650px] flex items-center">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-b from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-r from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 relative z-20 w-full">
        <div className="flex flex-col lg:flex-row items-center cursor-default">

          {/* Left Content:  Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-[45%] flex justify-center lg:justify-start relative mb-12 lg:mb-0"
          >
            {/* Circular/Glow effect behind image if needed, for now just the image */}
            <motion.div 
              className="relative w-full max-w-[500px] lg:max-w-none h-[400px] sm:h-[500px] lg:h-[700px]"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={HERO_IMAGE}
                alt=" "
                fill
                className="object-contain object-center lg:object-left-bottom drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Right Content: Text & Products */}
          <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start space-y-8 pl-0 lg:pl-10">

            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-30 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-blue-900 leading-[1.1] text-center lg:text-left"
            >
              4 for <br />
              <span className="text-blue-600">Everyday Longevity</span>
            </motion.h1>

            {/* Product Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
              {products.map((product, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + (idx * 0.1) }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-4 border border-blue-200 shadow-lg flex flex-col items-center text-center hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-400 transition-all"
                >
                  <div className="w-full aspect-square relative mb-3 bg-blue-50/50 rounded-xl overflow-hidden flex items-center justify-center">
                    <div className="w-20 h-20 relative">
                      <Image src={product.image} alt={product.name} fill className="object-contain" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight min-h-[40px] flex items-center justify-center">
                    {product.name}
                  </h3>
                  <div className="flex gap-0.5 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="pt-6 w-full flex justify-center lg:justify-start"
            >
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-10 py-7 rounded-full shadow-lg shadow-blue-300/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  Explore Our Products
                </Button>
              </Link>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection
