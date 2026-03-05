"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Building2, Mail, Phone, Globe, Ticket } from "lucide-react";

const CompanyDetails = () => {
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
            className="group bg-white rounded-2xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] border border-slate-100 transition-all duration-300 hover:-translate-y-1 mt-12"
        >
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                        <div className="group-hover:text-white transition-colors duration-300">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="space-y-8 flex-grow">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-blue-800 transition-all duration-300">
                        Company Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-slate-900 font-bold text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                Registered Office
                            </h3>
                            <div className="text-slate-500 text-lg leading-relaxed space-y-1">
                                <p className="font-semibold text-slate-800">Wellness Fuel Private Limited</p>
                                <p>304, 3rd Floor, Procapitus Business Park,</p>
                                <p>D-247, 4A, D Block, Sector 63,</p>
                                <p>Noida, Uttar Pradesh – 201309, India</p>
                            </div>

                            <div className="pt-4 flex items-center gap-2 text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 w-fit">
                                <Ticket className="w-5 h-5 text-blue-600" />
                                <span>GSTIN: 09AAECW2566L1ZS</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-slate-900 font-bold text-lg">Contact Information</h3>
                            <div className="flex flex-col gap-3">
                                <a
                                    href="tel:+919667766523"
                                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 group/link"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover/link:bg-white group-hover/link:shadow-sm transition-all">
                                        <Phone className="w-4 h-4 text-slate-400 group-hover/link:text-blue-600 transition-colors" />
                                    </div>
                                    <span className="text-slate-700 group-hover/link:text-blue-700 font-medium group-hover/link:underline underline-offset-4 decoration-2">
                                        +91 9667766523
                                    </span>
                                </a>
                                <a
                                    href="mailto:dr.ritesh@wellnessfuel.in"
                                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 group/link"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover/link:bg-white group-hover/link:shadow-sm transition-all">
                                        <Mail className="w-4 h-4 text-slate-400 group-hover/link:text-blue-600 transition-colors" />
                                    </div>
                                    <span className="text-slate-700 group-hover/link:text-blue-700 font-medium group-hover/link:underline underline-offset-4 decoration-2">
                                        dr.ritesh@wellnessfuel.in
                                    </span>
                                </a>
                                <a
                                    href="https://www.wellnessfuel.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 group/link"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover/link:bg-white group-hover/link:shadow-sm transition-all">
                                        <Globe className="w-4 h-4 text-slate-400 group-hover/link:text-blue-600 transition-colors" />
                                    </div>
                                    <span className="text-slate-700 group-hover/link:text-blue-700 font-medium group-hover/link:underline underline-offset-4 decoration-2">
                                        www.wellnessfuel.in
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CompanyDetails;
