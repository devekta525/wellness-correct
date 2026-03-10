import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, FlaskConical, Microscope,
  Dna, ShieldCheck, Award, Zap, Leaf, TrendingUp,
} from 'lucide-react';

const SciencePage = () => {
  return (
    <div className="animate-fade-in">

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-primary-950 via-blue-950 to-gray-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-500/8 rounded-full blur-3xl translate-x-1/4" />
        </div>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="page-container relative text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-primary-300 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/15">
            <FlaskConical size={11} /> Research & Science
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Science Behind<br />
            <span className="text-primary-300">Every Formula</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Our formulas aren't built on marketing claims. They're built on peer-reviewed research, standardized extracts, and rigorous lab testing.
          </p>
          <Link to="/search" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-7 py-3 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm">
            Shop Science-Backed Products <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ══ SCIENCE PILLARS ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">Our Approach</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              The Wellness Fuel Method
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Microscope,
                step: '01',
                title: 'Research-First Formulation',
                desc: 'Every ingredient begins with a thorough review of published clinical studies. We only include compounds with demonstrated efficacy at the doses we use.',
                points: ['Peer-reviewed clinical evidence', 'Effective clinical dosages', 'Synergistic ingredient stacking'],
                gradient: 'from-blue-500 to-primary-600',
                bg: 'bg-blue-50 dark:bg-blue-950/30',
              },
              {
                icon: FlaskConical,
                step: '02',
                title: 'Purity & Quality Verification',
                desc: 'Before any batch reaches you, it passes through multiple quality checkpoints — from raw material testing to finished product verification.',
                points: ['Heavy metal analysis', 'Microbial contamination tests', 'Identity & potency verification'],
                gradient: 'from-emerald-500 to-teal-600',
                bg: 'bg-emerald-50 dark:bg-emerald-950/30',
              },
              {
                icon: Dna,
                step: '03',
                title: 'Performance-Oriented Results',
                desc: 'We measure success by the results our customers achieve — not by the number of ingredients we can pack on a label.',
                points: ['Targeted bioavailability enhancement', 'Absorption optimization', 'Measurable outcome focus'],
                gradient: 'from-violet-500 to-purple-600',
                bg: 'bg-violet-50 dark:bg-violet-950/30',
              },
            ].map(({ icon: Icon, step, title, desc, points, gradient, bg }) => (
              <div key={step} className={`${bg} rounded-2xl p-7 border border-white dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-5xl font-black text-gray-200 dark:text-gray-700 leading-none">{step}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{desc}</p>
                <ul className="space-y-2">
                  {points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle size={14} className="text-primary-500 flex-shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INGREDIENT DEEP-DIVE ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">Ingredient Science</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Understanding Our Key Ingredients
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
              We believe in full transparency. Here's the science behind what makes our products work.
            </p>
          </div>

          <div className="space-y-8">
            {/* Shilajit */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-7 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🏔️</span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">Adaptogen</span>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">Himalayan Shilajit</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                    Formed over millions of years from the decomposition of plant matter, Shilajit is nature's most concentrated source of fulvic acid and trace minerals. Our Shilajit is sourced directly from high-altitude Himalayan deposits and purified to pharmaceutical-grade standards.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Fulvic Acid', value: '60–80%', color: 'text-amber-600' },
                      { label: 'Trace Minerals', value: '80+ types', color: 'text-amber-600' },
                      { label: 'DBPs', value: 'Dibenzo-α-pyrones', color: 'text-amber-600' },
                      { label: 'Altitude', value: '5000+ m', color: 'text-amber-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3">
                        <p className={`font-black text-base ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Clinical Benefits</h4>
                  <ul className="space-y-3">
                    {[
                      'Increases testosterone and free testosterone levels',
                      'Enhances mitochondrial energy production (ATP)',
                      'Improves cognitive function and memory retention',
                      'Supports muscle recovery and endurance',
                      'Anti-inflammatory and antioxidant properties',
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                        <Zap size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Superfood Blend */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-7 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="order-2 lg:order-1 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Key Components</h4>
                  <ul className="space-y-3">
                    {[
                      'Spirulina — complete protein, B12, iron, antioxidants',
                      'Moringa — 7x more vitamin C than oranges, all essential amino acids',
                      'Ashwagandha KSM-66® — 5% withanolides, stress & cortisol reduction',
                      'Amla — 20x more vitamin C than orange juice, collagen synthesis',
                      'Wheatgrass — chlorophyll, enzymes, alkalizing minerals',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                        <Leaf size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🌿</span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">Antioxidants</span>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">Superfood Blend</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                    Our Superfood Blend combines the world's most nutrient-dense plants in scientifically validated ratios. Each ingredient is standardized for its key active compounds, ensuring every serving delivers consistent, powerful nutrition.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'ORAC Score', value: '12,000+', color: 'text-emerald-600' },
                      { label: 'Plant Sources', value: '10+', color: 'text-emerald-600' },
                      { label: 'Protein', value: 'All EAAs', color: 'text-emerald-600' },
                      { label: 'Standardized', value: '100%', color: 'text-emerald-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3">
                        <p className={`font-black text-base ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Collagen & Glutathione */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  emoji: '🐟',
                  tag: 'Skin & Joints',
                  tagColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
                  title: 'Marine Collagen',
                  desc: 'Hydrolyzed marine collagen with the highest bioavailability (Type I) for skin elasticity, joint lubrication, and gut lining integrity.',
                  points: ['Bioavailability up to 1.5x vs. bovine', 'Supports type I & III collagen synthesis', 'Clinically studied at 2.5g–10g daily'],
                  stats: [{ label: 'Bioavailability', value: 'High' }, { label: 'Molecular Wt.', value: '<3 kDa' }],
                  color: 'border-blue-100 dark:border-blue-900/30',
                  statBg: 'bg-blue-50 dark:bg-blue-950/20',
                  statColor: 'text-blue-600',
                  pointIcon: <Dna size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />,
                },
                {
                  emoji: '✨',
                  tag: 'Detox & Glow',
                  tagColor: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30',
                  title: 'Glutathione',
                  desc: 'The body\'s master antioxidant, critical for cellular detoxification, immune modulation, and melanin regulation for skin brightening.',
                  points: ['Liposomal form for superior absorption', 'Regenerates vitamins C & E in cells', 'Inhibits melanin synthesis for skin radiance'],
                  stats: [{ label: 'Form', value: 'Liposomal' }, { label: 'Purity', value: '99%+' }],
                  color: 'border-violet-100 dark:border-violet-900/30',
                  statBg: 'bg-violet-50 dark:bg-violet-950/20',
                  statColor: 'text-violet-600',
                  pointIcon: <Zap size={13} className="text-violet-500 flex-shrink-0 mt-0.5" />,
                },
              ].map(({ emoji, tag, tagColor, title, desc, points, stats, color, statBg, statColor, pointIcon }) => (
                <div key={title} className={`bg-white dark:bg-gray-900 rounded-3xl p-7 shadow-sm border ${color} hover:shadow-lg transition-all duration-300`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{emoji}</span>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${tagColor}`}>{tag}</span>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mt-1">{title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{desc}</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {stats.map(({ label, value }) => (
                      <div key={label} className={`${statBg} rounded-xl p-3`}>
                        <p className={`font-black text-sm ${statColor}`}>{value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-2">
                    {points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {pointIcon}
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTING PROCESS ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3">Quality Assurance</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Our Testing Process
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
              Every product passes through 5 mandatory testing stages before it reaches your hands.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-blue-300 to-primary-200 dark:from-primary-800 dark:via-blue-700 dark:to-primary-800" />

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5 relative">
              {[
                { icon: Leaf, label: 'Raw Material\nInspection', num: '01', color: 'from-green-400 to-emerald-500' },
                { icon: Microscope, label: 'Identity &\nPotency Testing', num: '02', color: 'from-blue-400 to-primary-500' },
                { icon: ShieldCheck, label: 'Heavy Metal\nAnalysis', num: '03', color: 'from-violet-400 to-purple-500' },
                { icon: FlaskConical, label: 'Microbial\nSafety Test', num: '04', color: 'from-amber-400 to-orange-500' },
                { icon: Award, label: 'Certificate of\nAnalysis Issued', num: '05', color: 'from-rose-400 to-pink-500' },
              ].map(({ icon: Icon, label, num, color }) => (
                <div key={num} className="flex flex-col items-center text-center group">
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full text-[10px] font-black text-gray-700 dark:text-gray-300 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800">{num}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-snug whitespace-pre-line">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 rounded-2xl p-6 border border-primary-100 dark:border-primary-900/50 flex flex-col sm:flex-row items-center gap-4">
            <TrendingUp size={24} className="text-primary-600 flex-shrink-0" />
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1">
              <strong className="text-primary-600">Every batch has a Certificate of Analysis (CoA)</strong> available on request. We believe complete transparency is not optional — it's the foundation of trust.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-bold text-sm hover:underline flex-shrink-0">
              Request CoA <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-900 via-blue-900 to-primary-950 p-8 md:p-16 text-center shadow-2xl">
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%,rgba(59,130,246,0.25) 0%,transparent 55%)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Experience the Difference<br />Science Makes
              </h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto text-base leading-relaxed">
                Every capsule, every gram — backed by research, verified by labs, designed for results.
              </p>
              <Link to="/search" className="inline-flex items-center gap-2 bg-white text-primary-700 font-black px-8 py-3.5 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Shop Science-Backed Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SciencePage;
