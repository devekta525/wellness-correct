"use client";
import React, { useEffect, use, useState } from 'react';
import Link from 'next/link';
import ProductDetailView from '@/components/product-detail/ProductDetailView';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
    fetchProductBySlug,
    selectSelectedProduct,
    selectProductsLoading,
    clearSelectedProduct
} from '@/lib/redux/features/productSlice';
import Loader from '@/components/common/dashboard/Loader';
import { ArrowLeft } from 'lucide-react';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const dispatch = useAppDispatch();
    const product = useAppSelector(selectSelectedProduct);
    const isLoading = useAppSelector(selectProductsLoading);

    useEffect(() => {
        if (slug) {
            dispatch(fetchProductBySlug(slug));
        }
        return () => {
            dispatch(clearSelectedProduct());
        }
    }, [dispatch, slug]);


    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader variant="spinner" message="Loading product details..." />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <h1 className="text-3xl font-bold text-slate-800">Product Not Found</h1>
                <p className="text-slate-500 text-lg">The product you are looking for does not exist or has been removed.</p>
                <Link href="/collab" className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Collection
                </Link>
            </div>
        );
    }

    return <ProductDetailView product={product} />;
}
