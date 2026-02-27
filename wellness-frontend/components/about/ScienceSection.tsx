"use client";
import React, { useEffect, useRef, useState } from 'react';
import {
    Microscope,
    FlaskConical,
    Leaf,
    ShieldCheck,
    Award,
    BadgeCheck,
    CheckCircle2,
    Activity
} from 'lucide-react';

const FadeInView = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        }, { threshold: 0.1 });

        if (domRef.current) observer.observe(domRef.current);
        const currentRef = domRef.current;
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default function ScienceSection() {
    return (
        <section className="w-full bg-[#0a0f16] text-slate-300 font-sans overflow-hidden py-16 lg:py-24">
            {/* 1. Intro - Two Column */}
            <div className="max-w-7xl mx-auto px-4 mb-20 lg:mb-32">
                <FadeInView>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                                <span className="flex items-center gap-3 mb-4 text-emerald-400">
                                    <Microscope className="w-8 h-8" />
                                </span>
                                Powered by Science. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                                    Perfected by Nature.
                                </span>
                            </h2>

                            <div className="space-y-6 text-lg leading-relaxed max-w-2xl">
                                <p>
                                    At Wellness Fuel, science is not a marketing claim — it is the foundation of every formulation.
                                </p>
                                <p>
                                    Each product is carefully developed using clinically studied ingredients, advanced purification techniques, and modern nutritional research to deliver measurable wellness outcomes for today’s lifestyle.
                                </p>
                                <p className="font-semibold text-white border-l-4 border-emerald-500 pl-5 py-2 bg-emerald-900/10 rounded-r-xl">
                                    We combine the strength of nature with the precision of science to create supplements that truly perform.
                                </p>
                            </div>
                        </div>

                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.1)] group">
                            <div className="absolute inset-0 bg-slate-800">
                                <img
                                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
                                    alt="Scientific Research"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/20 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </FadeInView>
            </div>

            {/* 2. 4 Feature Cards */}
            <div className="max-w-7xl mx-auto px-4 mb-20 lg:mb-32">
                <FadeInView delay={100}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Microscope, title: "Research-Driven Formulation", desc: "Scientific approach to active ingredient selection." },
                            { icon: FlaskConical, title: "Lab-Tested Purity", desc: "Contaminant testing & active ingredient verification." },
                            { icon: Activity, title: "Standardized Extracts", desc: "Engineered for maximum potency and absorption." },
                            { icon: ShieldCheck, title: "Nationwide Trust", desc: "Raising the standard of nutraceutical excellence." }
                        ].map((card, idx) => (
                            <div key={idx} className="bg-[#111827] border border-slate-800 p-8 rounded-2xl hover:bg-[#161f30] hover:border-emerald-500/30 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(16,185,129,0.05)] transition-all duration-300">
                                <div className="w-12 h-12 rounded-full bg-emerald-900/40 flex items-center justify-center mb-6 text-emerald-400">
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </FadeInView>
            </div>

            {/* 3. Detailed Sections */}
            <div className="max-w-7xl mx-auto px-4 mb-20 lg:mb-32 space-y-20 lg:space-y-32">

                <FadeInView>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="order-2 lg:order-1 relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group border border-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1000"
                                alt="Clinical Validation"
                                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="order-1 lg:order-2 space-y-6 max-w-2xl">
                            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Leaf className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                                Research-Driven Formulation Process
                            </h3>
                            <p className="text-lg leading-relaxed">
                                Every Wellness Fuel product follows a structured scientific approach:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Ingredient selection based on clinical validation",
                                    "Standardized extract concentrations",
                                    "Bioavailability optimization",
                                    "Stability and safety testing",
                                    "Third-party quality verification"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                                        <span className="text-slate-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-emerald-400/90 italic mt-6 font-medium bg-emerald-900/10 p-4 border border-emerald-900/30 rounded-xl">
                                From 75% fulvic acid Himalayan Shilajit to antioxidant-rich Superfood Greens and advanced Glutathione complexes, each formula is engineered for maximum potency and absorption.
                            </p>
                        </div>
                    </div>
                </FadeInView>

                {/* Section Purity Potency Performance */}
                <FadeInView>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-6 max-w-2xl">
                            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                                <FlaskConical className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                Purity. Potency. Performance.
                            </h3>
                            <p className="text-lg leading-relaxed">
                                We maintain strict quality benchmarks:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Manufactured in certified facilities",
                                    "Heavy metal & contaminant testing",
                                    "Active ingredient verification",
                                    "Batch-to-batch consistency control"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                                        <span className="text-slate-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 bg-[#111827] border border-amber-900/30 p-6 rounded-2xl shadow-lg border-l-4 border-l-amber-500">
                                <p className="font-bold text-amber-400 text-lg">Because real wellness begins with real quality.</p>
                            </div>
                        </div>
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group border border-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1579402434676-e910223f6d76?auto=format&fit=crop&q=80&w=1000"
                                alt="Purity and Lab Testing"
                                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </FadeInView>

                {/* Designed for Modern India */}
                <FadeInView>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="order-2 lg:order-1 relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group border border-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000"
                                alt="Modern Indian Lifestyle"
                                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="order-1 lg:order-2 space-y-6 max-w-2xl">
                            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                                <span className="text-3xl flex-shrink-0">🇮🇳</span> Designed for Modern India
                            </h3>
                            <p className="text-lg leading-relaxed">
                                India’s lifestyle demands energy, resilience, and recovery. Our science-backed formulations are designed to address:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                {[
                                    "Nutritional gaps",
                                    "Energy depletion",
                                    "Stress-related fatigue",
                                    "Immune challenges",
                                    "Performance decline"
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-[#111827] border border-slate-800 hover:border-emerald-500/30 transition-colors p-4 rounded-xl flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                                        <span className="text-slate-200 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-800">
                                <p className="text-white font-medium text-lg flex items-start gap-3">
                                    <Award className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                    Wellness Fuel is committed to raising the standard of nutraceutical excellence across the nation.
                                </p>
                            </div>
                        </div>
                    </div>
                </FadeInView>
            </div>

            {/* 4. Certifications Row */}
            <div className="bg-[#0f151e] border-y border-slate-800 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">
                        Certified Excellence
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        {[
                            { icon: ShieldCheck, text: "GMP Certified" },
                            { icon: BadgeCheck, text: "FSSAI Approved" },
                            { icon: Award, text: "ISO Certified" },
                            { icon: FlaskConical, text: "3rd Party Lab Tested" },
                        ].map((cert, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-[#111827] px-8 py-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:-translate-y-1 transition-all shadow-sm group">
                                <cert.icon className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                                <span className="text-white font-bold tracking-wide text-lg">{cert.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </section>
    );
}
