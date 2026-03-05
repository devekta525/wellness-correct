"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
    ShoppingBag,
    CheckCircle,
    Settings,
    XCircle,
    RotateCcw,
    AlertCircle,
    Camera,
    Clock,
    ShieldCheck
} from "lucide-react";
import CompanyDetails from "@/components/legal/CompanyDetails";

/**
 * OrderRefundPolicy Component
 * 
 * A premium, animated Order & Refund Policy page for Wellness Fuel Private Limited.
 * Features:
 * - Mobile-first responsive layout
 * - Fade-in animations
 * - Subtle hover lift effects on cards
 * - Official company information at the bottom
 */
const OrderRefundPolicy = () => {
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

    const sections = [
        {
            id: "order-policy",
            title: "1. Order Policy",
            icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
            subsections: [
                {
                    subtitle: "Order Confirmation",
                    icon: <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />,
                    content: [
                        "Once you place an order, you will receive an email confirming receipt of your order.",
                        "A second email will be sent once your order has been dispatched.",
                        "For Cash on Delivery (COD) orders, confirmation via phone or email may be required before dispatch.",
                        "If you do not receive confirmation, please check your spam folder or contact our support team."
                    ]
                },
                {
                    subtitle: "Order Processing",
                    icon: <Settings className="w-5 h-5 text-blue-500 mr-2" />,
                    content: [
                        "Orders are processed within 1–2 business days (excluding Sundays and public holidays).",
                        "During sale periods or high demand, processing may take slightly longer.",
                        "All products are inspected before packaging and dispatch."
                    ]
                },
                {
                    subtitle: "Order Cancellation",
                    icon: <XCircle className="w-5 h-5 text-blue-500 mr-2" />,
                    content: [
                        "Orders can only be cancelled before they are shipped. Once shipped, cancellation is not possible.",
                        "To cancel, contact us immediately at dr.ritesh@wellnessfuel.in or +91 9667766523.",
                        "Refunds for cancelled orders will be processed within 7 business days to the original payment method."
                    ]
                }
            ]
        },
        {
            id: "refund-policy",
            title: "2. Refund & Return Policy",
            icon: <RotateCcw className="w-6 h-6 text-blue-600" />,
            content: [
                "Due to hygiene and safety standards for nutraceutical products, we follow strict return guidelines."
            ],
            subsections: [
                {
                    subtitle: "Eligible for Refund / Replacement",
                    icon: <ShieldCheck className="w-5 h-5 text-green-500 mr-2" />,
                    content: [
                        "The product was damaged during transit.",
                        "The product has a manufacturing defect.",
                        "An incorrect product was delivered."
                    ]
                },
                {
                    subtitle: "How to Raise a Request",
                    icon: <Camera className="w-5 h-5 text-blue-500 mr-2" />,
                    content: [
                        "Email us within 48 hours of delivery at dr.ritesh@wellnessfuel.in.",
                        "Attach clear photos of the product and packaging.",
                        "Late claims may not be accepted."
                    ]
                },
                {
                    subtitle: "Non-Returnable Conditions",
                    icon: <AlertCircle className="w-5 h-5 text-red-500 mr-2" />,
                    content: [
                        "The product has been used.",
                        "The seal is broken.",
                        "Packaging is damaged after delivery.",
                        "Batch number or label is tampered.",
                        "The request is raised after 48 hours."
                    ]
                },
                {
                    subtitle: "Refund Processing Timeline",
                    icon: <Clock className="w-5 h-5 text-blue-500 mr-2" />,
                    content: [
                        "Online Payments: Refunds will be processed to the original payment method within 7–10 working days after approval.",
                        "COD Orders: Refunds will be processed via bank transfer within 10–14 working days after approval."
                    ]
                }
            ]
        },
        {
            id: "limitation",
            title: "3. Limitation",
            icon: <AlertCircle className="w-6 h-6 text-blue-600" />,
            content: [
                "Wellness Fuel reserves the right to approve or reject refund claims after inspection.",
                "Our liability is limited to the product value only."
            ]
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
                            className="text-4xl md:text-6xl font-extrabold tracking-tight"
                        >
                            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                ORDER & REFUND POLICY
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
                            className="text-slate-500 max-w-3xl mx-auto text-lg leading-relaxed pt-4"
                        >
                            At <span className="text-slate-900 font-semibold">Wellness Fuel Private Limited</span>, we are committed to providing a smooth ordering experience and fair refund process. Please read this policy carefully before placing your order.
                        </motion.p>
                    </div>

                    {/* Policy Sections */}
                    <div className="grid gap-8">
                        {sections.map((section) => (
                            <motion.div
                                key={section.id}
                                variants={itemVariants}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                                className="group bg-white rounded-2xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] border border-slate-100 transition-all duration-300 overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                                            <div className="group-hover:text-white transition-colors duration-300">
                                                {section.icon}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-grow">
                                        <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                                            {section.title}
                                        </h2>

                                        {section.content && section.content.map((text, i) => (
                                            <p key={i} className="text-slate-600 text-lg leading-relaxed font-medium italic mb-2">
                                                {text}
                                            </p>
                                        ))}

                                        {section.subsections && (
                                            <div className="space-y-8 mt-4">
                                                {section.subsections.map((sub, idx) => (
                                                    <div key={idx} className="space-y-3">
                                                        <h3 className="flex items-center text-lg font-bold text-slate-800">
                                                            {sub.icon}
                                                            {sub.subtitle}
                                                        </h3>
                                                        <ul className="space-y-3">
                                                            {sub.content.map((item, i) => (
                                                                <li key={i} className="flex gap-3 text-slate-600 leading-relaxed text-base md:text-lg">
                                                                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                        className="text-center pt-16"
                    >
                        <div className="inline-flex items-center gap-3 text-slate-400 text-sm font-medium">
                            <span className="w-12 h-px bg-slate-200" />
                            <span className="uppercase tracking-widest text-[10px] sm:text-xs">Wellness Fuel Private Limited — Excellence in Nutrition</span>
                            <span className="w-12 h-px bg-slate-200" />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderRefundPolicy;
