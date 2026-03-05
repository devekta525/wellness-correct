"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Cookie, ShieldCheck, Eye, Settings, HelpCircle, Bell, Clock } from "lucide-react";
import CompanyDetails from "@/components/legal/CompanyDetails";

/**
 * CookiePolicy Component
 * 
 * A premium, animated Cookie Policy page for Wellness Fuel Private Limited.
 * Features:
 * - Mobile-first responsive layout
 * - Fade-in animations
 * - Subtle hover lift effects on cards
 * - Official company information at the bottom
 */
const CookiePolicy = () => {
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
      title: "1. What Are Cookies",
      icon: <Cookie className="w-6 h-6 text-blue-600" />,
      content: [
        "Cookies are small text files that are placed on your computer or mobile device when you visit our website.",
        "They help us provide you with a better experience by remembering your preferences and enabling certain functionality."
      ],
    },
    {
      id: 2,
      title: "2. How We Use Cookies",
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      content: [
        "We use cookies to enhance your browsing experience, analyze website traffic, remember your preferences, and provide personalized content.",
        "Cookies help us understand how you interact with our website so we can improve our services."
      ],
    },
    {
      id: 3,
      title: "3. Types of Cookies We Use",
      icon: <Settings className="w-6 h-6 text-blue-600" />,
      subsections: [
        {
          subtitle: "Essential Cookies",
          content: ["These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website."]
        },
        {
          subtitle: "Analytics Cookies",
          content: ["These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously."]
        },
        {
          subtitle: "Preference Cookies",
          content: ["These cookies remember your choices and preferences to provide you with a more personalized experience."]
        },
        {
          subtitle: "Marketing Cookies",
          content: ["These cookies are used to track visitors across websites to display relevant and engaging advertisements."]
        }
      ]
    },
    {
      id: 4,
      title: "4. Third-Party Cookies",
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      content: [
        "We may also use third-party cookies from trusted partners to provide additional functionality, such as social media integration, analytics, and advertising services."
      ],
    },
    {
      id: 5,
      title: "5. Managing Cookies",
      icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
      content: [
        "You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies or delete them.",
        "However, disabling cookies may affect the functionality of our website."
      ],
    },
    {
      id: 6,
      title: "6. Cookie Consent",
      icon: <Bell className="w-6 h-6 text-blue-600" />,
      content: [
        "By continuing to use our website, you consent to our use of cookies as described in this policy.",
        "You can withdraw your consent at any time by adjusting your browser settings or contacting us."
      ],
    },
    {
      id: 7,
      title: "7. Updates to This Policy",
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      content: [
        "We may update this cookie policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons."
      ],
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
                COOKIE POLICY
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
              At <span className="text-slate-900 font-semibold">Wellness Fuel Private Limited</span>, we use cookies to provide a better, more personalized experience for our users. This policy explains what cookies are and how we use them.
            </motion.p>
          </div>

          {/* Cards Section */}
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
                      <p key={i} className="text-slate-600 text-lg leading-relaxed">
                        {text}
                      </p>
                    ))}

                    {section.subsections && (
                      <div className="space-y-6">
                        {section.subsections.map((sub, idx) => (
                          <div key={idx} className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">
                              {sub.subtitle}
                            </h3>
                            <ul className="space-y-2">
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
              <span className="uppercase tracking-widest text-[10px] sm:text-xs">Wellness Fuel Private Limited — Transparent & Secure</span>
              <span className="w-12 h-px bg-slate-200" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePolicy;
