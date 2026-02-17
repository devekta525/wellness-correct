"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, ShieldCheck, Truck, RefreshCcw, Star, ChevronRight, Minus, Plus, BadgePercent, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/formatters';

interface ProductImageZoomProps {
    src: string;
    alt: string;
}

const ProductImageZoom = ({ src, alt }: ProductImageZoomProps) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div
            ref={containerRef}
            className="relative aspect-square overflow-hidden rounded-2xl bg-[#f5f5f5] cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <motion.div
                className="w-full h-full"
                animate={{
                    scale: isHovering ? 2 : 1,
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain p-12"
                    priority
                />
            </motion.div>
        </div>
    );
};

export default function ProductDetailView({ product }: { product: any }) {
    // Handle images array or fallback to single image
    const images = product.images && product.images.length > 0
        ? product.images
        : [product.imageUrl || product.image || '/placeholder.png'];

    const productId = product._id || product.id || product.slug;

    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const { addToCart, updateQuantity, cartItems } = useCart();

    // Update selected image when product changes
    useEffect(() => {
        setSelectedImage(images[0]);
    }, [product]);

    if (!product) return null;

    // Handle Price Logic (supports object or number)
    const price = product.price?.amount ?? product.price ?? 0;
    const mrp = product.price?.mrp ?? product.originalPrice ?? 0;
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const handleAddToCart = () => {
        addToCart({
            id: productId,
            name: product.name,
            price: Number(price),
            image: images[0],
        }, 1);
    };

    const handleToggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: product.name, text: product.shortDescription, url: window.location.href });
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch (err) { console.error(err); }
    };

    const cartItem = cartItems.find((item) => item.id === productId);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    return (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-900 font-medium capitalize">{product.category}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-400 truncate">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Left: Images */}
                <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                    <ProductImageZoom src={selectedImage} alt={product.name} />

                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[#f5f5f5]
                                        ${selectedImage === img ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}
                                >
                                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-contain p-2" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col"
                >
                    <div className="mb-2">
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{product.category}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <span className="text-sm text-slate-500">(128 Reviews)</span>
                    </div>

                    <div className="flex items-baseline gap-4 mb-8">
                        <span className="text-3xl font-bold text-blue-600">{formatPrice(price)}</span>
                        {mrp > price && (
                            <span className="text-xl text-slate-400 line-through">{formatPrice(mrp)}</span>
                        )}
                        {discount > 0 && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                                <BadgePercent className="w-3 h-3" />
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        {product.shortDescription || product.description || "Scientifically formulated to support your wellness journey with premium ingredients and advanced bioavailability."}
                    </p>

                    <div className="space-y-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-12 flex-shrink-0">
                                <button
                                    onClick={() => updateQuantity(productId, Math.max(0, quantityInCart - 1))}
                                    className="px-3 md:px-4 py-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    disabled={quantityInCart <= 0}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 md:w-12 text-center font-bold text-lg">{quantityInCart}</span>
                                <button
                                    onClick={() => updateQuantity(productId, quantityInCart + 1)}
                                    className="px-3 md:px-4 py-2 hover:bg-slate-50 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </Button>
                            <button
                                onClick={handleToggleWishlist}
                                className={`h-12 w-12 flex items-center justify-center border rounded-lg transition-colors ${isWishlisted
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="h-12 w-12 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-blue-600"
                                title="Share"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 mt-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Quality Assured</h4>
                                <p className="text-xs text-slate-500">FSSAI Certified</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Fast Delivery</h4>
                                <p className="text-xs text-slate-500">3-5 Business Days</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                <RefreshCcw className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Return Policy</h4>
                                <p className="text-xs text-slate-500">7-Day Easy Returns</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Product Tabs / Details */}
            <div className="mt-20">
                <div className="flex items-center gap-8 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
                    {['details', 'ingredients', 'benefits', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-lg font-medium capitalize transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-[300px]"
                    >
                        {activeTab === 'details' && (
                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Product Description</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {product.longDescription || product.description || `Our ${product.name} is meticulously crafted to provide the highest quality nutraceutical support. Each batch undergoes rigorous testing to ensure purity and potency.`}
                                </p>
                                {(product.manufacturer || product.expiryDate) && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 p-6 bg-slate-50 rounded-2xl">
                                        {product.manufacturer && (
                                            <div>
                                                <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Manufacturer</span>
                                                <span className="text-slate-700">{product.manufacturer}</span>
                                            </div>
                                        )}
                                        {product.weightSize && (
                                            <div>
                                                <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Net Quantity</span>
                                                <span className="text-slate-700">{product.weightSize.value} {product.weightSize.unit}</span>
                                            </div>
                                        )}
                                        {product.expiryDate && (
                                            <div>
                                                <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Expiry Date</span>
                                                <span className="text-slate-700">{new Date(product.expiryDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ingredients' && (
                            <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Active Ingredients</h3>
                                    <div className="space-y-4">
                                        {product.ingredients && (Array.isArray(product.ingredients) ? product.ingredients : [product.ingredients]).map((ing: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-slate-700">{ing}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {product.dosageInstructions && (
                                    <div className="bg-blue-50 p-8 rounded-2xl h-fit">
                                        <h3 className="text-lg font-bold text-blue-900 mb-4">Recommended Dosage</h3>
                                        <p className="text-blue-800 leading-relaxed">{product.dosageInstructions}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'benefits' && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Key Benefits</h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {product.benefits && (Array.isArray(product.benefits) ? product.benefits : [product.benefits]).map((benefit: string, i: number) => (
                                        <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-shadow">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                                <Star className="w-5 h-5" />
                                            </div>
                                            <p className="text-slate-700 font-medium">{benefit}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                    <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Customer Reviews</h3>
                                <p className="text-slate-500 max-w-md mt-2">Reviews are coming soon. Be the first to review this product!</p>
                                <Button variant="outline" className="mt-6">Write a Review</Button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
