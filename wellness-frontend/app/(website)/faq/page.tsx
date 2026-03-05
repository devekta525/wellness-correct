"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { HelpCircle } from "lucide-react";
import CompanyDetails from "@/components/legal/CompanyDetails";
import FeaturedCollectionSection from "@/components/home/featured-collection-section";

/**
 * FAQPage Component
 *
 * A premium, animated FAQ page for Wellness Fuel Private Limited.
 * Features:
 * - Mobile-first responsive layout
 * - Fade-in animations
 * - Interactive FAQ cards
 * - Official company information at the bottom
 * - Featured collection integration
 */
const FAQPage = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    const faqs = [
        {
            question: "Are your products natural?",
            answer: "Yes, all Wellness Fuel products are formulated with premium natural ingredients, sourced with the highest quality standards. We avoid artificial fillers and harmful additives."
        },
        {
            question: "How long until I see results?",
            answer: "While individual results vary, most users report feeling improvements in vitality and wellness within 2-4 weeks of consistent use."
        },
        {
            question: "Do you ship internationally?",
            answer: "Currently, we ship within India. We are working on expanding our reach to international customers soon!"
        },
        {
            question: "Are your supplements lab tested?",
            answer: "Absolutely. Every batch of our products undergoes rigorous third-party lab testing to ensure purity, potency, and safety."
        }
    ];

    return (
        <div className="min-h-screen bg-[#fcfdff]">
            <div className="max-w-4xl mx-auto px-4 md:px-10 py-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-12"
                >
                    {/* Header Section */}
                    <div className="text-center space-y-6 mb-20">
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl md:text-5xl font-extrabold tracking-tight"
                        >
                            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent italic font-serif uppercase">
                                Frequently Asked Questions
                            </span>
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-slate-500 max-w-2xl mx-auto text-lg pt-4"
                        >
                            Everything you need to know about Wellness Fuel – Premium Nutrition.
                        </motion.p>
                    </div>

                    {/* FAQ Grid */}
                    <div className="grid gap-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                                className="group bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] border border-slate-100 transition-all duration-300"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <HelpCircle className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-3 pt-1">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                {faq.question}
                                            </h3>
                                            <p className="text-slate-600 text-lg leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Official Company Details */}
                    <CompanyDetails />

                    {/* Footer Decoration */}
                    <motion.div
                        variants={itemVariants}
                        className="text-center pt-8"
                    >
                        <div className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium">
                            <span className="w-8 h-px bg-slate-200" />
                            <span className="uppercase tracking-widest text-[10px] sm:text-xs">Wellness Fuel Private Limited — Here to Help</span>
                            <span className="w-8 h-px bg-slate-200" />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
            {/* 
            Featured Collection Section from Remote Version */}
            {/* <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-12 px-4 md:px-0">
                <FeaturedCollectionSection />
            </div> */}
        </div>
    );
};

export default FAQPage;
