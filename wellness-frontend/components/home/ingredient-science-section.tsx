"use client";
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Microscope, Sparkles } from 'lucide-react';
import SCIENCE_IMAGE from '../../public/Hero.png';

const IngredientScienceSection = () => {
    return (
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">

            {/* Background/Overlay Logic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

                    {/* Left Text */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/3 space-y-6 text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 text-blue-700 text-sm font-semibold backdrop-blur-sm border border-blue-200">
                            <Microscope className="w-4 h-4" />
                            <span>Backed by Science</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 leading-[1.1] tracking-tight">
                            Why Each <br />
                            <span className="text-blue-600">Ingredient</span> <br />
                            Matters
                        </h2>
                    </motion.div>

                    {/* Center Image (Scientist) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-1/3 flex justify-center relative"
                    >
                        {/* Decorative circle behind */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full blur-2xl opacity-40 scale-90 animate-pulse" />
                        
                        <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                            {/* 
                     Placeholder: Scientist looking into microscope.
                     Using CSS filters to blend it to look more like the provided design 
                 */}
                            <Image
                                src={SCIENCE_IMAGE}
                                alt="Scientist researching ingredients"
                                fill
                                className="object-contain object-center hover:scale-105 transition-transform duration-700"
                            />
                            {/* Overlay to give it that bluish tint */}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent mix-blend-multiply"></div>
                            
                            {/* Floating Badge */}
                            <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800">100% Clinically Verified Ingredients</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-full lg:w-1/3 space-y-8 lg:pl-12 text-center lg:text-left"
                    >
                        <div className="space-y-6">
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Each ingredient in our formulas is rigorously researched and selected for proven, visible benefits.
                            </p>
                            <p className="text-lg font-medium text-slate-900 leading-relaxed border-l-4 border-blue-500 pl-4">
                                Discover the science and experience the age-defying power of our products for lasting health and vitality.
                            </p>
                        </div>

                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-10 py-6 rounded-full shadow-lg shadow-blue-300/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                            Explore Now
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default IngredientScienceSection;
