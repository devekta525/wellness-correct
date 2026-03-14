import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight, Zap, Sparkles, TrendingUp, Tag,
  Truck, Shield, Headphones, RotateCcw, Clock,
  ChevronLeft, ChevronRight, Star, CheckCircle, Leaf, Quote,
  FlaskConical, Award, ShieldCheck, Microscope, Dna,
  Stethoscope, Video,
} from 'lucide-react';
import { fetchFeatured, fetchProducts, fetchCategories, fetchBrands } from '../../store/slices/productSlice';
import ProductCard from '../../components/product/ProductCard';
import { productAPI, reviewAPI } from '../../services/api';
import { useSite } from '../../context/SiteContext';

/* ─── Keyframes ─────────────────────────────────────────────────── */
const STYLES = `
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes marqueeText {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track {
    animation: marquee var(--md, 28s) linear infinite;
    will-change: transform;
  }
  .marquee-track:hover { animation-play-state: paused; }
  .marquee-text-track {
    animation: marqueeText 30s linear infinite;
    will-change: transform;
  }
  .marquee-text-track:hover { animation-play-state: paused; }
  @keyframes testimonialMarquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .testimonial-marquee-track {
    animation: testimonialMarquee 45s linear infinite;
    will-change: transform;
  }
  .testimonial-marquee-track:hover { animation-play-state: paused; }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  .float-anim { animation: float 4s ease-in-out infinite; }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .shimmer-text {
    background: linear-gradient(90deg, #60a5fa, #93c5fd, #3b82f6, #60a5fa);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
`;

