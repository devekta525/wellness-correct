"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { ShieldCheck, Info, Scale, ShoppingBag, Truck, RotateCcw, UserCheck, Copyright, AlertTriangle, Lock, Gavel, RefreshCcw } from "lucide-react";
import CompanyDetails from "@/components/legal/CompanyDetails";

/**
 * TermsAndConditions Component
 * 
 * A premium, animated Terms & Conditions page for Wellness Fuel Private Limited.
 * Features:
 * - Mobile-first responsive design
 * - Fade-in animations
 * - Subtle hover lift effects on each section
 * - Official company information at the bottom
 */
const TermsAndConditions = () => {
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
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    const sections = [
        {
            id: 1,
            title: "1. Acceptance of Terms",
            icon: <UserCheck className="w-6 h-6 text-blue-600" />,
            content: [
                "By using this website, you confirm that:",
                "You are at least 18 years of age, or",
                "You are using the website under parental/guardian supervision.",
                "Your continued use of the website constitutes acceptance of these Terms."
            ],
        },
        {
            id: 2,
            title: "2. About Wellness Fuel",
            icon: <Info className="w-6 h-6 text-blue-600" />,
            content: [
                "Wellness Fuel provides premium nutraceutical and wellness products designed to support energy, immunity, metabolic health, and overall well-being.",
                "All products are intended for general wellness purposes and are not a substitute for medical treatment."
            ],
        },
        {
            id: 3,
            title: "3. Product Information & Disclaimer",
            icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
            content: [
                "Product descriptions, benefits, and ingredients are provided for informational purposes only.",
                "Our supplements are not intended to diagnose, treat, cure, or prevent any disease.",
                "Always consult a qualified healthcare professional before starting any supplement.",
                "Individual results may vary."
            ],
        },
        {
            id: 4,
            title: "4. Orders & Payments",
            icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
            content: [
                "All prices are listed in Indian Rupees (INR).",
                "We reserve the right to change pricing at any time without prior notice.",
                "Payment must be completed at checkout via approved payment methods.",
                "Orders suspected of fraud may be cancelled without prior notice."
            ],
        },
        {
            id: 5,
            title: "5. Shipping & Delivery",
            icon: <Truck className="w-6 h-6 text-blue-600" />,
            content: [
                "Delivery timelines are estimated and may vary by location.",
                "Delays caused by courier services or unforeseen circumstances are beyond our control.",
                "Customers are responsible for providing accurate shipping information."
            ],
        },
        {
            id: 6,
            title: "6. Returns & Refunds",
            icon: <RotateCcw className="w-6 h-6 text-blue-600" />,
            content: [
                "Returns are accepted only for unopened and unused products within 7 days of delivery.",
                "Refunds are processed after product inspection.",
                "Opened supplements cannot be returned for hygiene and safety reasons.",
                "Please review our Return & Refund Policy for full details."
            ],
        },
        {
            id: 7,
            title: "7. User Responsibilities",
            icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
            content: [
                "You agree not to:",
                "Use the website for unlawful activities",
                "Attempt to hack or disrupt the website",
                "Post misleading or harmful information",
                "Misuse promotional offers",
                "Violation may result in suspension of access."
            ],
        },
        {
            id: 8,
            title: "8. Intellectual Property",
            icon: <Copyright className="w-6 h-6 text-blue-600" />,
            content: [
                "All website content including: Logos, Product names, Designs, Text, Graphics is the exclusive property of Wellness Fuel and protected under Indian intellectual property laws.",
                "Unauthorized use is strictly prohibited."
            ],
        },
        {
            id: 9,
            title: "9. Limitation of Liability",
            icon: <Scale className="w-6 h-6 text-blue-600" />,
            content: [
                "Wellness Fuel shall not be liable for: Indirect or consequential damages, Allergic reactions due to undisclosed medical conditions, Misuse of products.",
                "Our maximum liability is limited to the purchase value of the product."
            ],
        },
        {
            id: 10,
            title: "10. Privacy",
            icon: <Lock className="w-6 h-6 text-blue-600" />,
            content: [
                "Your use of this website is also governed by our Privacy Policy."
            ],
        },
        {
            id: 11,
            title: "11. Governing Law",
            icon: <Gavel className="w-6 h-6 text-blue-600" />,
            content: [
                "These Terms are governed by the laws of India.",
                "Any disputes shall be subject to the jurisdiction of courts in Mumbai, Maharashtra."
            ],
        },
        {
            id: 12,
            title: "12. Modifications to Terms",
            icon: <RefreshCcw className="w-6 h-6 text-blue-600" />,
            content: [
                "We reserve the right to update these Terms at any time.",
                "Changes will be effective immediately upon posting."
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#fcfdff]">
            <div className="max-w-4xl mx-auto px-4 md:px-10 py-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-10"
                >
                    {/* Header Section */}
                    <div className="text-center space-y-4 mb-16">
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl md:text-6xl font-extrabold tracking-tight"
                        >
                            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent italic font-serif">
                                TERMS & CONDITIONS
                            </span>
                        </motion.h1>
                        <motion.div
                            variants={itemVariants}
                            className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold tracking-wide border border-blue-100"
                        >
                            Effective Date: 01 March 2026
                        </motion.div>
                        <motion.p
                            variants={itemVariants}
                            className="text-slate-500 max-w-2xl mx-auto text-lg pt-4"
                        >
                            Welcome to Wellness Fuel – Premium Nutrition. By accessing or using our website <span className="text-blue-600 font-medium">www.wellnessfuel.in</span>, you agree to comply with the following Terms & Conditions.
                        </motion.p>
                    </div>

                    {/* Cards Section */}
                    <div className="grid gap-6">
                        {sections.map((section) => (
                            <motion.div
                                key={section.id}
                                variants={itemVariants}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                                className="group relative bg-white rounded-3xl p-6 md:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.1)] border border-slate-100 transition-all duration-300 overflow-hidden"
                            >
                                {/* Subtle Background Accent */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-3xl" />

                                <div className="relative flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                                            <div className="group-hover:text-white transition-colors duration-300">
                                                {section.icon}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-grow">
                                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                                            {section.title}
                                        </h2>

                                        <ul className="space-y-3">
                                            {section.content.map((item, index) => (
                                                <li key={index} className="flex gap-3 text-slate-600 leading-relaxed text-base md:text-lg">
                                                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
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
                            <span className="uppercase tracking-widest text-[10px] sm:text-xs">Wellness Fuel Private Limited — Excellence in Nutrition</span>
                            <span className="w-8 h-px bg-slate-200" />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
