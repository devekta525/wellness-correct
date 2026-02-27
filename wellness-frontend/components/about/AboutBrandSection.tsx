import React from 'react';
import { ShieldCheck, Leaf, TestTube, Globe2, Sparkles, TrendingUp, Heart, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function AboutBrandSection() {
    return (
        <div className="w-full bg-white text-slate-900 font-sans">
            {/* Hero Section */}
            <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-slate-50 flex flex-col items-center justify-center text-center px-4">
                {/* Subtle background decoration */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-2 border border-blue-100 uppercase tracking-widest shadow-sm hover:shadow-md transition-shadow">
                        <Leaf className="w-4 h-4" />
                        <span>About Wellness Fuel</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                        Redefining <span className="text-blue-600">Modern Wellness</span> for India
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-3xl mx-auto">
                        Wellness Fuel was created with a simple yet powerful vision — to bring science-backed, premium-quality nutrition to every household in India. In a market flooded with low-quality supplements and false promises, we stand for purity, transparency, and real results.
                    </p>
                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-semibold mt-6 max-w-3xl mx-auto border-l-4 border-blue-500 pl-6 py-2 bg-white/60 rounded-r-2xl shadow-sm italic hover:-translate-y-1 transition-transform">
                        "We don’t just sell supplements. We deliver performance, vitality, and long-term wellness."
                    </p>
                </div>
            </section>

            {/* Pure. Potent. Proven. */}
            <section className="w-full py-20 px-4 bg-white relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 flex flex-col items-start gap-3">
                            <Sparkles className="w-8 h-8 text-blue-500 mb-2" />
                            Pure. Potent. Proven.
                        </h2>
                        <div className="text-lg text-slate-600 space-y-6 leading-relaxed">
                            <p>
                                At Wellness Fuel, we believe nature provides the most powerful ingredients — when handled correctly.
                            </p>
                            <ul className="space-y-4 font-medium text-slate-800">
                                <li className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <TestTube className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span>Clinically studied ingredients</span>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <span>High bioavailability compounds</span>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <span>Advanced purification processes</span>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <span>Strict quality control testing</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 md:p-12 rounded-[2rem] border border-slate-100 relative hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-8 right-8 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-60" />
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2 group">
                                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                                    Himalayan Shilajit
                                </h4>
                                <p className="text-slate-600">Contains high fulvic acid content and trace minerals.</p>
                            </div>
                            <div className="space-y-2 group">
                                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                                    Superfood Blend
                                </h4>
                                <p className="text-slate-600">Rich in plant-based nutrients and antioxidants.</p>
                            </div>
                            <div className="space-y-2 group">
                                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                                    Collagen & Glutathione
                                </h4>
                                <p className="text-slate-600">Designed for cellular support and radiance.</p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-slate-200">
                                <p className="text-blue-700 font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6" />
                                    Every batch is tested for safety, purity, and potency.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Commitment to Quality */}
            <section className="w-full py-24 bg-blue-600 text-white relative px-4 overflow-hidden">
                {/* Subtle light accent decoration */}
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[100px]" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white inline-flex flex-col items-center">
                            Our Commitment to Quality
                            <div className="mt-4 h-1 w-24 bg-white/80 rounded-full" />
                        </h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
                            Quality is not a marketing line for us — it is our foundation.
                            We follow stringent manufacturing standards and partner with certified facilities to ensure:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 border border-white/20 p-8 rounded-3xl hover:bg-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <Leaf className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Premium Sourcing</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                The highest grade ingredients rigorously selected for absolute purity and potency.
                            </p>
                        </div>
                        <div className="bg-white/10 border border-white/20 p-8 rounded-3xl hover:bg-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">No Harmful Additives</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Clean labels. No hidden proprietary blends or unnecessary fillers.
                            </p>
                        </div>
                        <div className="bg-white/10 border border-white/20 p-8 rounded-3xl hover:bg-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Transparent Labeling</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                We show exactly what's inside every bottle, so you know what you are taking.
                            </p>
                        </div>
                        <div className="bg-white/10 border border-white/20 p-8 rounded-3xl hover:bg-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Consistent Performance</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Reliable formulas designed to deliver sustained results, batch after batch.
                            </p>
                        </div>
                    </div>
                    <div className="mt-16 text-center hover:scale-[1.02] transition-transform">
                        <p className="inline-block px-8 py-4 bg-white/10 rounded-full text-white font-medium border border-white/20 max-w-4xl leading-relaxed backdrop-blur-md shadow-lg">
                            Our mission is to set a new benchmark in India’s nutraceutical industry by delivering products customers can truly trust.
                        </p>
                    </div>
                </div>
            </section>

            {/* Built for India */}
            <section className="w-full py-20 px-4 bg-slate-50 relative overflow-hidden">
                {/* Abstract India Background Elements */}
                <div className="absolute left-0 top-1/2 -ml-32 -translate-y-1/2 w-64 h-64 border-[30px] border-blue-100 rounded-full opacity-50 pulse-slow" />
                <div className="absolute right-0 bottom-0 -mr-32 -mb-20 w-80 h-80 border-[40px] border-cyan-100 rounded-full opacity-50" />

                <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-blue-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                        <Globe2 className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Built for India. <br className="hidden md:block" />
                        <span className="text-blue-600 block mt-2">Trusted Nationwide.</span>
                    </h2>
                    <div className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium space-y-6">
                        <p className="hover:text-slate-800 transition-colors">
                            Wellness Fuel is proudly built for the modern Indian lifestyle — balancing tradition with scientific advancement.
                        </p>
                        <p className="hover:text-slate-800 transition-colors">
                            Whether you're an athlete seeking endurance, a professional looking for sustained energy, or someone focused on long-term health and vitality — our products are designed to support your journey.
                        </p>
                        <p className="font-semibold text-blue-700 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                            We are committed to expanding wellness awareness across the nation and empowering individuals to take control of their health with confidence.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Vision */}
            <section className="w-full py-24 px-4 bg-blue-900 text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10 text-center space-y-12">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white flex flex-col items-center">
                        <Heart className="w-12 h-12 text-cyan-400 mb-6 hover:scale-110 hover:text-cyan-300 transition-transform cursor-default" />
                        Our Vision
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-100 font-light leading-relaxed">
                        To become India’s most trusted and innovative wellness brand by combining:
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-2xl mx-auto">
                        {['Nature’s power', 'Scientific research', 'Uncompromised quality', 'Customer-first transparency'].map((pill, i) => (
                            <span key={i} className="px-6 py-3 bg-blue-800/80 rounded-full text-white font-medium border border-blue-700/50 shadow-inner hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                                {pill}
                            </span>
                        ))}
                    </div>

                    <div className="pt-12 mt-12 border-t border-blue-800/50">
                        <p className="text-2xl md:text-3xl font-bold text-white italic leading-relaxed hover:text-cyan-100 transition-colors">
                            "We envision a future where premium nutrition is accessible, effective, and transformative."
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
