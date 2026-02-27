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
    Activity,
    Zap,
    Dna
} from 'lucide-react';
import Image from 'next/image';
import resin from '@/public/images/science/resin.png';
import coffee from '@/public/images/science/coffee.png';
import blend from '@/public/images/science/blend.png';

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

export default function ProductScienceSection() {
    return (
        <section className="w-full bg-slate-50 text-slate-600 font-sans overflow-hidden py-16 lg:py-24 hover:bg-white transition-colors duration-500">
            {/* 1. Intro - Two Column */}
            <div className="max-w-7xl mx-auto px-4 mb-20 lg:mb-32">
                <FadeInView>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                                <span className="flex items-center gap-3 mb-4 text-blue-600 hover:scale-105 transition-transform duration-300">
                                    <Dna className="w-8 h-8" />
                                </span>
                                Science Behind <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                                    Every Formula
                                </span>
                            </h2>

                            <div className="space-y-6 text-lg leading-relaxed max-w-2xl">
                                <p className="hover:text-slate-800 transition-colors">
                                    At Wellness Fuel, every product is developed through a research-driven process focused on purity, potency, and measurable performance.
                                </p>
                                <p className="hover:text-slate-800 transition-colors">
                                    From Himalayan Shilajit Resin to advanced Superfood Blends and Functional Coffee, our formulations are engineered to deliver consistent results — not marketing promises.
                                </p>
                                <p className="font-semibold text-blue-800 border-l-4 border-blue-500 pl-5 py-2 bg-blue-50 hover:bg-blue-100 rounded-r-xl transition-all shadow-sm">
                                    We combine traditional ingredient wisdom with modern extraction science to create premium nutraceutical solutions for India.
                                </p>
                            </div>
                        </div>

                        <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl group border border-slate-200">
                            <div className="absolute inset-0 bg-white">
                                <Image
                                    src={resin}
                                    alt="Himalayan Shilajit Resin"
                                    fill
                                    className="object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
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
                            { icon: Activity, title: "Advanced Standardization", desc: "Guaranteed active compound percentages." },
                            { icon: FlaskConical, title: "Lab-Tested Purity", desc: "Rigorously tested against heavy metals." },
                            { icon: Zap, title: "Performance Optimization", desc: "Engineered for cellular energy & vitality." },
                            { icon: Award, title: "Nationwide Trust", desc: "Setting the gold standard in nutraceuticals." }
                        ].map((card, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 p-8 rounded-2xl hover:bg-white hover:border-blue-200 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{card.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </FadeInView>
            </div>

            {/* 3. Detailed Sections */}
            <div className="max-w-7xl mx-auto px-4 mb-20 lg:mb-32 space-y-20 lg:space-y-32">

                <FadeInView>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="order-2 lg:order-1 relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl group border border-slate-200 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
                            <Image
                                src={coffee}
                                alt="Functional Coffee Formulation"
                                fill
                                className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-6 max-w-2xl group">
                            <h3 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <Microscope className="w-8 h-8 text-cyan-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                Advanced Ingredient Standardization
                            </h3>
                            <p className="text-lg leading-relaxed text-slate-600">
                                Our products are built on standardized active compounds:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "75% Fulvic Acid in Himalayan Shilajit",
                                    "85+ Trace Minerals for cellular performance",
                                    "Concentrated Shilajit extract in functional coffee",
                                    "Antioxidant-rich greens blend for metabolic support"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 hover:-translate-y-0.5 transition-transform">
                                        <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 bg-cyan-50 border border-cyan-100 p-6 rounded-2xl border-l-4 border-l-cyan-500 hover:shadow-md transition-shadow">
                                <p className="text-cyan-800 font-medium">Standardization ensures potency, absorption, and batch-to-batch consistency.</p>
                            </div>
                        </div>
                    </div>
                </FadeInView>

                {/* Section Purity Potency */}
                <FadeInView>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-6 max-w-2xl group">
                            <h3 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                Purity & Quality Verification
                            </h3>
                            <p className="text-lg leading-relaxed text-slate-600">
                                Each product undergoes strict quality protocols:
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    "Controlled sourcing",
                                    "Purification & filtration process",
                                    "Heavy metal testing",
                                    "Active compound verification",
                                    "Batch-level quality checks"
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-1 transition-all shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                        <span className="text-slate-700 text-sm font-semibold">{item}</span>
                                    </div>
                                ))}
                            </ul>
                            <p className="font-bold text-blue-600 text-lg mt-6 block hover:text-blue-800 transition-colors">Because real wellness begins with verified quality.</p>
                        </div>
                        <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl group border border-slate-200 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
                            <Image
                                src={blend}
                                alt="Lab Tested Purity"
                                fill
                                className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                        </div>
                    </div>
                </FadeInView>

                {/* Designed for Modern India */}
                <FadeInView>
                    <div className="max-w-4xl mx-auto text-center space-y-12 bg-white border border-slate-100 rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-shadow duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/50 blur-[100px] pointer-events-none rounded-full" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/50 blur-[100px] pointer-events-none rounded-full" />

                        <div className="relative z-10 space-y-8">
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 group">
                                <Zap className="w-10 h-10 text-blue-500 mx-auto mb-4 hover:scale-125 transition-transform" />
                                Performance-Oriented Formulations
                            </h3>
                            <p className="text-lg text-slate-600">Wellness Fuel products are designed to support:</p>

                            <div className="flex flex-wrap justify-center gap-4">
                                {[
                                    "Natural energy production",
                                    "Stamina and endurance",
                                    "Vitality and recovery",
                                    "Immune resilience",
                                    "Metabolic balance"
                                ].map((item, idx) => (
                                    <span key={idx} className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-1 transition-all flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-8 mt-8 border-t border-slate-100">
                                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 italic hover:scale-[1.02] transition-transform">
                                    "Every formula is optimized for the modern Indian lifestyle."
                                </p>
                            </div>
                        </div>
                    </div>
                </FadeInView>
            </div>

            {/* 4. Certifications Row */}
            <div className="w-full bg-blue-600 border-y border-blue-500 py-16 px-4 hover:bg-blue-700 transition-colors duration-500">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 group">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                            🇮🇳 Raising the Standard of Indian Nutraceuticals
                        </h3>
                        <p className="text-blue-200 font-medium">Integrity • Transparency • Scientific Credibility • Premium Quality</p>
                    </div>

                    <p className="text-center text-blue-100 text-sm font-bold uppercase tracking-widest mb-10 border-t border-blue-500 pt-10">
                        Certified Excellence
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                        {[
                            { icon: ShieldCheck, text: "GMP Certified" },
                            { icon: BadgeCheck, text: "FSSAI Approved" },
                            { icon: Award, text: "ISO Certified" },
                            { icon: FlaskConical, text: "3rd Party Lab Tested" },
                        ].map((cert, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white/10 px-8 py-5 rounded-2xl border border-white/20 hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm cursor-default">
                                <cert.icon className="w-8 h-8 text-cyan-300 group-hover:scale-125 group-hover:rotate-6 transition-all" />
                                <span className="text-white font-bold tracking-wide text-lg group-hover:text-cyan-50 transition-colors">{cert.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </section>
    );
}
