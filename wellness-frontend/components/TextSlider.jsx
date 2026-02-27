/* Server Component — no 'use client' needed */

const items = [
  { icon: '🌿', text: '100% Natural Ingredients' },
  { icon: '🔬', text: 'Clinically Tested Formulas' },
  { icon: '🏅', text: 'GMP Certified Facility' },
  { icon: '🏆', text: 'Award-Winning Supplements' },
  { icon: '❤️', text: 'Trusted by 50,000+ Customers' },
  { icon: '⭐', text: '4.9 Star Average Rating' },
  { icon: '🏔️', text: 'Himalayan Sourced Ingredients' },
  { icon: '🧬', text: 'Science-Backed Nutrition' },
  { icon: '⚡', text: 'Fast Absorption Technology' },
  { icon: '🌱', text: 'Vegan-Friendly Options' },
  { icon: '🔒', text: 'FSSAI Approved Products' },
  { icon: '🚚', text: 'Free Shipping Above ₹999' },
];

function SliderRow({ items, reverse = false }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div
        className={`flex items-center gap-0 whitespace-nowrap ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'
          }`}
      >
        {doubled.map((item, idx) => (
          <div key={idx} className="inline-flex items-center gap-2.5 flex-shrink-0 px-5">
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-sm font-semibold text-white/90 whitespace-nowrap tracking-wide">
              {item.text}
            </span>
            <span className="text-white/25 text-sm mx-1">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TextSlider() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700" />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.08]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="slider-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#slider-dots)" />
        </svg>
      </div>

      {/* Glow blobs */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative py-1 marquee-container">
        <SliderRow items={items} />
        <SliderRow items={[...items].reverse()} reverse />
      </div>
    </section>
  );
}
