"use client";
import React from 'react'
import { Heart, Users, Award, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion';

const AboutSection = () => {
  const features = [
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Tailored health solutions designed specifically for your unique needs and lifestyle."
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Board-certified doctors and wellness professionals dedicated to your health journey."
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Evidence-based treatments and wellness programs with measurable outcomes."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "HIPAA-compliant platform ensuring your health data is always protected."
    }
  ]

  const stats = [
    { number: "10K+", label: "Happy Patients" },
    { number: "500+", label: "Expert Doctors" },
    { number: "50+", label: "Specialties" },
    { number: "99.9%", label: "Success Rate" }
  ]

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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
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
            <span className="text-foreground">About <span className="text-primary">Wellness Fuel</span></span>
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We&apos;re revolutionizing healthcare by combining cutting-edge technology with compassionate care, 
            making wellness accessible to everyone, everywhere.
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.h3 
              className="text-3xl font-bold text-slate-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Transforming Healthcare Through Innovation
            </motion.h3>
            <motion.p 
              className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              At Wellness Fuel, we believe that everyone deserves access to high-quality healthcare. 
              Our platform connects patients with world-class doctors, provides personalized wellness 
              programs, and offers 24/7 support to ensure your health journey is smooth and successful.
            </motion.p>
            
            <motion.div 
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {[
                "Comprehensive health assessments",
                "Personalized treatment plans",
                "24/7 telemedicine support",
                "Mental health and wellness programs",
                "Emergency care coordination"
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  </motion.div>
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              <Button className="bg-gradient-to-r from-primary via-indigo-600 to-cyan-600 hover:from-primary/90 hover:via-indigo-600/90 hover:to-cyan-600/90 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Learn More About Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Stats */}
          <motion.div 
            className="grid grid-cols-2 gap-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)"
                }}
              >
                <motion.div 
                  className="text-4xl font-bold mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                >
                  <span className="text-primary">
                    {stat.number}
                  </span>
                </motion.div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="text-center p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)"
              }}
            >
              <motion.div 
                className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                {/* Gradient border */}
                <div className="absolute inset-0 bg-primary rounded-2xl p-0.5">
                  <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl"></div>
                </div>
                <feature.icon className="w-8 h-8 text-primary relative z-10" />
              </motion.div>
              <h4 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection