'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { getApiV1Url } from '@/lib/utils/api';

const categories = ['All', 'Supplements', 'Vitamins', 'Beverages', 'Wellness', 'Superfood', 'Beauty Nutrition', 'Antioxidant', 'Performance', 'Ayurvedic'];

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(getApiV1Url('/products/public'));
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => (p.category && p.category.toLowerCase() === activeCategory.toLowerCase()));

  return (
    <section className="py-24 pattern-dots relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-5 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-[11px] font-bold text-blue-600 tracking-widest uppercase">Our Products</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
            Premium Wellness{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Collection
            </span>
          </h2>

          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Scientifically formulated supplements and superfoods crafted to help you achieve peak
            health, vitality, and radiance.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-blue-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-blue-300" />
          </div>
        </div>

        {/* ── Category filters ── */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${activeCategory === cat
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 scale-[1.02]'
                : 'bg-white text-slate-600 border border-blue-100 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Products grid (4 per row) ── */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-slate-500">Loading products...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {filtered.slice(0, 8).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            No products found for this category.
          </div>
        )}

        {/* View All CTA ── */}
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-dashed border-blue-200 rounded-2xl text-blue-700 font-semibold hover:border-blue-400 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5" />
            View All Products
          </Link>
        </div>

        {/* ── Trust badges below cards ── */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔬', title: 'Lab Tested', desc: 'Every batch verified by third-party labs' },
            { icon: '🌿', title: 'Natural Ingredients', desc: 'No artificial additives or fillers' },
            { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered within 3–5 business days' },
            { icon: '💯', title: '30-Day Guarantee', desc: 'Full refund if not satisfied' },
          ].map((badge) => (
            <div
              key={badge.title}
              className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-blue-50 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{badge.icon}</span>
              <div>
                <div className="text-sm font-bold text-slate-800 mb-0.5">{badge.title}</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
