"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Truck, Package, Clock, ShieldCheck, CreditCard, Globe } from "lucide-react";
import CompanyDetails from "@/components/legal/CompanyDetails";

/**
 * ShippingPolicy Component
 * 
 * A premium, animated Shipping Policy page for Wellness Fuel Private Limited.
 * Features:
 * - Mobile-first responsive design
 * - Fade-in animations
 * - Subtle hover lift effects on cards
 * - Official company information at the bottom
 */
const ShippingPolicy = () => {
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
            transition: { duration: 0.5 },
        },
    };

    const sections = [
        {
            id: "1",
            title: "Order Confirmation",
            icon: <Package className="w-6 h-6 text-blue-600" />,
            content: [
                "Once you place an order, you will receive an email confirming receipt of your order.",
                "A second email will be sent once your order has been dispatched.",
                "For Cash on Delivery (COD) orders, confirmation via phone or email may be required before dispatch.",
            ],
        },
        {
            id: "2",
            title: "Order Processing & Dispatch",
            icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
            content: [
                "Most orders are dispatched within 1–2 business days (excluding Sundays and public holidays).",
                "Products may be shipped separately depending on availability.",
                "Every product is carefully inspected and securely packaged before dispatch.",
            ],
        },
        {
            id: "3",
            title: "Delivery Timeline",
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            content: [
                "Estimated delivery time is 5–8 business days, depending on your location.",
                "Delivery timelines may vary due to courier delays or unforeseen circumstances.",
                "Our delivery partners may contact you if they face difficulty reaching your address.",
            ],
        },
        {
            id: "4",
            title: "Shipping Charges",
            icon: <CreditCard className="w-6 h-6 text-blue-600" />,
            customContent: (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <span className="text-2xl">✅</span>
                        <p className="font-semibold text-green-800">Free Shipping on orders above ₹999.</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="text-2xl">🚚</span>
                        <p className="font-medium text-blue-800">A flat shipping fee of ₹50 applies to orders below ₹999.</p>
                    </div>
                </div>
            ),
        },
        {
            id: "5",
            title: "Service Availability",
            icon: <Globe className="w-6 h-6 text-blue-600" />,
            content: [
                "Currently, we ship only within India.",
                "International shipping is not available at this time.",
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
                            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                SHIPPING POLICY
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
                            At Wellness Fuel – Premium Nutrition, we aim to deliver your wellness products quickly and safely across India.
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
                                        <div className="flex items-center gap-3">
                                            <span className="text-blue-600/30 font-black text-2xl italic">0{section.id}</span>
                                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                                                {section.title}
                                            </h2>
                                        </div>

                                        {section.content && (
                                            <ul className="space-y-3">
                                                {section.content.map((item, index) => (
                                                    <li key={index} className="flex gap-3 text-slate-600 leading-relaxed text-base md:text-lg">
                                                        <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {section.customContent}
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

export default ShippingPolicy;
