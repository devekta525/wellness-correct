/* Server Component */

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ArrowRight, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import img from "@/public/logo.jpeg"

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Shop All', href: '/shop' },
  { label: 'Our Science', href: '/science' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const productLinks = [
  { label: 'Super Food Blend', href: '/products/super-food-blend' },
  { label: 'Marine Collagen', href: '/products/marine-collagen' },
  { label: 'Glutathione Tablet', href: '/products/glutathione-tablet' },
  { label: 'Shilajit Coffee', href: '/products/shilajit-coffee' },
  { label: 'Shilajit Resin', href: '/products/shilajit-resin' },
];

const supportLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Return & Refund', href: '/return-refund' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-conditions' },
];

const socialLinks = [
  { Icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400' },
  { Icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
  { Icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
  { Icon: Youtube, href: '#', label: 'YouTube', color: 'hover:bg-red-600' },
];

const certBadges = [
  { emoji: '🏅', label: 'GMP', sub: 'Certified' },
  { emoji: '🔬', label: 'FSSAI', sub: 'Approved' },
  { emoji: '🌿', label: 'ISO', sub: '9001:2015' },
  { emoji: '✅', label: '3rd Party', sub: 'Lab Tested' },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300">

      {/* ── Cert strip ── */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {certBadges.map((b) => (
              <div key={b.label} className="flex items-center gap-2.5">
                <span className="text-2xl">{b.emoji}</span>
                <div className="leading-none">
                  <div className="text-[12px] font-bold text-white">{b.label}</div>
                  <div className="text-[10px] text-slate-500">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* ── Brand column (spans 2) ── */}
          <div className="lg:col-span-2">
            {/* Brand Identity: Logo + Text side-by-side */}
            <div className="flex justify-center md:justify-start mb-8">
              <Link href="/" className="flex items-center gap-4 group transition-all duration-300">
                {/* Rounded Logo Container */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white rounded-full p-2.5 shadow-[0_0_20px_rgba(37,99,235,0.2)] border-2 border-slate-800 group-hover:border-blue-500 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all duration-500 flex items-center justify-center overflow-hidden">
                  <Image
                    src={img}
                    alt="Wellness Fuel Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Brand Text */}
                <div className="flex flex-col group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-2xl md:text-3xl font-bold text-white font-serif tracking-tight">
                    Wellness <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Fuel</span>
                  </span>
                  <span className="text-[10px] md:text-xs text-blue-400/80 font-bold tracking-[0.2em] uppercase mt-0.5">
                    Premium Nutrition
                  </span>
                </div>
              </Link>
            </div>

            <p className="text-[13px] text-slate-400 leading-relaxed mb-6 max-w-xs">
              We believe true wellness starts from within. Our mission is to bring you the finest
              natural ingredients — scientifically formulated to help you thrive every day.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-7 w-full pr-4">
              {[
                { Icon: MapPin, text: '304, 3rd Floor, Procapitus Business Park, D-247, 4A, D Block, Sector 63, Noida, Uttar Pradesh – 201309, India' },
                { Icon: Phone, text: '+91 9667766523', href: 'tel:+919667766523' },
                { Icon: Mail, text: 'dr.ritesh@wellnessfuel.in', href: 'mailto:dr.ritesh@wellnessfuel.in' },
              ].map(({ Icon, text, href }) => (
                <div key={text} className="flex items-start gap-3 text-[13px]">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  {href ? (
                    <a href={href} className="text-slate-400 hover:text-blue-400 transition-colors pt-1.5">{text}</a>
                  ) : (
                    <span className="text-slate-400 leading-relaxed pt-1.5">{text}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ Icon, href, label, color }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-semibold text-sm mb-5">
              <span className="w-1.5 h-4 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue-400" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Products ── */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-semibold text-sm mb-5">
              <span className="w-1.5 h-4 bg-gradient-to-b from-cyan-400 to-sky-400 rounded-full" />
              Products
            </h4>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue-400" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-semibold text-sm mb-5">
              <span className="w-1.5 h-4 bg-gradient-to-b from-sky-400 to-indigo-400 rounded-full" />
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue-400" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Newsletter ── */}
        <div className="mt-12 pt-10 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-base mb-1">
                🌿 Join the Wellness Community
              </h4>
              <p className="text-[13px] text-slate-400">
                Subscribe for wellness tips, new launches & exclusive member discounts.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
          <p>© {new Date().getFullYear()} Wellness Fuel. All rights reserved. Made with ❤️ in India.</p>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">Secure Payments:</span>
            {['VISA', 'MC', 'UPI', 'RazorPay', 'COD'].map((m) => (
              <span
                key={m}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-400"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
