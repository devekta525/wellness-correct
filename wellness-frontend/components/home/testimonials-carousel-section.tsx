"use client";
import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from "framer-motion";

const testimonials = [
    {
        id: 1,
        text: "I feel so much better after using GlycoGuard! My sugar levels are steady, and I have more energy to get through the day.",
        author: "Neha Patel",
        rating: 5,
    },
    {
        id: 2,
        text: "Since starting Longevity Pro, my focus has improved and I just feel sharper overall. Highly recommended!",
        author: "Rahul Sharma",
        rating: 5,
    },
    {
        id: 3,
        text: "The Complete Gut Fibre is a game changer. No more bloating and I feel lighter than ever.",
        author: "Priya Singh",
        rating: 5,
    },
    {
        id: 4,
        text: "Amazing products. The science behind them feels real and the results speak for themselves.",
        author: "Vikram Malhotra",
        rating: 5,
    },
    {
        id: 5,
        text: "Wellness has completely transformed my daily wellness routine. Simple, effective, and reliable.",
        author: "Anjali Gupta",
        rating: 5,
    },
];

const TestimonialsCarouselSection = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <section className="py-24 bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden text-center relative">
            {/* Background decorative quote mark */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.05, scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none"
            >
                <Quote className="w-48 h-48 md:w-64 md:h-64 rotate-180 text-blue-900 dark:text-blue-500" />
            </motion.div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">

                {/* Carousel Container */}
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="flex-[0_0_100%] min-w-0 flex flex-col items-center justify-center space-y-8 px-4 cursor-grab active:cursor-grabbing py-4">
                                {/* Stars */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex gap-1.5"
                                >
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-current drop-shadow-sm" />
                                    ))}
                                </motion.div>

                                {/* Quote Text */}
                                <motion.blockquote 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl md:text-4xl font-bold text-blue-900 dark:text-white leading-tight md:leading-snug max-w-4xl mx-auto"
                                >
                                    &ldquo;{testimonial.text}&rdquo;
                                </motion.blockquote>

                                {/* Author */}
                                <motion.cite 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="not-italic flex flex-col items-center gap-2"
                                >
                                    <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-200">{testimonial.author}</span>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest">Verified Customer</span>
                                </motion.cite>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation & Pagination */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-8 mt-12"
                >
                    {/* Prev Button */}
                    <Button
                        onClick={scrollPrev}
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all duration-300 hover:scale-110"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    {/* Dots */}
                    <div className="flex gap-2.5">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                                    ? 'bg-blue-600 w-8'
                                    : 'bg-slate-300 dark:bg-slate-700 w-2 hover:bg-blue-400'
                                    }`}
                                onClick={() => scrollTo(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <Button
                        onClick={scrollNext}
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all duration-300 hover:scale-110"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </motion.div>

            </div>
        </section>
    );
};

export default TestimonialsCarouselSection;
