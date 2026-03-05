"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface CommonHeroProps {
    title: string;
    description?: string;
    image?: string;
    breadcrumbs?: Breadcrumb[];
}

const CommonHero = ({
    title,
    description,
    image = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop",
    breadcrumbs = [],
}: CommonHeroProps) => {
    return (
        <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 0 && (
                        <nav className="flex items-center justify-center gap-2 mb-6 text-sm font-medium text-blue-200">
                            <Link href="/" className="hover:text-white transition-colors">
                                Home
                            </Link>
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    <ChevronRight className="w-4 h-4 text-blue-300/50" />
                                    {crumb.href ? (
                                        <Link
                                            href={crumb.href}
                                            className="hover:text-white transition-colors"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="text-white">{crumb.label}</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </nav>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 drop-shadow-lg">
                        {title}
                    </h1>
                    {description && (
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-200 leading-relaxed drop-shadow-md">
                            {description}
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Bottom Curve/Design Element */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white dark:from-slate-950 to-transparent z-10" />
        </section>
    );
};

export default CommonHero;
