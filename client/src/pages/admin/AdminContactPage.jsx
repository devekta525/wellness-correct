import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, Mail, Clock, Share2, HelpCircle } from 'lucide-react';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FAQ = { q: '', a: '' };

const AdminContactPage = () => {
  const [info, setInfo] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    mapUrl: '',
    businessHours: '',
    social: { instagram: '', facebook: '', twitter: '', youtube: '' },
    responseTimes: { email: '', phone: '', whatsapp: '' },
    faqs: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    contactAPI.adminGetInfo()
      .then(r => {
        const d = r.data.contactInfo || {};
        setInfo(prev => ({
          ...prev, ...d,
          social: { ...prev.social, ...(d.social || {}) },
          responseTimes: { ...prev.responseTimes, ...(d.responseTimes || {}) },
          faqs: d.faqs || [],
        }));
      })
      .catch(() => toast.error('Failed to load contact info'))
      .finally(() => setLoading(false));
  }, []);

  const set = (field, value) => setInfo(p => ({ ...p, [field]: value }));
  const setSocial = (k, v) => setInfo(p => ({ ...p, social: { ...p.social, [k]: v } }));
  const setRT = (k, v) => setInfo(p => ({ ...p, responseTimes: { ...p.responseTimes, [k]: v } }));
  const setFaq = (i, k, v) => setInfo(p => {
    const faqs = [...p.faqs];
    faqs[i] = { ...faqs[i], [k]: v };
    return { ...p, faqs };
  });
  const addFaq = () => setInfo(p => ({ ...p, faqs: [...p.faqs, { ...EMPTY_FAQ }] }));
  const removeFaq = (i) => setInfo(p => ({ ...p, faqs: p.faqs.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await contactAPI.adminUpdateInfo(info);
      toast.success('Contact info saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-primary-500" size={32} />
    </div>
  );

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all';
  const labelCls = 'block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Contact Page Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all contact details shown on the public contact page</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">

        {/* Basic Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Mail size={16} className="text-blue-600" /></div>
            <h2 className="font-bold text-gray-900">Contact Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Email Address</label>
              <input className={inputCls} value={info.email} onChange={e => set('email', e.target.value)} placeholder="hello@wellnessfuel.in" />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input className={inputCls} value={info.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={labelCls}>WhatsApp Number</label>
              <input className={inputCls} value={info.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={labelCls}>Business Hours</label>
              <input className={inputCls} value={info.businessHours} onChange={e => set('businessHours', e.target.value)} placeholder="Mon–Sat, 10am–6pm IST" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Address</label>
              <input className={inputCls} value={info.address} onChange={e => set('address', e.target.value)} placeholder="Mumbai, Maharashtra, India — 400001" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Google Maps Embed URL</label>
              <input className={inputCls} value={info.mapUrl} onChange={e => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/maps?…&output=embed" />
              <p className="text-[11px] text-gray-400 mt-1">Paste the embed URL from Google Maps → Share → Embed a map. Leave blank to hide the map.</p>
            </div>
          </div>
        </section>

        {/* Response Times */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Clock size={16} className="text-emerald-600" /></div>
            <h2 className="font-bold text-gray-900">Response Times</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { k: 'email', label: 'Email' },
              { k: 'phone', label: 'Phone' },
              { k: 'whatsapp', label: 'WhatsApp' },
            ].map(({ k, label }) => (
              <div key={k}>
                <label className={labelCls}>{label}</label>
                <input className={inputCls} value={info.responseTimes[k] || ''} onChange={e => setRT(k, e.target.value)} placeholder="Within 24 hours" />
              </div>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center"><Share2 size={16} className="text-pink-600" /></div>
            <h2 className="font-bold text-gray-900">Social Media Links</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { k: 'instagram', label: 'Instagram URL' },
              { k: 'facebook', label: 'Facebook URL' },
              { k: 'twitter', label: 'Twitter / X URL' },
              { k: 'youtube', label: 'YouTube URL' },
            ].map(({ k, label }) => (
              <div key={k}>
                <label className={labelCls}>{label}</label>
                <input className={inputCls} value={info.social[k] || ''} onChange={e => setSocial(k, e.target.value)} placeholder={`https://${k}.com/wellnessfuel`} />
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><HelpCircle size={16} className="text-violet-600" /></div>
              <h2 className="font-bold text-gray-900">FAQs</h2>
            </div>
            <button onClick={addFaq}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={13} />Add FAQ
            </button>
          </div>
          {info.faqs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No FAQs yet. Click "Add FAQ" to add one.</p>
          )}
          <div className="space-y-4">
            {info.faqs.map((faq, i) => (
              <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1 space-y-3">
                  <input className={inputCls} placeholder="Question" value={faq.q} onChange={e => setFaq(i, 'q', e.target.value)} />
                  <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Answer" value={faq.a} onChange={e => setFaq(i, 'a', e.target.value)} />
                </div>
                <button onClick={() => removeFaq(i)} className="text-gray-300 hover:text-red-500 transition-colors self-start mt-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminContactPage;
