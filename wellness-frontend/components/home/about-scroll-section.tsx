"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import Image1 from "../../public/about-anatomy.png";
import Image2 from "../../public/about-doctors.png";
import Image3 from "../../public/natural-plants-science.png";

import { motion, AnimatePresence } from "framer-motion";

type AboutStep = {
  number: string;
  title: string;
  description: string;
  imageSrc: string | StaticImageData;
  imageAlt: string;
  panelBgClassName?: string;
  imageBgClassName?: string;
};

const AboutScrollSection = () => {
  const steps: AboutStep[] = useMemo(
    () => [
      {
        number: "01",
        title: "A Vision to Transform Health",
        description:
          "Wellness was founded by a team of visionary doctors who aimed to enhance their patients' quality of life with natural, science-backed supplements. After extensive research, they developed plant-based solutions addressing widespread nutritional deficiencies that affect health and wellness. These supplements target conditions like diabetes, metabolic syndrome, fatty liver disease, and fertility challenges, providing holistic, health-oriented solutions.",
        imageSrc: Image1,
        imageAlt: "A vision to transform health",
        panelBgClassName: "bg-white",
        imageBgClassName: "bg-white",
      },
      {
        number: "02",
        title: "Expertise in Specialized Health Needs",
        description:
          "One of Wellness's founders, a renowned metabolic health expert, centered on creating supplements for patients with diabetes, prediabetes, and metabolic conditions. The other founder, a reproductive specialist, focused on enhancing fertility through natural products. Together, they combined their expertise to offer a unique range of supplements crafted for specific health needs, supporting better patient outcomes through targeted, nature-driven solutions.",
        imageSrc: Image2,
        imageAlt: "Expertise in specialized health needs",
        panelBgClassName: "bg-white",
        imageBgClassName: "bg-slate-100",
      },
      {
        number: "03",
        title: "Pure, Plant-Based Formulations",
        description:
          "Wellness's products are not only rooted in rigorous scientific research but are also entirely plant-based, free from artificial colors and preservatives. Educated at prestigious Indian universities, the founders are dedicated to ensuring that each product undergoes comprehensive testing to confirm safety and efficacy. This careful attention to purity and quality reflects Wellness's mission to prioritize natural, health-first solutions.",
        imageSrc: Image3,
        imageAlt: "Pure, plant-based formulations",
        panelBgClassName: "bg-white",
        imageBgClassName: "bg-blue-50",
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const active = steps[activeIndex];

  return (
    <section className="bg-white dark:bg-slate-950 overflow-hidden relative py-20 lg:py-32">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl" />
      </div>

      <div ref={scrollRef} className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-16">
          <div className="hidden sm:block w-16 h-[2px] bg-blue-600" />
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((step, idx) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative px-4 py-2 text-sm font-bold tracking-widest transition-all duration-300 rounded-full ${
                  idx === activeIndex
                    ? "text-white bg-blue-600 shadow-lg shadow-blue-200"
                    : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
                aria-pressed={idx === activeIndex}
              >
                {step.number}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${active.panelBgClassName || ""}`}
          >
            <div className="order-2 lg:order-1">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-900 dark:text-white leading-[1.1] mb-8 tracking-tight"
              >
                {active.title}
              </motion.h2>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative pl-6 border-l-4 border-blue-100 dark:border-blue-900"
              >
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  {active.description}
                </p>
              </motion.div>
            </div>

            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 ${active.imageBgClassName || "bg-slate-50"}`}
              >
                {!imageError[activeIndex] ? (
                  <Image
                    src={active.imageSrc}
                    alt={active.imageAlt}
                    fill
                    className="object-contain p-8 hover:scale-105 transition-transform duration-700"
                    onError={() =>
                      setImageError((prev) => ({ ...prev, [activeIndex]: true }))
                    }
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-semibold">
                    {active.title}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800"
        >
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-xs font-bold tracking-widest uppercase mb-6">
              Plant-Based and Free from Artificial Additives
            </div>

            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 dark:text-white leading-tight mb-6">
              Commitment to Quality
            </h3>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Wellness remains steadfast in its commitment to enhancing lives by delivering the best of what nature and science can offer. Their meticulous approach guarantees products that meet the highest standards of safety, efficacy, and quality. Wellness's dedication to excellence underscores its mission to use natural ingredients to empower and support the health journeys of all who seek their products.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutScrollSection;