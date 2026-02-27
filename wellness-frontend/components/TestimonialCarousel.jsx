/* Server Component — CSS-only animation */

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    product: 'Super Food Blend',
    rating: 5,
    review:
      'Amazing energy boost! Been using for 3 months and my stamina has improved significantly. I feel 10 years younger.',
    avatar: 'from-pink-400 to-rose-500',
    initials: 'PS',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    location: 'Bangalore',
    product: 'Marine Collagen',
    rating: 5,
    review:
      'My skin looks absolutely radiant after just 6 weeks. People keep asking what I am doing differently — it\'s this collagen!',
    avatar: 'from-blue-400 to-cyan-500',
    initials: 'RM',
  },
  {
    id: 3,
    name: 'Ananya Krishnan',
    location: 'Chennai',
    product: 'Glutathione Tablet',
    rating: 5,
    review:
      'Visible skin brightening in 4 weeks! My dermatologist even noticed the glow improvement. Totally worth every rupee.',
    avatar: 'from-violet-400 to-purple-500',
    initials: 'AK',
  },
  {
    id: 4,
    name: 'Vikram Tiwari',
    location: 'Delhi',
    product: 'Shilajit Coffee',
    rating: 5,
    review:
      'Perfect morning ritual! Great earthy taste and wonderful sustained energy throughout the day — no afternoon crash at all.',
    avatar: 'from-amber-400 to-orange-500',
    initials: 'VT',
  },
  {
    id: 5,
    name: 'Meera Patel',
    location: 'Ahmedabad',
    product: 'Shilajit Resin',
    rating: 5,
    review:
      'Authentic Himalayan quality. Remarkable improvement in strength and workout recovery. Reordered twice already!',
    avatar: 'from-emerald-400 to-teal-500',
    initials: 'MP',
  },
  {
    id: 6,
    name: 'Arjun Desai',
    location: 'Pune',
    product: 'Super Food Blend',
    rating: 4,
    review:
      'Best superfood blend I have tried in India. The taste is pleasant and the results are very real. Fast delivery too!',
    avatar: 'from-indigo-400 to-blue-500',
    initials: 'AD',
  },
  {
    id: 7,
    name: 'Kavya Nair',
    location: 'Kochi',
    product: 'Marine Collagen',
    rating: 5,
    review:
      'My joints feel so much better since I started this collagen supplement. Running pain-free for the first time in years.',
    avatar: 'from-fuchsia-400 to-pink-500',
    initials: 'KN',
  },
  {
    id: 8,
    name: 'Siddharth Roy',
    location: 'Kolkata',
    product: 'Glutathione Tablet',
    rating: 5,
    review:
      'No seasonal cold this year at all! My immunity has improved noticeably. The quality is clearly top-notch.',
    avatar: 'from-sky-400 to-blue-600',
    initials: 'SR',
  },
];

function TestimonialCard({ t }) {
  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl p-5 shadow-sm border border-blue-50/80 mx-3 hover:shadow-md hover:border-blue-100 transition-all duration-300">
      {/* Quote icon */}
      <Quote className="w-6 h-6 text-blue-100 mb-3" />

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
              }`}
          />
        ))}
      </div>

      {/* Review text */}
      <p className="text-[13px] text-slate-600 leading-relaxed mb-4 line-clamp-3">
        "{t.review}"
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-blue-50 mb-4" />

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.avatar} flex items-center justify-center flex-shrink-0 shadow-sm`}
        >
          <span className="text-white text-xs font-extrabold">{t.initials}</span>
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-slate-800 truncate">{t.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-blue-500 font-semibold truncate">{t.product}</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
              ✓ Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialCarousel() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50/80 via-sky-50 to-white overflow-hidden">
      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full mb-5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-600 tracking-widest uppercase">
              Customer Stories
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Real People,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Real Results
            </span>
          </h2>

          <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto">
            Join 50,000+ satisfied customers across India who have transformed their health with
            Wellness Fuel.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 md:gap-16 mt-10">
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '98%', label: 'Recommend Us' },
              { value: '12K+', label: 'Reviews Written' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-2xl md:text-3xl font-extrabold text-blue-700">
                  {s.value}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrolling rows ── */}
      <div className="space-y-4 marquee-container">
        {/* Row 1 — forward */}
        <div className="overflow-hidden">
          <div className="flex animate-marquee-slow">
            {doubled.map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>

        {/* Row 2 — reverse */}
        <div className="overflow-hidden">
          <div className="flex animate-marquee-slow-reverse">
            {[...doubled].reverse().map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
