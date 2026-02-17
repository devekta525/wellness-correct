"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
 
import img from "../../../public/Hero.png";

// Placeholder for  Image - reusing the one from public if available
// If using Next.js public folder, strings are best.
const TESTED_BY_IMAGE = img;

const Footer = () => {
  return (
    <footer className="w-full">

      {/* Tested By Section */}
      <div className="w-full bg-gradient-to-r from-blue-400 via-purple-300 to-blue-400 border-b border-transparent">
        {/* Adjusted to Blue/White gradient */}
        <div className="relative w-full h-[300px] md:h-[350px] bg-gradient-to-r from-blue-400 via-white to-sky-400 flex items-center justify-center overflow-hidden">
          
          {/* Animated Background Elements */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-white/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          <div className="max-w-7xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-center md:gap-16 lg:gap-32 relative z-10">

            {/* Left Text */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-blue-900 font-bold text-3xl md:text-5xl -translate-y-4 md:translate-y-0 text-center md:text-left drop-shadow-sm"
            >
              Tested by
            </motion.div>

            {/*  Image */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-64 h-64 md:w-80 md:h-80 md:-mb-16 flex-shrink-0 mt-8 md:mt-0"
            >
              <Image
                src={TESTED_BY_IMAGE}
                alt=" "
                fill
                className="object-contain object-center md:object-top drop-shadow-2xl mix-blend-multiply"
              />
            </motion.div>

            {/* Right Text */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left text-blue-900"
            >
              <div className="font-bold text-3xl md:text-5xl drop-shadow-sm"> </div>
              <div className="text-xl md:text-2xl font-medium mt-2 text-blue-800/80 md:text-blue-900">
                for longevity & vitality
              </div>
            </motion.div>

          </div>

          {/* Gradient Overlays for better text contrast if needed */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 pointer-events-none md:hidden" />
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-20 pb-10 px-6 md:px-12 lg:px-20 relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Column 1: Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 space-y-6"
          >
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">Wellness Fuel</h3>
            <p className="text-sm md:text-base leading-relaxed text-slate-300 max-w-sm">
              Wellness offers plant based supplements crafted by leading doctors to support health in areas like diabetes, metabolic wellness, and fertility. Rooted in rigorous research, their natural formulations are free from artificial additives, prioritizing safe, effective solutions for better living.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <Link key={i} href="#" className="bg-white/10 p-2.5 rounded-full hover:bg-blue-600 hover:scale-110 transition-all duration-300">
                  <Icon className="w-5 h-5 text-white" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <h4 className="font-bold text-lg text-white">Quick Links</h4>
            <div className="space-y-3 text-sm font-medium text-slate-300">
              <Link href="/privacy-policy" className="block hover:text-blue-400 hover:translate-x-1 transition-all duration-200">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-blue-400 hover:translate-x-1 transition-all duration-200">Terms and Conditions</Link>
              <Link href="/orders" className="block hover:text-blue-400 hover:translate-x-1 transition-all duration-200">Orders & Shipping</Link>
              <Link href="/refunds" className="block hover:text-blue-400 hover:translate-x-1 transition-all duration-200">Refunds & Cancellation</Link>
              <Link href="/science" className="block hover:text-blue-400 hover:translate-x-1 transition-all duration-200">Science</Link>
              <Link href="/about" className="block hover:text-blue-400 hover:translate-x-1 transition-all duration-200">About Us</Link>
              <Link href="/contact" className="block hover:text-blue-400 hover:translate-x-1 transition-all duration-200">Contact</Link>
            </div>
          </motion.div>

          {/* Column 3: Connect */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6 text-sm font-medium"
          >
            <h4 className="font-bold text-lg text-white">Connect</h4>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer">01140848448</div>
              <div className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer">info@nutra-zen.com</div>
            </div>
          </motion.div>

          {/* Column 4: Newsletter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-4 space-y-6"
          >
            <h3 className="font-bold text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Be the first to know<br />
              about new arrivals
            </h3>
            <div className="relative max-w-sm mt-4">
              <input
                type="email"
                placeholder="E-mail"
                className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 text-white transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-lg hover:shadow-blue-500/50">
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* Copyright */}
        <div className="max-w-[1920px] mx-auto mt-16 pt-8 border-t border-white/10 text-xs text-slate-400 font-light tracking-wide flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© 2026, Wellness. Powered by Shopify</span>
        </div>

        {/* Floating WhatsApp Button */}
        <motion.a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Simple WhatsApp SVG */}
          <div className="bg-[#25D366] p-3.5 rounded-full shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-shadow">
            <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white">
              <path d="M16 2C8.3 2 2 8.3 2 16c0 2.5.6 4.8 1.8 6.8L2.5 29l6.4-1.7c1.9 1 4.1 1.6 6.4 1.6 7.7 0 14-6.3 14-14S23.7 2 16 2zm0 25.5c-2.1 0-4.1-.5-5.9-1.5l-.4-.2-4.4 1.1 1.2-4.2-.3-.4c-1.1-1.8-1.7-3.9-1.7-6.1 0-6.3 5.2-11.5 11.5-11.5s11.5 5.2 11.5 11.5-5.2 11.3-11.5 11.3z" />
              <path d="M22.5 19.3c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.7.1-.2.4-1.1 1.2-1.2 1.5-.2.2-.4.4-.7.1-2.9-1.3-4.8-3.9-5.1-4.3-.2-.4 0-.4.3-.8.2-.3.4-.6.6-.8.2-.2.3-.4.4-.6.1-.2.1-.4 0-.6s-.7-1.8-1-2.4c-.3-.6-.6-.5-.9-.5h-.7c-.3 0-.7.1-1.1.5-.4.4-1.5 1.5-1.5 3.6s1.6 4.2 1.8 4.5c.2.3 3.1 4.7 7.5 6.6 2.8 1.2 3.9 1 5.3.9 1.2-.1 2.8-1.2 3.2-2.3.4-1.1.4-2.1.3-2.3-.1-.2-.4-.3-.7-.5z" />
            </svg>
          </div>
        </motion.a>
      </div>
    </footer>
  );
};

export default Footer;
