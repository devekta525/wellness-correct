import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Save, Loader2, Plus, Trash2, Stethoscope, CheckCircle, Upload, User } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SPECS = ['Nutrition & Dietetics', 'Ayurveda', 'Naturopathy', 'Sports Medicine', 'General Wellness', 'Homeopathy', 'Yoga & Lifestyle', 'Mental Wellness'];

const DoctorProfileSetup = () => {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);
  const [form, setForm] = useState({
    specialization: '',
    qualifications: [''],
    experience: '',
    bio: '',
    languages: ['English', 'Hindi'],
    consultationFee: '',
    consultationDuration: 30,
    profileImage: '',
    gmeetLink: '',
    registrationNumber: '',
    availability: DAYS.map(day => ({ day, startTime: '09:00', endTime: '17:00', isAvailable: day !== 'Sunday' })),
  });

  useEffect(() => {
    doctorAPI.getMyProfile()
      .then(r => { if (r.data.profile) setForm(f => ({ ...f, ...r.data.profile, qualifications: r.data.profile.qualifications?.length ? r.data.profile.qualifications : [''] })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setQual = (i, v) => setForm(p => { const q = [...p.qualifications]; q[i] = v; return { ...p, qualifications: q }; });
  const addQual = () => setForm(p => ({ ...p, qualifications: [...p.qualifications, ''] }));
  const removeQual = (i) => setForm(p => ({ ...p, qualifications: p.qualifications.filter((_, idx) => idx !== i) }));
  const toggleLang = (lang) => setForm(p => ({
    ...p,
    languages: p.languages.includes(lang) ? p.languages.filter(l => l !== lang) : [...p.languages, lang],
  }));
  const setAvail = (i, k, v) => setForm(p => {
    const a = [...p.availability];
    a[i] = { ...a[i], [k]: v };
    return { ...p, availability: a };
  });

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, etc.)');
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await doctorAPI.uploadProfileImage(formData);
      if (res.data?.url) {
        set('profileImage', res.data.url);
        toast.success('Photo uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.specialization) { toast.error('Specialization is required'); return; }
    if (!form.consultationFee) { toast.error('Consultation fee is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, qualifications: form.qualifications.filter(Boolean), experience: Number(form.experience) || 0, consultationFee: Number(form.consultationFee), consultationDuration: Number(form.consultationDuration) };
      await doctorAPI.upsertMyProfile(payload);
      toast.success('Profile saved! Pending admin approval.');
      navigate('/doctor/dashboard');
    } catch (err) { toast.error(err.message || 'Failed to save'); } finally { setSaving(false); }
  };

  if (!user) return null;

  const inputCls = 'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all';
  const labelCls = 'block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5';
  const cardCls = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm';

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="page-container max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center">
            <Stethoscope size={20} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Doctor Profile Setup</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Complete your profile to start taking consultations</p>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">Your profile will be reviewed by our admin team before going live. You'll be approved within 24 hours.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Basic Info */}
          <div className={cardCls}>
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelCls}>Specialization *</label>
                <select className={inputCls} value={form.specialization} onChange={e => set('specialization', e.target.value)} required>
                  <option value="">Select specialization</option>
                  {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Experience (years) *</label>
                <input className={inputCls} type="number" min="0" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="5" required />
              </div>
              <div>
                <label className={labelCls}>Registration Number</label>
                <input className={inputCls} value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} placeholder="MCI-XXXX" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Bio / About</label>
                <textarea className={`${inputCls} resize-none`} rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell patients about your expertise, approach, and what you specialise in…" />
              </div>
              <div>
                <label className={labelCls}>Profile Photo</label>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-60">
                    {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploadingImage ? 'Uploading…' : 'Upload image'}
                  </button>
                  {form.profileImage && (
                    <div className="relative flex-shrink-0">
                      <img src={form.profileImage} alt="Profile" className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
                      <button type="button" onClick={() => set('profileImage', '')} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold hover:bg-red-600">×</button>
                    </div>
                  )}
                  {!form.profileImage && !uploadingImage && (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <User size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">JPG, PNG or WebP. Max 10MB.</p>
              </div>
              <div>
                <label className={labelCls}>Online Link</label>
                <input className={inputCls} value={form.gmeetLink} onChange={e => set('gmeetLink', e.target.value)} placeholder="https://meet.google.com/xxx-xxxx-xxx" />
                <p className="text-[11px] text-gray-400 mt-1">Your permanent Meet room. Shared with patients upon booking.</p>
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">Qualifications</h2>
              <button type="button" onClick={addQual} className="flex items-center gap-1 text-xs font-semibold text-primary-600 border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"><Plus size={12} />Add</button>
            </div>
            <div className="space-y-2">
              {form.qualifications.map((q, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls} value={q} onChange={e => setQual(i, e.target.value)} placeholder="e.g. MBBS, MD Nutrition, B.Sc Dietetics" />
                  {form.qualifications.length > 1 && (
                    <button type="button" onClick={() => removeQual(i)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className={cardCls}>
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Languages Spoken</h2>
            <div className="flex flex-wrap gap-2">
              {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam'].map(lang => (
                <button type="button" key={lang} onClick={() => toggleLang(lang)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${form.languages.includes(lang) ? 'bg-primary-600 border-primary-600 text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'}`}>
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Consultation fee */}
          <div className={cardCls}>
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Consultation Details</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Consultation Fee (₹) *</label>
                <input className={inputCls} type="number" min="0" value={form.consultationFee} onChange={e => set('consultationFee', e.target.value)} placeholder="500" required />
              </div>
              <div>
                <label className={labelCls}>Session Duration (minutes)</label>
                <select className={inputCls} value={form.consultationDuration} onChange={e => set('consultationDuration', Number(e.target.value))}>
                  {[15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d} minutes</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className={cardCls}>
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Weekly Availability</h2>
            <div className="space-y-3">
              {form.availability.map((slot, i) => (
                <div key={slot.day} className="flex items-center gap-3">
                  <div className="w-24">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={slot.isAvailable} onChange={e => setAvail(i, 'isAvailable', e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{slot.day.slice(0, 3)}</span>
                    </label>
                  </div>
                  {slot.isAvailable && (
                    <>
                      <input type="time" value={slot.startTime} onChange={e => setAvail(i, 'startTime', e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={slot.endTime} onChange={e => setAvail(i, 'endTime', e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400" />
                    </>
                  )}
                  {!slot.isAvailable && <span className="text-xs text-gray-400">Not available</span>}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all">
            {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : <><Save size={16} />Save Profile & Submit for Review</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfileSetup;
