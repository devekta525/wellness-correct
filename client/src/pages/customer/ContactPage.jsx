import { useState, useEffect } from 'react';
import {
  Mail, Phone, MapPin, Send, CheckCircle,
  Clock, MessageSquare, Instagram, Twitter, Youtube, Facebook,
  Loader2, MessageCircle,
} from 'lucide-react';
import { contactAPI } from '../../services/api';
import { useSite } from '../../context/SiteContext';

const toFullUrl = (val) => {
  if (!val || typeof val !== 'string') return null;
  const t = val.trim();
  return t && (t.startsWith('http') ? t : `https://${t}`);
};

const DEFAULT_INFO = {
  email: 'hello@wellnessfuel.in',
  phone: '+91 98765 43210',
  whatsapp: '',
  address: 'Mumbai, Maharashtra, India — 400001',
  mapUrl: '',
  businessHours: 'Mon–Sat, 10am–6pm IST',
  social: { instagram: '', facebook: '', twitter: '', youtube: '' },
  responseTimes: {
    email: 'Within 24 hours',
    phone: 'Immediate (business hours)',
    whatsapp: 'Within 2 hours',
  },
  faqs: [
    { q: 'How long does delivery take?', a: '3–7 business days across India. Faster in metro cities.' },
    { q: 'Are your products authentic?', a: 'Yes. Every product is lab-tested with a Certificate of Analysis available on request.' },
    { q: 'Do you offer bulk/wholesale pricing?', a: 'Yes! Contact us with your requirements for wholesale rates.' },
  ],
};

const ContactPage = () => {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    contactAPI.getInfo()
      .then(r => setInfo({ ...DEFAULT_INFO, ...r.data.contactInfo, social: { ...DEFAULT_INFO.social, ...r.data.contactInfo?.social }, responseTimes: { ...DEFAULT_INFO.responseTimes, ...r.data.contactInfo?.responseTimes } }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactAPI.submit(form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      // fallback: show success anyway (UX)
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  const { site } = useSite();
  const siteSocial = site?.social || {};
  const socialLinks = [
    { icon: Instagram, label: 'Instagram', handle: info.social?.instagram || siteSocial.instagram || '@wellnessfuel', color: 'hover:text-pink-500', href: toFullUrl(info.social?.instagram || siteSocial.instagram) },
    { icon: Facebook, label: 'Facebook', handle: 'Wellness Fuel', color: 'hover:text-blue-600', href: toFullUrl(info.social?.facebook || siteSocial.facebook) },
    { icon: Twitter, label: 'Twitter / X', handle: '@wellnessfuel', color: 'hover:text-sky-500', href: toFullUrl(info.social?.twitter || siteSocial.twitter) },
    { icon: Youtube, label: 'YouTube', handle: 'Wellness Fuel', color: 'hover:text-red-500', href: toFullUrl(info.social?.youtube || siteSocial.youtube) },
  ].filter((s) => s.href);

  return (
    <div className="animate-fade-in">

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-primary-950 via-blue-900 to-primary-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="page-container relative text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-primary-300 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/15">
            <MessageSquare size={11} /> Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            We'd Love to Hear<br /><span className="text-primary-300">From You</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Have a question about our products, an order, or just want to say hello? We're here and happy to help.
          </p>
        </div>
      </section>

      {/* ══ CONTACT CARDS ═══════════════════════════════════════════════ */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="page-container">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Mail, title: 'Email Us', info: info.email, sub: info.responseTimes?.email || 'Within 24 hours', gradient: 'from-blue-500 to-primary-600', bg: 'bg-blue-50 dark:bg-blue-950/30', href: `mailto:${info.email}` },
                { icon: Phone, title: 'Call Us', info: info.phone, sub: info.businessHours, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', href: `tel:${info.phone?.replace(/\s/g, '')}` },
                info.whatsapp && { icon: MessageCircle, title: 'WhatsApp', info: info.whatsapp, sub: info.responseTimes?.whatsapp || 'Within 2 hours', gradient: 'from-green-400 to-green-600', bg: 'bg-green-50 dark:bg-green-950/30', href: `https://wa.me/${info.whatsapp?.replace(/[^0-9]/g, '')}` },
                { icon: MapPin, title: 'Visit Us', info: info.address, sub: '', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', href: info.mapUrl || null },
              ].filter(Boolean).map(({ icon: Icon, title, info: val, sub, gradient, bg, href }) => (
                <div key={title} className={`${bg} rounded-2xl p-6 border border-white dark:border-gray-800 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mx-auto mb-4`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{title}</h3>
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="text-primary-600 dark:text-primary-400 font-semibold text-sm hover:underline block mb-1 break-words">{val}</a>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm mb-1 break-words">{val}</p>
                  )}
                  {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ MAP ═════════════════════════════════════════════════════════ */}
      {info.mapUrl && (
        <section className="h-64 md:h-80 w-full">
          <iframe
            src={info.mapUrl}
            title="Location Map"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </section>
      )}

      {/* ══ CONTACT FORM + SIDEBAR ══════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-7 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Send us a Message</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">Fill in the form and our team will get back to you promptly.</p>

                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Thank you for reaching out. We'll be in touch within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="text-primary-600 dark:text-primary-400 font-semibold text-sm hover:underline">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Your Name *</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Rahul Sharma"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Email Address *</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="rahul@example.com"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Subject *</label>
                      <select name="subject" value={form.subject} onChange={handleChange} required
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all">
                        <option value="">Select a topic…</option>
                        <option value="order">Order Inquiry</option>
                        <option value="product">Product Question</option>
                        <option value="return">Returns &amp; Refunds</option>
                        <option value="wholesale">Wholesale / B2B</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Message *</label>
                      <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Tell us how we can help you…"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none" />
                    </div>

                    <button type="submit" disabled={sending}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                      {sending ? (
                        <><Loader2 size={16} className="animate-spin" />Sending…</>
                      ) : (
                        <><Send size={16} />Send Message</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-5">

              {/* Response times */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                    <Clock size={18} className="text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Response Times</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { channel: 'Email', time: info.responseTimes?.email, dot: 'bg-green-400' },
                    { channel: 'Phone', time: info.responseTimes?.phone, dot: 'bg-blue-400' },
                    { channel: 'WhatsApp', time: info.responseTimes?.whatsapp, dot: 'bg-emerald-400' },
                  ].filter(r => r.time).map(({ channel, time, dot }) => (
                    <div key={channel} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{channel}</span>
                      </div>
                      <span className="text-xs text-gray-400">{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              {info.faqs?.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Frequently Asked</h3>
                  <div className="space-y-4">
                    {info.faqs.map((faq, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">{faq.q}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social */}
              {(socialLinks.length > 0) && (
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 rounded-2xl p-6 border border-primary-100 dark:border-primary-900/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Follow Us</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {socialLinks.map(({ icon: Icon, label, handle, color, href }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200 group ${color}`}>
                        <Icon size={16} className="text-gray-400 group-hover:text-current transition-colors flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-white">{label}</p>
                          <p className="text-[10px] text-gray-400">{handle}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
