"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Database, Eye, Share2, Cookie, Lock, UserCheck, UserMinus, Info, HeartPulse } from "lucide-react";
import CompanyDetails from "@/components/legal/CompanyDetails";

/**
 * PrivacyPolicy Component
 * 
 * A premium, animated Privacy Policy page for Wellness Fuel Private Limited.
 * Features:
 * - Mobile-first responsive layout
 * - Fade-in animations
 * - Subtle hover lift effects on cards
 * - Official company information at the bottom
 */
const PrivacyPolicy = () => {
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
      id: 1,
      title: "1. Information We Collect",
      icon: <Database className="w-6 h-6 text-blue-600" />,
      subsections: [
        {
          subtitle: "A. Personal Information",
          content: [
            "Full Name",
            "Email Address",
            "Phone Number",
            "Billing & Shipping Address",
            "Payment Information (processed securely via third-party payment gateways)"
          ]
        },
        {
          subtitle: "B. Non-Personal Information",
          content: [
            "IP Address",
            "Browser type and version",
            "Device information",
            "Pages visited",
            "Time spent on the website"
          ]
        },
        {
          subtitle: "C. Voluntary Health Information",
          icon: <HeartPulse className="w-5 h-5 text-blue-500 mr-2" />,
          content: [
            "If you voluntarily provide wellness-related details for product recommendations, we collect such information only with your consent."
          ]
        }
      ]
    },
    {
      id: 2,
      title: "2. How We Use Your Information",
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      content: [
        "Process and deliver your orders",
        "Provide customer support",
        "Send order confirmations and updates",
        "Improve website performance",
        "Personalize your shopping experience",
        "Send marketing communications (if opted-in)",
        "Comply with legal obligations"
      ]
    },
    {
      id: 3,
      title: "3. Sharing of Information",
      icon: <Share2 className="w-6 h-6 text-blue-600" />,
      content: [
        "We do not sell or rent your personal information.",
        "We may share information with: Payment processors, Courier & logistics partners, Hosting & analytics service providers, Government authorities when required by law"
      ]
    },
    {
      id: 4,
      title: "4. Cookies & Tracking Technologies",
      icon: <Cookie className="w-6 h-6 text-blue-600" />,
      content: [
        "We use cookies to: Maintain login sessions, Improve website functionality, Analyze user behavior, Display relevant promotions.",
        "You can manage cookie preferences through your browser settings."
      ]
    },
    {
      id: 5,
      title: "5. Data Security",
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      content: [
        "We implement industry-standard security measures, including encryption and secure servers, to protect your information.",
        "However, no online transmission is 100% secure."
      ]
    },
    {
      id: 6,
      title: "6. Your Rights",
      icon: <UserCheck className="w-6 h-6 text-blue-600" />,
      content: [
        "Access your personal data",
        "Request corrections",
        "Request deletion of data",
        "Withdraw marketing consent",
        "To exercise these rights, contact us at: dr.ritesh@wellnessfuel.in"
      ]
    },
    {
      id: 7,
      title: "7. Children's Privacy",
      icon: <UserMinus className="w-6 h-6 text-blue-600" />,
      content: [
        "Our products are not intended for individuals under 18 years of age.",
        "We do not knowingly collect personal data from minors."
      ]
    },
    {
      id: 8,
      title: "8. Changes to This Policy",
      icon: <Info className="w-6 h-6 text-blue-600" />,
      content: [
        "We may update this Privacy Policy periodically.",
        "Updates will be posted on this page with a revised effective date."
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
                PRIVACY POLICY
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
              Welcome to <span className="text-slate-900 font-semibold">Wellness Fuel Private Limited</span> (“Wellness Fuel”, “we”, “our”, “us”). We value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit <span className="text-blue-600 font-medium">www.wellnessfuel.in</span> or purchase our products.
            </motion.p>
          </div>

          {/* Cards Section */}
          <div className="grid gap-8">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                variants={itemVariants}
                className="group bg-white rounded-2xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] border border-slate-100 transition-all duration-300 hover:-translate-y-1"
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

                    {section.subsections ? (
                      <div className="space-y-6">
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
                    ) : (
                      <ul className="space-y-4">
                        {section.content?.map((item, index) => (
                          <li key={index} className="flex gap-3 text-slate-600 leading-relaxed text-base md:text-lg">
                            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
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
              <span className="uppercase tracking-widest text-[10px] sm:text-xs">Wellness Fuel Private Limited — All Rights Reserved</span>
              <span className="w-12 h-px bg-slate-200" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
