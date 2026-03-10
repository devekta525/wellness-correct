import { useState, useEffect } from 'react';
import { ImageIcon, Upload, Save, Loader2, Plus, Trash2, Link2, Mail, Phone, MapPin, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const defaultBanner = () => ({ imageUrl: '', link: '', title: '', subtitle: '', cta: 'Shop Now' });
const defaultSocial = () => ({ facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' });
const defaultContact = () => ({ phone: '', email: '', address: '' });

const CustomizationPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState([]);
  const [logo, setLogo] = useState('');
  const [logoDark, setLogoDark] = useState('');
  const [favicon, setFavicon] = useState('');
  const [social, setSocial] = useState(defaultSocial());
  const [contact, setContact] = useState(defaultContact());
  const [uploading, setUploading] = useState(null); // 'banner-0' | 'logo' | 'logoDark' | 'favicon'

  useEffect(() => {
    adminAPI.getCustomization()
      .then(res => {
        const c = res.data.customization || {};
        setBanners(Array.isArray(c.banners) && c.banners.length > 0 ? c.banners.map(b => ({ ...defaultBanner(), ...b })) : [defaultBanner()]);
        setLogo(c.logo || '');
        setLogoDark(c.logoDark || '');
        setFavicon(c.favicon || '');
        setSocial({ ...defaultSocial(), ...(c.social || {}) });
        setContact({ ...defaultContact(), ...(c.contact || {}) });
      })
      .catch(() => toast.error('Failed to load customization'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (type, file, bannerIndex = null) => {
    if (!file) return;
    const key = bannerIndex !== null ? `banner-${bannerIndex}` : type;
    setUploading(key);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await adminAPI.uploadSiteAsset(formData);
      const url = res.data.url;
      if (type === 'banner' && bannerIndex !== null) {
        setBanners(prev => {
          const next = [...prev];
          next[bannerIndex] = { ...next[bannerIndex], imageUrl: url };
          return next;
        });
      } else if (type === 'logo') setLogo(url);
      else if (type === 'logoDark') setLogoDark(url);
      else if (type === 'favicon') setFavicon(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const addBanner = () => setBanners(prev => [...prev, defaultBanner()]);
  const removeBanner = (i) => setBanners(prev => prev.filter((_, idx) => idx !== i));
  const updateBanner = (i, field, value) => {
    setBanners(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateCustomization({ banners, logo, logoDark, favicon, social, contact });
      toast.success('Customization saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader size="lg" /></div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homepage & Site Customization</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Banners, logo, favicon, social links and contact details</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save all
        </button>
      </div>

      {/* Banners */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <ImageIcon size={20} className="text-primary-600" />
          Homepage banners
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Use images with ratio 1.75:1 (e.g. 1400×800) for best display.</p>
        <div className="space-y-6">
          {banners.map((b, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Banner {i + 1}</span>
                {banners.length > 1 && (
                  <button type="button" onClick={() => removeBanner(i)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-40 flex-shrink-0">
                  <div className="aspect-[1.75] rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('banner', e.target.files?.[0], i)} />
                        {uploading === `banner-${i}` ? <Loader2 size={24} className="animate-spin text-gray-400" /> : <Upload size={24} className="text-gray-400" />}
                      </label>
                    )}
                  </div>
                  {b.imageUrl && (
                    <label className="mt-1 block text-center text-xs text-primary-600 cursor-pointer hover:underline">
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('banner', e.target.files?.[0], i)} />
                      Replace
                    </label>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <input type="text" value={b.title} onChange={e => updateBanner(i, 'title', e.target.value)} className="input py-2 text-sm" placeholder="Title (optional)" />
                  <input type="text" value={b.subtitle} onChange={e => updateBanner(i, 'subtitle', e.target.value)} className="input py-2 text-sm" placeholder="Subtitle (optional)" />
                  <input type="text" value={b.cta} onChange={e => updateBanner(i, 'cta', e.target.value)} className="input py-2 text-sm" placeholder="Button text (e.g. Shop Now)" />
                  <input type="text" value={b.link} onChange={e => updateBanner(i, 'link', e.target.value)} className="input py-2 text-sm" placeholder="Link (e.g. /search)" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addBanner} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
            <Plus size={16} /> Add banner
          </button>
        </div>
      </section>

      {/* Logo & Favicon */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Link2 size={20} className="text-primary-600" />
          Branding
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo (light)</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Store navbar, customer login — light backgrounds</p>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden border flex-shrink-0">
                {logo ? (
                  <img src={logo} alt="Logo light" className="w-full h-full object-contain" />
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('logo', e.target.files?.[0])} />
                    {uploading === 'logo' ? <Loader2 className="animate-spin text-gray-400" size={24} /> : <Upload size={24} className="text-gray-400" />}
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {logo && <button type="button" onClick={() => setLogo('')} className="text-xs text-red-600 hover:underline">Remove</button>}
                <label className="block mt-1">
                  <span className="text-xs text-primary-600 cursor-pointer hover:underline">Upload new</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('logo', e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo (dark)</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Footer, admin nav, admin login — dark surfaces</p>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-gray-800 overflow-hidden border border-gray-600 flex-shrink-0">
                {logoDark ? (
                  <img src={logoDark} alt="Logo dark" className="w-full h-full object-contain" />
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('logoDark', e.target.files?.[0])} />
                    {uploading === 'logoDark' ? <Loader2 className="animate-spin text-gray-400" size={24} /> : <Upload size={24} className="text-gray-400" />}
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {logoDark && <button type="button" onClick={() => setLogoDark('')} className="text-xs text-red-600 hover:underline">Remove</button>}
                <label className="block mt-1">
                  <span className="text-xs text-primary-600 cursor-pointer hover:underline">Upload new</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('logoDark', e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favicon</label>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border flex-shrink-0">
                {favicon ? (
                  <img src={favicon} alt="Favicon" className="w-full h-full object-contain" />
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('favicon', e.target.files?.[0])} />
                    {uploading === 'favicon' ? <Loader2 className="animate-spin text-gray-400" size={18} /> : <Upload size={18} className="text-gray-400" />}
                  </label>
                )}
              </div>
              <div className="flex-1">
                {favicon && <button type="button" onClick={() => setFavicon('')} className="text-xs text-red-600 hover:underline">Remove</button>}
                <label className="block mt-1">
                  <span className="text-xs text-primary-600 cursor-pointer hover:underline">Upload new</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('favicon', e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social links */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Share2 size={20} className="text-primary-600" />
          Social links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map(key => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">{key}</label>
              <input type="url" value={social[key] || ''} onChange={e => setSocial(s => ({ ...s, [key]: e.target.value }))} className="input py-2 text-sm" placeholder={`https://${key}.com/...`} />
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Mail size={20} className="text-primary-600" />
          Contact details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1"><Phone size={12} /> Phone</label>
            <input type="text" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} className="input py-2 text-sm" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1"><Mail size={12} /> Email</label>
            <input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} className="input py-2 text-sm" placeholder="hello@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> Address</label>
            <textarea value={contact.address} onChange={e => setContact(c => ({ ...c, address: e.target.value }))} rows={2} className="input py-2 text-sm resize-none" placeholder="Street, City, State, PIN" />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save all
        </button>
      </div>
    </div>
  );
};

export default CustomizationPage;
