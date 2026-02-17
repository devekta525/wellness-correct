"use client";
import React from 'react';
import { WheatOff, BoxSelect, FlaskConicalOff, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturesBar = () => {
    const features = [
        { icon: WheatOff, label: "No Gluten" },
        { icon: BoxSelect, label: "No Sugar" }, // Using BoxSelect as a proxy for cubes/sugar
        { icon: FlaskConicalOff, label: "No Preservatives" },
        { icon: Leaf, label: "100% Veg" },
    ];

    return (
        <section className="relative bg-gradient-to-r from-blue-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-y border-blue-100/50 dark:border-slate-800 py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center gap-4 group cursor-default"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-blue-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center justify-center relative z-10 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-blue-200 group-hover:shadow-xl">
                                    <feature.icon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors duration-300" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="text-center">
                                <span className="font-bold text-slate-700 dark:text-slate-200 text-lg group-hover:text-blue-700 transition-colors duration-300 block">
                                    {feature.label}
                                </span>
                                <div className="h-1 w-0 bg-blue-500 mx-auto rounded-full mt-2 transition-all duration-300 group-hover:w-1/2 opacity-0 group-hover:opacity-100" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesBar;
