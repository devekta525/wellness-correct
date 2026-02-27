"use client";

import Image from "next/image";
import React from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

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
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  React.useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      let index = Math.floor(latest * sections.length);
      if (index >= sections.length) index = sections.length - 1;
      if (index < 0) index = 0;

      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    });
  }, [scrollYProgress, activeIndex]);

  const activeSection = sections[activeIndex];

  // We map scroll progress to a step-based indicator height
  const progressHeight = useTransform(
    scrollYProgress,
    [0, 1],
    ["20%", "100%"]
  );

  return (
    <main className="bg-white dark:bg-slate-950 relative">
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${sections.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 dark:bg-slate-900/50 rounded-full blur-3xl"
              animate={{ scale: [1, 1.05, 1], x: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-24 items-center"
              >
                {/* Text Content */}
                <div className={`max-w-xl order-2 ${activeIndex % 2 === 0 ? 'lg:order-1' : 'lg:order-2 lg:ml-auto'}`}>
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-8 md:w-12 h-[2px] bg-[#1a3644] dark:bg-slate-200" />
                    <span className="text-xs md:text-sm font-bold tracking-widest text-[#1a3644] dark:text-slate-200">
                      {activeSection.number}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] text-[#1a3644] dark:text-white whitespace-pre-line tracking-tight mb-6 md:mb-8">
                    {activeSection.title}
                  </h2>

                  <p className="text-sm md:text-base leading-relaxed text-[#4a5f6a] dark:text-slate-300">
                    {activeSection.description}
                  </p>
                </div>

                {/* Image Content */}
                <div className={`w-full flex justify-center order-1 ${activeIndex % 2 === 0 ? 'lg:order-2 lg:justify-end' : 'lg:order-1 lg:justify-start'}`}>
                  <motion.div
                    className="relative w-full max-w-xs md:max-w-sm lg:max-w-md aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <Image
                      src={activeSection.imageSrc}
                      alt={activeSection.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 500px, 100vw"
                      priority
                    />
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Scroll Progress Indicator */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-1 h-32 md:h-48 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden z-20">
            <motion.div
              className="w-full bg-[#1a3644] dark:bg-blue-500 rounded-full origin-top"
              style={{
                height: "100%",
                scaleY: progressHeight
              }}
            />
          </div>

          <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-6 z-20">
            {sections.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (containerRef.current) {
                    const sectionHeight = containerRef.current.scrollHeight / sections.length;
                    window.scrollTo({
                      top: containerRef.current.offsetTop + (sectionHeight * i) + (sectionHeight / 2),
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex
                  ? 'bg-[#1a3644] dark:bg-white scale-150'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                  }`}
                aria-label={`Go to section ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </main>
  );
};


export default Science;
