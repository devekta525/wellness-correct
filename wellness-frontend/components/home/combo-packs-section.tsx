"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight } from 'lucide-react';
import Product1 from "../../public/supplement-bottle-blue.png"
import Product2 from "../../public/1.jpg"
import Product3 from "../../public/5.webp"
import Product4 from "../../public/4.jpg"

const combos = [
    {
        id: 1,
        name: "Gut Correction Combo",
        price: "2,289.00",
        originalPrice: "3,269.00",
        image: Product1, // Replace with combo image
    },
    {
        id: 2,
        name: "Metabolic Correction Pack",
        price: "2,329.00",
        originalPrice: "4,659.00",
        image: Product2,
        isHovered: true, // For demo purposes in code, but logic handles real hover
    },
    {
        id: 3,
        name: "Liver Health Revive Pack",
        price: "3,128.00",
        originalPrice: "4,469.00",
        image: Product3,
    },
    {
        id: 4,
        name: "Gut Correction Combo",
        price: "2,289.00",
        originalPrice: "3,269.00",
        image: Product1, // Replace with combo image
    },
    {
        id: 5,
        name: "Metabolic Correction Pack",
        price: "2,329.00",
        originalPrice: "4,659.00",
        image: Product4,
        isHovered: true, // For demo purposes in code, but logic handles real hover
    },
    {
        id: 6,
        name: "Liver Health Revive Pack",
        price: "3,128.00",
        originalPrice: "4,469.00",
        image: Product3,
    },
];

import { useRouter } from "next/navigation";

const ComboPacksSection = () => {
    const router = useRouter();
    return (
        <section className="py-16 bg-white dark:bg-slate-950 overflow-hidden">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900">
                        Wellness Combo Packs
                    </h2>
                    <Link href="/products" className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors">
                        <span className="text-sm font-medium">View all</span>
                        <div className="bg-slate-100 rounded-full p-1">
                            <ChevronRight className="w-3 h-3" />
                        </div>
                    </Link>
                </div>

                {/* Combo Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {combos.map((product) => (
                        <div key={product.id} className="flex flex-col items-center group cursor-pointer">

                            {/* Image Container */}
                            <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden rounded-xl bg-slate-50 border border-transparent group-hover:border-blue-100 transition-all">
                                <div className="absolute inset-0 flex items-center justify-center p-6">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                </div>

                                {/* Quick Add Button showing on hover */}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                    <Button
                                        onClick={() => router.push(`/product/${product.name.toLowerCase().replace(/ /g, '-')}`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 text-xs font-medium shadow-lg flex items-center gap-1 h-8"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Quick add
                                    </Button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <h3 className="text-blue-900 font-bold text-lg mb-1 text-center group-hover:text-blue-600 transition-colors">{product.name}</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-blue-600 font-semibold">Rs. {product.price}</span>
                                <span className="text-slate-400 line-through text-xs">Rs. {product.originalPrice}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default ComboPacksSection;
