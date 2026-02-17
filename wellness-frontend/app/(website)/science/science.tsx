"use client";

import Image from "next/image";
import React from "react";
import ScienceFeatured from "./science-featured";
import EcosystemSection from "@/components/home/ecosystem-section";
import { motion, AnimatePresence } from "framer-motion";

import img1 from "../../../public/sciencelab.png";
import img2 from "../../../public/supplement-bottle-blue.png";
import img3 from "../../../public/supplement-jar-blue.png";
import img4 from "../../../public/science-based-plant-based-wellness.png"
import img5 from "../../../public/natural-science.png"

type ScienceSection = {
  number: string;
  title: string;
  description: string;
  
  imageSrc: any;
  imageAlt: string;
};

const sections: ScienceSection[] = [
  {
    number: "01",
    title: "Addressing\nModern\nNutritional\nChallenges",
    description:
      "Today's fast-paced world makes it challenging for many to maintain proper nutrition due to nutrient-depleted soils reducing the quality of fruits and vegetables. Alongside the demands of work and life, irregular eating habits, processed foods, and preservative-heavy diets lead to serious micronutrient deficiencies. These nutritional gaps, intensified by chronic stress, hasten aging and compromise gut health, increasing risks for metabolic disorders.",
    imageSrc:
      img1,
    imageAlt: "Modern nutritional challenges",
  },
  {
    number: "02",
    title: "Wellness’s\nHealth-\nFocused\nCommitment",
    description:
      "Wellness aims to solve these health challenges with scientifically formulated, plant-based supplements. Our Fatty Liver Revive supports liver detoxification, reduces fat accumulation, and improves metabolic function—key for those with fatty liver concerns. GlycoGuard enhances insulin sensitivity, regulates glucose metabolism, and guards against oxidative stress, ideal for managing metabolic syndrome.",
    imageSrc:
      img2,
    imageAlt: "Health focused commitment",
  },
  {
    number: "03",
    title: "Gut Health and\nLongevity\nSupport",
    description:
      "For gut health, Forever Gut provides an advanced prebiotic and probiotic blend with Akkermansia muciniphila, a key strain for gut barrier integrity and longevity. Complete Gut Fibre supports digestion, regularity, and inflammation reduction, improving overall gut health. Our Longevity Pro aids cellular repair and energy throughout the day, while NMN Pro boosts NAD+ levels, combating age-related decline and enhancing physical and cognitive performance.",
    imageSrc:
      img3,
    imageAlt: "Gut health and longevity",
  },
  {
    number: "04",
    title: "Solutions for\nSkin, Growth,\nand\nReproductive\nHealth",
    description:
      "NutriRevive nourishes skin and hair from within, increasing hydration, reducing fine lines, and strengthening hair and nails. Height Boost aids in healthy growth for children by supporting bone development and nutrient absorption. Fertility Boost and Fertility Pro enhance sperm and egg quality, benefiting reproductive health.",
    imageSrc:
      img4,
    imageAlt: "Skin, growth and reproductive health",
  },
  {
    number: "05",
    title: "Science-\nBased, Plant-\nBased\nWellness",
    description:
      "Every Wellness product is plant-based, scientifically developed, and crafted to address the nutritional gaps of modern lifestyles. Wellness provides solutions to empower individuals in overcoming today’s nutritional challenges for a healthier tomorrow.",
    imageSrc:
     img5,
    imageAlt: "Science based wellness",
  },
];

const Science = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeSection = sections[activeIndex];

  return (
    <main className="bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-16 sm:mb-24">
          <div className="hidden sm:block w-12 h-[2px] bg-blue-600" />
          <div className="flex flex-wrap items-center gap-3">
            {sections.map((section, idx) => (
              <button
                key={section.number}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative px-4 py-2 text-sm font-bold tracking-widest transition-all duration-300 rounded-full ${
                  idx === activeIndex
                    ? "text-white bg-blue-600 shadow-lg shadow-blue-200"
                    : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
                aria-pressed={idx === activeIndex}
              >
                {section.number}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
          >
            <div className="max-w-xl order-2 lg:order-1">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-blue-900 dark:text-white whitespace-pre-line tracking-tight"
              >
                {activeSection.title}
              </motion.h2>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent rounded-full" />
                <p className="pl-6 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  {activeSection.description}
                </p>
              </motion.div>
            </div>

            <div className="w-full order-1 lg:order-2">
              <motion.div 
                className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xl shadow-blue-900/10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={activeSection.imageSrc}
                  alt={activeSection.imageAlt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(min-width: 1024px) 520px, 100vw"
                  priority
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none" />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
       <ScienceFeatured /> 
      <EcosystemSection />
    </main>
  );
};


export default Science;
