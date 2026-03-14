import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  ArrowRight, CheckCircle, Heart, Leaf, Microscope,
  ShieldCheck, Star, TrendingUp, Award, Users,
} from 'lucide-react';

const AboutPage = () => {
  const ratingBadgeRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ratingBadgeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    // #region agent log
    fetch('http://127.0.0.1:7436/ingest/62e2a1c9-8294-48a2-981c-e3fb6efe754a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '10b514',
      },
      body: JSON.stringify({
        sessionId: '10b514',
        runId: 'about-rating-overlap-pre-fix-1',
        hypothesisId: 'AB-H1',
        location: 'AboutPage.jsx:rating-badge-position',
        message: 'About page rating badge position',
        data: {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
  }, []);

  return (
    <div className="animate-fade-in">

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-primary-950 via-blue-900 to-primary-900">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="page-container relative text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-primary-300 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/15">
            <Heart size={11} /> Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            We Don't Just Sell<br />
            <span className="text-primary-300">Supplements.</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            We deliver performance, vitality, and long-term wellness — backed by science, sourced with integrity, built for India.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/search" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-7 py-3 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm">
              Shop Now <ArrowRight size={15} />
            </Link>
            <Link to="/science" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3 rounded-2xl hover:bg-white/20 transition-all duration-300 text-sm">
              Our Science
            </Link>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ═══════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '50,000+', label: 'Happy Customers' },
              { value: '25+', label: 'Premium Products' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '100%', label: 'Lab Tested' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl md:text-4xl font-black text-primary-600 dark:text-primary-400 mb-1">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BRAND STORY ═════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">Our Story</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                Born from a Passion for<br />Real Wellness
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                Wellness Fuel was founded with a simple but powerful belief: Indians deserve premium, science-backed nutrition without the compromise. We saw a market flooded with underdosed, overclaimed supplements and decided to do things differently.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                Every product we create starts with a research question: what does your body actually need? We work with nutritionists, biochemists, and athletes to design formulas that deliver measurable results — not just marketing promises.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                From the Himalayan peaks where we source our Shilajit to the certified labs where every batch is tested, quality is non-negotiable at Wellness Fuel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {[
                  { icon: Leaf, text: 'Natural Ingredients' },
                  { icon: ShieldCheck, text: 'Third-Party Tested' },
                  { icon: Award, text: 'GMP Certified' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-primary-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-600 to-blue-700 rounded-3xl p-8 md:p-10 shadow-2xl shadow-primary-500/20">
                <div className="absolute inset-0 opacity-10 rounded-3xl"
                  style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
                <blockquote className="relative z-10">
                  <p className="text-white text-xl md:text-2xl font-bold leading-relaxed mb-6">
                    "We don't just sell supplements. We deliver performance, vitality, and long-term wellness."
                  </p>
                  <footer className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg">W</div>
                    <div>
                      <p className="text-white font-bold">Wellness Fuel</p>
                      <p className="text-white/60 text-sm">Founders, 2022</p>
                    </div>
                  </footer>
                </blockquote>
              </div>
              {/* Floating badge */}
              <div
                ref={ratingBadgeRef}
                className="absolute -bottom-4 right-4 md:right-8 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                    <Star size={20} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-sm">4.9 / 5</p>
                    <p className="text-xs text-gray-400">2,400+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSION & VISION ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">What Drives Us</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Mission & Vision</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 rounded-3xl p-8 border border-primary-100 dark:border-primary-900/50">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg mb-5">
                <Heart size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                To make premium, science-backed nutrition accessible to every Indian who strives for better health, performance, and vitality — without compromise.
              </p>
              <ul className="space-y-2">
                {['Bridge the gap between science and wellness', 'Make premium quality affordable', 'Build lifelong health partnerships'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle size={15} className="text-primary-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl p-8 border border-amber-100 dark:border-amber-900/50">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg mb-5">
                <TrendingUp size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                To become India's most trusted nutraceutical brand — synonymous with purity, potency, and proven results for every lifestyle.
              </p>
              <ul className="space-y-2">
                {['Set the gold standard in Indian nutraceuticals', 'Drive preventive wellness culture', 'Empower 1 million wellness journeys'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BUILT FOR INDIA ═════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">Proudly Indian</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Built for India 🇮🇳</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
              We understand the Indian body, Indian lifestyle, and Indian wellness needs. Our formulas are tailored for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Users, title: 'Made for Indian Lifestyles', desc: 'Formulas adapted to Indian dietary patterns, climate, and genetic factors for maximum efficacy.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
              { icon: Leaf, title: 'Ayurvedic Heritage + Science', desc: 'We blend centuries of Ayurvedic wisdom with modern nutritional science for holistic wellness.', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
              { icon: Microscope, title: 'Sourced Across India & World', desc: 'From Himalayan Shilajit to marine-sourced collagen — we go where quality is best.', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`${bg} rounded-2xl p-6 border border-white dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <Icon size={28} className={`${color} mb-4`} />
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="page-container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-base leading-relaxed">
              Join 50,000+ Indians who have chosen science over hype. Premium quality that you can trust.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/search" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300">
                Shop Products <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-7 py-3 rounded-2xl hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
