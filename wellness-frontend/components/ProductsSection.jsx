'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { getApiV1Url } from '@/lib/utils/api';

const categories = [
  { name: 'All', icon: '✨' },
  { name: 'Supplements', icon: '💊' },
  // { name: 'Vitamins', icon: '🍎' },
  { name: 'Beverages', icon: '🥤' },
  { name: 'Wellness', icon: '🧘' },
  { name: 'Superfood', icon: '🫐' },
  { name: 'Beauty Nutrition', icon: '💅' },
  { name: 'Antioxidant', icon: '🍇' },
  // { name: 'Performance', icon: '⚡' },
  // { name: 'Ayurvedic', icon: '🌿' }
];

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
    <section className="py-12 sm:py-24 pattern-dots relative overflow-hidden bg-white">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="w-full max-w-screen-xl mx-auto px-4 relative">

        {/* ── Section header ── */}
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4 sm:mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 tracking-widest uppercase">Our Products</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Premium Wellness <span className="text-blue-600">Collection</span>
          </h2>

          <p className="text-slate-500 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Scientifically formulated superfoods crafted to help you achieve peak health and vitality.
          </p>
        </div>



        {/* ── Category filters (Horizontal Scrollable) ── */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Shop by Category</h3>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-2 whitespace-nowrap px-5 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 border ${activeCategory === cat.name
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                  : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Products grid (2 per row on mobile) ── */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-slate-500">Loading products...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filtered.slice(0, 12).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            No products found for this category.
          </div>
        )}

        {/* View All CTA ── */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black hover:scale-105 transition-all duration-300"
          >
            View All Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* ── Trust badges ── */}
        <div className="mt-20 sm:mt-32 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { icon: '🔬', title: 'Lab Tested', desc: 'verified by third-party labs' },
            { icon: '🌿', title: 'Natural', desc: 'No artificial additives' },
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999' },
            { icon: '💯', title: 'Authentic', desc: 'Pure premium ingredients' },
          ].map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-5 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300"
            >
              <span className="text-3xl sm:text-2xl">{badge.icon}</span>
              <div>
                <div className="text-sm font-bold text-slate-900 mb-1">{badge.title}</div>
                <div className="text-[11px] text-slate-500 leading-tight">{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
