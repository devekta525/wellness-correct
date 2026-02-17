"use client";

import React from "react";
import { Users, Award, Clock, Heart } from "lucide-react";
import { motion } from 'framer-motion';

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "50,000+",
      label: "Active Patients",
      description: "Trusted by a thriving community worldwide.",
    },
    {
      icon: Award,
      number: "500+",
      label: "Expert Doctors",
      description: "Board-certified and experienced professionals.",
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Support Available",
      description: "Round-the-clock assistance for all your needs.",
    },
    {
      icon: Heart,
      number: "99.9%",
      label: "Patient Satisfaction",
      description: "Consistently high ratings from our patients.",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Enhanced Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blue Blob - Top Right */}
        <motion.div 
          className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-blue-400/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Indigo Blob - Bottom Left */}
        <motion.div 
          className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-indigo-500/8 to-indigo-400/5 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Cyan Blob - Top Left */}
        <motion.div 
          className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-cyan-400/6 to-blue-500/6 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Sky Blue Blob - Bottom Right */}
        <motion.div 
          className="absolute bottom-10 right-10 w-56 h-56 bg-gradient-to-r from-sky-400/6 to-blue-600/6 rounded-full blur-2xl"
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />

        {/* Center Blue Blob */}
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/4 to-indigo-500/4 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />

        {/* Small Floating Particles */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        <motion.div 
          className="absolute top-3/4 right-1/4 w-2 h-2 bg-indigo-500 rounded-full"
          animate={{
            y: [0, -25, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        
        <motion.div 
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full"
          animate={{
            y: [0, -15, 0],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl sm:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-lg">
              Trusted by Thousands Worldwide
            </span>
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Our platform has transformed healthcare delivery, connecting
            patients with world-class medical professionals and delivering
            exceptional outcomes.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-800/90 dark:via-blue-950/30 dark:to-indigo-950/30 backdrop-blur-md rounded-xl p-8 shadow-md border border-blue-200/50 dark:border-blue-700/30"
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-20 h-20 rounded-xl border border-blue-200/50 dark:border-blue-700/30 flex items-center justify-center mx-auto mb-6 relative overflow-hidden text-primary group-hover:scale-110 transition-all duration-300"
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="w-10 h-10 text-primary relative z-10 drop-shadow-xs" />
                </motion.div>

                <motion.div 
                  className="text-4xl font-bold mb-3 text-black dark:text-white drop-shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  {stat.number}
                </motion.div>

                <div className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
                  {stat.label}
                </div>

                <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {stat.description}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Simple bottom section */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-cyan-950/50 rounded-full text-blue-900 dark:text-blue-100 text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
            whileHover={{ scale: 1.01}}
            transition={{ duration: 0.3 }}
          >
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>Join thousands of satisfied patients</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