/* ─── Skeleton ─────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
    <div className="aspect-square skeleton" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-5 w-1/2 rounded" />
    </div>
  </div>
);

/* ─── Countdown ─────────────────────────────────────────────────── */
const useCountdown = (hours = 4) => {
  const end = useRef(Date.now() + hours * 3_600_000);
  const [time, setTime] = useState({ h: hours, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const d = Math.max(0, end.current - Date.now());
      setTime({ h: Math.floor(d / 3_600_000), m: Math.floor((d % 3_600_000) / 60_000), s: Math.floor((d % 60_000) / 1_000) });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const TimerBox = ({ val, label }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="bg-gray-900 dark:bg-white/10 text-white font-mono font-black text-base w-9 h-9 flex items-center justify-center rounded-lg shadow-inner leading-none">
      {String(val).padStart(2, '0')}
    </span>
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
  </div>
);

/* ─── Scroll row ────────────────────────────────────────────────── */
const ScrollRow = ({ children }) => {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d * 300, behavior: 'smooth' });
  return (
    <div className="relative group/row">
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 transition-all duration-200 -translate-x-1 sm:-translate-x-3 hover:scale-110 touch-manipulation">
        <ChevronLeft size={14} className="sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
      </button>
      <div ref={ref} className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 transition-all duration-200 translate-x-1 sm:translate-x-3 hover:scale-110 touch-manipulation">
        <ChevronRight size={14} className="sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};

/* ─── Section header ────────────────────────────────────────────── */
const SectionHeader = ({ eyebrow, title, linkTo, linkLabel, icon: Icon, gradient, extra }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 bg-gradient-to-br ${gradient}`}>
          <Icon size={18} className="text-white" />
        </div>
      )}
      <div>
        {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-500 mb-0.5">{eyebrow}</p>}
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{title}</h2>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {extra}
      {linkTo && (
        <Link to={linkTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 px-4 py-2 rounded-full transition-all duration-200">
          {linkLabel || 'View all'} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  </div>
);

/* ─── Category / Brand cards ────────────────────────────────────── */
const CATEGORY_PLACEHOLDER = 'https://via.placeholder.com/200/c4b5fd/1e1b4b?text=Category';
const CategoryCard = ({ cat }) => (
  <Link to={`/category/${cat.slug}`}
    className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-800/80 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 shadow-sm hover:shadow-md text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700 overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300">
      <img src={cat.image || CATEGORY_PLACEHOLDER} alt={cat.name} className="w-full h-full object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = CATEGORY_PLACEHOLDER; }} />
    </div>
    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 leading-snug transition-colors">{cat.name}</span>
  </Link>
);

const BRAND_PLACEHOLDER = 'https://via.placeholder.com/200/fbbf24/1e1b4b?text=Brand';
const BrandCard = ({ brand }) => (
  <Link to={`/brand/${brand.slug}`}
    className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-800/80 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-300 shadow-sm hover:shadow-md text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700 overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300">
      <img src={brand.image || BRAND_PLACEHOLDER} alt={brand.name} className="w-full h-full object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = BRAND_PLACEHOLDER; }} />
    </div>
    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2 leading-snug transition-colors">{brand.name}</span>
  </Link>
);

/* ─── Testimonials fallback (when no reviews) ────────────────────── */
const TESTIMONIALS_FALLBACK = [
  { name: 'Rohan Mehta', location: 'Mumbai', rating: 5, text: 'Wellness Fuel\'s Shilajit Resin is exceptional. I noticed a significant boost in energy and focus within two weeks. The quality is unmatched.', avatar: 'R' },
  { name: 'Priya Sharma', location: 'Delhi', rating: 5, text: 'I\'ve tried many collagen supplements but Wellness Fuel\'s Marine Collagen is by far the best. My skin has improved dramatically in just a month.', avatar: 'P' },
  { name: 'Amit Joshi', location: 'Bangalore', rating: 5, text: 'The Super Food Blend is a game changer for my morning routine. Packed with nutrients and the taste is actually good. Highly recommended!', avatar: 'A' },
  { name: 'Kavya Nair', location: 'Chennai', rating: 5, text: 'Finally a brand that delivers on its promises. The Glutathione tablets have improved my skin radiance and overall well-being noticeably.', avatar: 'K' },
  { name: 'Siddharth Rao', location: 'Hyderabad', rating: 5, text: 'Premium quality supplements at a fair price. The lab testing transparency is what convinced me to switch to Wellness Fuel. No regrets!', avatar: 'S' },
];

/* ─── Star rating ───────────────────────────────────────────────── */
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={14} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   HomePage Component
═══════════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const dispatch = useDispatch();
  const { site, settings } = useSite();
  const { categories, brands, featured, loading } = useSelector((s) => s.products);
  const [flashDeals, setFlashDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingFlash, setLoadingFlash] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const timer = useCountdown(3);

  const siteBanners = Array.isArray(site?.banners) ? site.banners.filter((b) => b?.imageUrl) : [];

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchProducts({ sort: 'newest', limit: 8 }));
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    productAPI.getFlashDeals()
      .then((res) => setFlashDeals(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoadingFlash(false));
    productAPI.getAll({ sort: 'newest', limit: 8 })
      .then((res) => setNewArrivals(res.data.products || []))
      .catch(() => {});
    reviewAPI.getRecent({ limit: 12 })
      .then((res) => {
        setReviews(res.data.reviews || []);
        setReviewStats(res.data.stats || null);
      })
      .catch(() => {})
      .finally(() => {});
  }, [dispatch]);

  // testimonials: use real reviews or fallback; duplicated for seamless marquee
  const testimonialItems = reviews.length > 0
    ? reviews.map((r) => ({
        _id: r._id,
        name: r.user?.name || 'Customer',
        location: r.product?.title || '',
        rating: r.rating,
        text: r.comment,
        avatar: (r.user?.name || 'C').charAt(0).toUpperCase(),
        isVerifiedPurchase: r.isVerifiedPurchase,
      }))
    : [...TESTIMONIALS_FALLBACK, ...TESTIMONIALS_FALLBACK];
  const testimonialStrip = [...testimonialItems, ...testimonialItems];

  const marqueeItems = siteBanners.length > 0 ? [...siteBanners, ...siteBanners] : [];
  const marqueeDuration = Math.max(20, siteBanners.length * 7) + 's';

  const BRAND_PHRASES = [
    'Pure. Potent. Proven.',
    'Science-Backed Nutrition.',
    'Premium Wellness for Modern India.',
    'Performance • Vitality • Longevity',
    'Rooted in Nature. Refined by Science.',
    'Your Daily Dose of Excellence.',
  ];
  const brandPhrasesDup = [...BRAND_PHRASES, ...BRAND_PHRASES];

  return (
    <div className="animate-fade-in">
      <style>{STYLES}</style>

      {/* ══ HERO / BANNERS ════════════════════════════════════════════ */}
      {siteBanners.length > 0 && (
        <section className="py-0 bg-gray-50 dark:bg-gray-950 overflow-hidden">
          <div className="overflow-hidden">
            <div className="marquee-track flex gap-1 w-max" style={{ '--md': marqueeDuration }}>
              {marqueeItems.map((banner, i) => (
                <div key={i} className="flex-shrink-0 w-[320px] sm:w-[420px] md:w-[520px] lg:w-[600px] aspect-[1.75] overflow-hidden relative group cursor-pointer">
                  <img src={banner.imageUrl} alt={banner.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading={i < 3 ? 'eager' : 'lazy'} />
                  {banner.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                      <p className="text-white font-bold text-lg drop-shadow leading-tight">{banner.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ TRUST STRIP ════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="page-container py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
            {[
              { icon: Truck, label: 'Free Shipping', sub: `On orders ${settings?.currencySymbol || '₹'}${settings?.freeShippingThreshold ?? 999}+`, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
              { icon: Shield, label: 'Secure Payment', sub: '100% protected', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
              { icon: Headphones, label: '24/7 Support', sub: 'Always here for you', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40' },
              { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
            ].map(({ icon: I, label, sub, color, bg }) => (
              <div key={label} className={`flex items-center gap-3 px-5 py-4 ${bg}`}>
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <I size={18} className={color} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-white dark:bg-gray-900">
        <div className="page-container">
          <SectionHeader
            eyebrow="Handpicked for You"
            title="Featured Products"
            linkTo="/search?featured=true"
            linkLabel="View All Products"
            icon={Sparkles}
            gradient="from-primary-500 to-blue-600"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : featured.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/search" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ SLIDING BRAND STATEMENT ════════════════════════════════════ */}
      <section className="py-0 overflow-hidden bg-gradient-to-r from-primary-900 via-blue-900 to-primary-900 dark:from-gray-950 dark:via-blue-950 dark:to-gray-950">
        <div className="py-5 border-y border-white/10">
          <div className="overflow-hidden">
            <div className="marquee-text-track flex gap-0 w-max select-none">
              {brandPhrasesDup.map((phrase, i) => (
                <span key={i} className="flex items-center gap-0 flex-shrink-0">
                  <span className="text-white/90 font-bold text-base md:text-lg tracking-wide px-8 whitespace-nowrap">{phrase}</span>
                  <span className="text-primary-300/60 text-lg select-none">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SCIENCE / FEATURES SECTION ═════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Science Meets <span className="shimmer-text">Wellness</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
              Every formula is backed by research, tested in labs, and crafted for real, measurable results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Microscope,
                title: 'Advanced Standardization',
                desc: 'Guaranteed active compound percentages in every batch — no guesswork, only precision.',
                gradient: 'from-blue-500 to-primary-600',
                bg: 'bg-blue-50 dark:bg-blue-950/30',
              },
              {
                icon: FlaskConical,
                title: 'Lab-Tested Purity',
                desc: 'Independently tested for heavy metals, microbials, and adulterants before every release.',
                gradient: 'from-emerald-500 to-teal-600',
                bg: 'bg-emerald-50 dark:bg-emerald-950/30',
              },
              {
                icon: Dna,
                title: 'Performance Optimization',
                desc: 'Formulas designed to enhance cellular energy, mitochondrial function, and long-term vitality.',
                gradient: 'from-violet-500 to-purple-600',
                bg: 'bg-violet-50 dark:bg-violet-950/30',
              },
              {
                icon: Award,
                title: 'Nationwide Trust',
                desc: 'Setting the gold standard in nutraceuticals across India with certified, transparent practices.',
                gradient: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-50 dark:bg-amber-950/30',
              },
            ].map(({ icon: Icon, title, desc, gradient, bg }) => (
              <div key={title} className={`group rounded-2xl ${bg} border border-white dark:border-gray-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ═════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-14 md:py-20 bg-white dark:bg-gray-900">
          <div className="page-container">
            <SectionHeader
              eyebrow="Explore"
              title="Shop by Category"
              linkTo="/search"
              linkLabel="All categories"
              icon={Tag}
              gradient="from-violet-500 to-indigo-600"
            />
            <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.slice(0, 8).map((cat) => <CategoryCard key={cat._id} cat={cat} />)}
            </div>
            <div className="md:hidden">
              <ScrollRow>
                {categories.slice(0, 12).map((cat) => (
                  <div key={cat._id} className="flex-shrink-0 w-24"><CategoryCard cat={cat} /></div>
                ))}
              </ScrollRow>
            </div>
          </div>
        </section>
      )}

      {/* ══ INGREDIENT HIGHLIGHT SECTION ═══════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-950 via-blue-950 to-gray-950 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative">
          <div className="text-center mb-12 px-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-300 mb-3">Key Ingredients</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight" style={{ lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              <span className="block">Nature&apos;s Finest,</span>
              <span className="text-primary-300 block mt-1 sm:mt-1.5">Scientifically Enhanced</span>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base leading-relaxed" style={{ lineHeight: 1.65 }}>
              We source the world&apos;s most potent wellness ingredients and refine them through science.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: '🏔️',
                name: 'Himalayan Shilajit',
                tag: 'Adaptogen',
                points: ['High fulvic acid content', 'Rich in 80+ trace minerals', 'Energy & stamina support'],
                color: 'border-amber-500/30 bg-amber-500/5',
                tagColor: 'bg-amber-500/20 text-amber-300',
              },
              {
                emoji: '🌿',
                name: 'Superfood Blend',
                tag: 'Antioxidants',
                points: ['Dense plant nutrients', 'Powerful antioxidants', 'Immune system support'],
                color: 'border-emerald-500/30 bg-emerald-500/5',
                tagColor: 'bg-emerald-500/20 text-emerald-300',
              },
              {
                emoji: '🐟',
                name: 'Marine Collagen',
                tag: 'Skin & Joints',
                points: ['High bioavailability', 'Cellular skin support', 'Joint & gut health'],
                color: 'border-blue-400/30 bg-blue-400/5',
                tagColor: 'bg-blue-400/20 text-blue-300',
              },
              {
                emoji: '✨',
                name: 'Glutathione',
                tag: 'Detox & Glow',
                points: ['Master antioxidant', 'Skin radiance & tone', 'Cellular detoxification'],
                color: 'border-violet-400/30 bg-violet-400/5',
                tagColor: 'bg-violet-400/20 text-violet-300',
              },
            ].map(({ emoji, name, tag, points, color, tagColor }) => (
              <div key={name} className={`rounded-2xl border ${color} p-6 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 group`}>
                <div className="text-4xl mb-4 float-anim">{emoji}</div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${tagColor} mb-3 inline-block`}>{tag}</span>
                <h3 className="font-bold text-white text-base mb-3">{name}</h3>
                <ul className="space-y-1.5">
                  {points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-white/60 text-xs">
                      <CheckCircle size={12} className="text-primary-400 flex-shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/science" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-2xl border border-white/20 transition-all duration-300">
              Explore the Science <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ BRANDS ══════════════════════════════════════════════════════ */}
      {brands.length > 0 && (
        <section className="py-14 md:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="page-container">
            <SectionHeader
              eyebrow="Shop by"
              title="Brands"
              linkTo="/search"
              linkLabel="All brands"
              icon={Sparkles}
              gradient="from-amber-500 to-orange-600"
            />
            <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-3">
              {brands.slice(0, 8).map((b) => <BrandCard key={b._id} brand={b} />)}
            </div>
            <div className="md:hidden">
              <ScrollRow>
                {brands.slice(0, 12).map((b) => (
                  <div key={b._id} className="flex-shrink-0 w-24"><BrandCard brand={b} /></div>
                ))}
              </ScrollRow>
            </div>
          </div>
        </section>
      )}

      {/* ══ FLASH DEALS ════════════════════════════════════════════════ */}
      {(flashDeals.length > 0 || loadingFlash) && (
        <section className="py-14 md:py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-red-50/30 to-transparent dark:from-orange-950/15 dark:via-transparent pointer-events-none" />
          <div className="page-container relative">
            <SectionHeader
              eyebrow="Limited Time"
              title="Flash Deals"
              linkTo="/search?flashDeal=true"
              linkLabel="All deals"
              icon={Zap}
              gradient="from-orange-500 to-red-500"
              extra={
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-gray-900 dark:bg-gray-800 rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-lg">
                  <Clock size={13} className="text-orange-400 flex-shrink-0 hidden sm:block" />
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <TimerBox val={timer.h} label="Hr" />
                    <span className="text-white font-black text-sm pb-4 opacity-60">:</span>
                    <TimerBox val={timer.m} label="Min" />
                    <span className="text-white font-black text-sm pb-4 opacity-60">:</span>
                    <TimerBox val={timer.s} label="Sec" />
                  </div>
                </div>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loadingFlash
                ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                : flashDeals.slice(0, 4).map((p) => (
                    <div key={p._id} className="relative">
                      <div className="absolute -top-2 -right-2 z-10 w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 text-white">
                        <Zap size={15} fill="currentColor" />
                      </div>
                      <ProductCard product={p} />
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ QUALITY COMMITMENT ═════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">Our Standards</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Our Commitment to Quality
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
              We hold ourselves to the highest standards in sourcing, manufacturing, and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Leaf,
                title: 'Premium Sourcing',
                desc: 'Ingredients sourced from certified, sustainable suppliers worldwide.',
                gradient: 'from-emerald-400 to-green-500',
                bg: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
              },
              {
                icon: ShieldCheck,
                title: 'No Harmful Additives',
                desc: 'Zero artificial fillers, preservatives, or questionable compounds.',
                gradient: 'from-blue-400 to-primary-500',
                bg: 'bg-gradient-to-br from-blue-50 to-primary-50 dark:from-blue-950/30 dark:to-primary-950/30',
              },
              {
                icon: CheckCircle,
                title: 'Transparent Labeling',
                desc: 'Every ingredient and dosage is clearly listed — no proprietary blends hiding anything.',
                gradient: 'from-violet-400 to-purple-500',
                bg: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
              },
              {
                icon: TrendingUp,
                title: 'Consistent Performance',
                desc: 'Batch-to-batch consistency guaranteed through rigorous QC at every stage.',
                gradient: 'from-amber-400 to-orange-500',
                bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
              },
            ].map(({ icon: Icon, title, desc, gradient, bg }) => (
              <div key={title} className={`rounded-2xl ${bg} border border-white dark:border-gray-800 p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONSULTATION ═══════════════════════════════════════════════ */}
      <ConsultationSection />

      {/* ══ NEW ARRIVALS ═══════════════════════════════════════════════ */}
      {newArrivals.length > 0 && (
        <section className="py-14 md:py-20 bg-white dark:bg-gray-900">
          <div className="page-container">
            <SectionHeader
              eyebrow="Just In"
              title="New Arrivals"
              linkTo="/search?sort=newest"
              icon={TrendingUp}
              gradient="from-emerald-500 to-teal-600"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newArrivals.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ TESTIMONIALS ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="page-container relative">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">Customer Stories</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              Trusted by Thousands
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}</div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {reviewStats?.total > 0 ? `${Number(reviewStats.average).toFixed(1)}/5 from ${reviewStats.total.toLocaleString()} reviews` : '4.9/5 from 2,400+ reviews'}
              </span>
            </div>
          </div>

          {/* Bulk auto-sliding marquee */}
          <div className="overflow-hidden -mx-4 md:-mx-6">
            <div className="testimonial-marquee-track flex gap-5 px-4 md:px-6" style={{ width: 'max-content' }}>
              {testimonialStrip.map((t, i) => (
                <div
                  key={t._id ? `${t._id}-${i}` : `t-${i}`}
                  className="flex-shrink-0 w-[320px] md:w-[360px] rounded-2xl p-6 md:p-7 bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/80 shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
                  style={{ boxShadow: '0 4px 24px -4px rgba(59, 130, 246, 0.08), 0 0 0 1px rgba(0,0,0,0.02)' }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <StarRating rating={t.rating} />
                    <Quote size={20} className="text-primary-400/60 dark:text-primary-500/50 flex-shrink-0" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed flex-1 line-clamp-4">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-primary-500/30 ring-2 ring-white dark:ring-gray-800">
                      {t.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                        {t.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                            <CheckCircle size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{t.location}</p>
                    </div>
                    {!t.isVerifiedPurchase && <CheckCircle size={18} className="text-primary-400 dark:text-primary-500 ml-auto flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">Scroll or hover to pause</p>
        </div>
      </section>

      {/* ══ CERTIFICATIONS ═════════════════════════════════════════════ */}
      <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="page-container">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-8">Certified & Verified</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award, label: 'GMP Certified', sub: 'Good Manufacturing Practice', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50' },
              { icon: ShieldCheck, label: 'FSSAI Approved', sub: 'Food Safety Standard', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50' },
              { icon: CheckCircle, label: 'ISO Certified', sub: 'Quality Management', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50' },
              { icon: FlaskConical, label: '3rd Party Tested', sub: 'Independent Lab Verified', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50' },
            ].map(({ icon: Icon, label, sub, color, bg }) => (
              <div key={label} className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${bg} text-center`}>
                <Icon size={28} className={color} />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-900 via-blue-900 to-primary-950 p-8 md:p-16 text-center shadow-2xl">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(59,130,246,0.3) 0%,transparent 55%),radial-gradient(circle at 80% 20%,rgba(99,102,241,0.2) 0%,transparent 50%)' }} />
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
            <div className="absolute top-4 right-[12%] w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="absolute bottom-4 left-[8%] w-24 h-24 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/20">
                <Sparkles size={11} /> Wellness Journey Starts Here
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                Take Control of Your{' '}
                <span className="text-primary-300">Wellness Journey</span>
              </h2>
              <p className="text-white/60 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed">
                Premium, science-backed supplements. Free shipping on orders {settings?.currencySymbol || '₹'}{settings?.freeShippingThreshold ?? 999}+. Transparent. Tested. Trusted.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/search" className="inline-flex items-center gap-2 bg-white text-primary-700 font-black px-8 py-3.5 rounded-2xl hover:shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 text-sm">
                  Shop Now <ArrowRight size={16} />
                </Link>
                <Link to="/science" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-white/25 border border-white/25 transition-all duration-300 text-sm">
                  <FlaskConical size={15} /> Explore Science
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ── Consultation Section ──────────────────────────────────────────────────────
const ConsultationSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-teal-950 via-primary-900 to-blue-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
      </div>
      <div className="page-container relative">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-teal-300 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-white/15">
            <Stethoscope size={11} /> Expert Wellness Consultations
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Talk to a Wellness Doctor,<br /><span className="text-teal-300">From Anywhere</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-base leading-relaxed">
            Get personalised nutrition advice, prescriptions, and product recommendations via Online from certified wellness experts.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { step: '1', icon: Stethoscope, label: 'Pick a Doctor' },
            { step: '2', icon: Clock, label: 'Book a Slot' },
            { step: '3', icon: Video, label: 'Join Online' },
            { step: '4', icon: CheckCircle, label: 'Get Prescription' },
          ].map(({ step, icon: Icon, label }) => (
            <div key={step} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center mx-auto mb-3 relative">
                <Icon size={18} className="text-teal-300" />
                <span className="absolute -top-2 -right-2 text-[9px] font-black bg-teal-500 text-white w-4 h-4 rounded-full flex items-center justify-center">{step}</span>
              </div>
              <p className="text-xs font-bold text-white/80">{label}</p>
            </div>
          ))}
        </div>


        <div className="text-center">
          <Link to="/consultation"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5">
            Browse All Doctors <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
