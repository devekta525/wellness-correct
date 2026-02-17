"use client";
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Product1 from "../../public/supplement-bottle-blue.png"
import Product2 from "../../public/1.jpg"
import Product4 from "../../public/4.jpg"

// Sample data to match the image content
const products = [
    {
        id: 1,
        name: "Forever Gut",
        price: "1,477.00",
        originalPrice: "1,970.00",
        image: Product1, // Replace with  holding product image
        hoverImage: Product1, // Replace with ingredients/detail image
    },
    {
        id: 2,
        name: "Longevity Pro",
        price: "2,774.00",
        originalPrice: "3,699.00",
        image: Product2,
        hoverImage: Product2,
    },
    {
        id: 3,
        name: "Complete Gut Fibre",
        price: "974.00",
        originalPrice: "1,299.00",
        image: Product1,
        hoverImage: Product1,
    },
    {
        id: 4,
        name: "Complete Superfoods Blend",
        price: "1,499.00",
        originalPrice: "1,999.00",
        image: Product4,
        hoverImage: Product4,
    },
];

const LiveLimitlessSection = () => {
    return (
        <section className="py-16 bg-white/0 dark:bg-slate-950 overflow-hidden">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {products.map((product) => (
                        <div key={product.id} className="flex flex-col items-center group">

                            {/* Image Container with Hover Effect */}
                            <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl bg-slate-50 border border-transparent group-hover:border-blue-200 transition-colors">

                                {/* Default Image (Visible by default, hidden on hover) */}
                                <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0 flex items-center justify-center">
                                    {/* Placeholder styling to mimic the look if real image is missing */}
                                    <div className="w-full h-full relative">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Hover Image (Hidden by default, visible on hover) */}
                                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center bg-white">
                                    <div className="w-full h-full relative">
                                        <Image
                                            src={product.hoverImage}
                                            alt={`${product.name} details`}
                                            fill
                                            className="object-contain p-4"
                                        />
                                    </div>

                                    {/* Quick Add Button showing on hover */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 w-max">
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-200 flex items-center gap-2 h-10">
                                            <Plus className="w-4 h-4" />
                                            Quick add
                                        </Button>
                                    </div>
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

                {/* Bottom Title */}
                <div className="text-center">
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-blue-300/80 tracking-tight">
                        Live Limitless
                    </h2>
                </div>

            </div>
        </section>
    );
};

export default LiveLimitlessSection;
