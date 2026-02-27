"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import Image1 from "../../public/about-anatomy.png";
import Image2 from "../../public/about-doctors.png";
import Image3 from "../../public/natural-plants-science.png";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  React.useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      let index = Math.floor(latest * steps.length);
      if (index >= steps.length) index = steps.length - 1;
      if (index < 0) index = 0;

      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    });
  }, [scrollYProgress, activeIndex, steps.length]);

  const activeStep = steps[activeIndex];

  const progressHeight = useTransform(
    scrollYProgress,
    [0, 1],
    ["20%", "100%"]
  );

  return (
    <section className="bg-white dark:bg-slate-950 relative">
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${steps.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-50 dark:opacity-20" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl opacity-50 dark:opacity-20" />
          </div>

          <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-12 relative z-10 transition-all duration-500">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center"
              >
                {/* Text Content */}
                <div className={`max-w-xl order-2 ${activeIndex % 2 === 0 ? 'lg:order-1' : 'lg:order-2 lg:ml-auto'}`}>
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-8 md:w-12 h-[2px] bg-[#1a3644] dark:bg-slate-200" />
                    <span className="text-xs md:text-sm font-bold tracking-widest text-[#1a3644] dark:text-slate-200">
                      {activeStep.number}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] text-[#1a3644] dark:text-white whitespace-pre-line tracking-tight mb-6 md:mb-8">
                    {activeStep.title}
                  </h2>

                  <p className="text-sm md:text-base leading-relaxed text-[#4a5f6a] dark:text-slate-300">
                    {activeStep.description}
                  </p>
                </div>

                {/* Image Content */}
                <div className={`w-full flex justify-center order-1 ${activeIndex % 2 === 0 ? 'lg:order-2 lg:justify-end' : 'lg:order-1 lg:justify-start'}`}>
                  <motion.div
                    className={`relative w-full max-w-xs md:max-w-sm lg:max-w-md aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 ${activeStep.imageBgClassName || "bg-slate-50 dark:bg-slate-800"}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    {!imageError[activeIndex] ? (
                      <Image
                        src={activeStep.imageSrc}
                        alt={activeStep.imageAlt}
                        fill
                        className="object-contain p-6 md:p-10"
                        onError={() => setImageError((prev) => ({ ...prev, [activeIndex]: true }))}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-semibold p-8 text-center text-xl">
                        {activeStep.title}
                      </div>
                    )}
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
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (containerRef.current) {
                    const sectionHeight = containerRef.current.scrollHeight / steps.length;
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
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-12 relative z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 pt-16 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-xs font-bold tracking-widest uppercase mb-6">
              Plant-Based and Free from Artificial Additives
            </div>

            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a3644] dark:text-white leading-tight mb-6">
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
