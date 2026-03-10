import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search, Plus, Trash2, Save, Loader2, Pill, ShoppingBag,
  ArrowLeft, CheckCircle, User, Calendar, X,
} from 'lucide-react';
import { doctorAPI, productAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── Medicine search with debounce ────────────────────────────────────────────
const MedicineSearch = ({ onAdd }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = useCallback((val) => {
    if (val.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    doctorAPI.searchMedicines(val)
      .then(r => { setResults(r.data.medicines || []); setShow(true); })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (med) => {
    onAdd({
      medicineId: med._id,
      medicineName: med.name,
      packSizeLabel: med.packSizeLabel || '',
      dosage: '', frequency: '', duration: '', instructions: '',
    });
    setQ(''); setResults([]); setShow(false);
    toast.success(`Added: ${med.name}`);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {searching && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
        <input
          value={q}
          onChange={handleChange}
          onFocus={() => q.length >= 2 && setShow(true)}
          placeholder="Search medicines (e.g. Paracetamol, Ashwagandha…)"
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>
      {show && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map(med => (
            <button key={med._id} onClick={() => handleSelect(med)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-50 dark:border-gray-800 last:border-0">
              <Pill size={14} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{med.name}</p>
                <p className="text-xs text-gray-400">{med.packSizeLabel} · {med.manufacturerName}</p>
                {med.shortComposition1 && <p className="text-xs text-gray-400 italic">{med.shortComposition1}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
      {show && q.length >= 2 && results.length === 0 && !searching && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3">
          <p className="text-sm text-gray-400">No medicines found for "{q}"</p>
        </div>
      )}
    </div>
  );
};

// ── Product search ───────────────────────────────────────────────────────────
const ProductSearch = ({ onAdd }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = useCallback((val) => {
    if (val.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    productAPI.getAll({ search: val, limit: 10 })
      .then(r => { setResults(r.data.products || []); setShow(true); })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (prod) => {
    onAdd({
      productId: prod._id,
      productName: prod.title,
      thumbnail: prod.thumbnail || prod.images?.[0]?.url || '',
      dosage: '', frequency: '', duration: '', instructions: '',
    });
    setQ(''); setResults([]); setShow(false);
    toast.success(`Added: ${prod.title}`);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {searching && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
        <input
          value={q}
          onChange={handleChange}
          onFocus={() => q.length >= 2 && setShow(true)}
          placeholder="Search Wellness Fuel products…"
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>
      {show && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map(prod => (
            <button key={prod._id} onClick={() => handleSelect(prod)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-50 dark:border-gray-800 last:border-0">
              {prod.thumbnail ? (
                <img src={prod.thumbnail} alt={prod.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : <ShoppingBag size={18} className="text-primary-400 flex-shrink-0" />}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{prod.title}</p>
                <p className="text-xs text-gray-400">₹{prod.price}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Rx row editor ────────────────────────────────────────────────────────────
const RxRow = ({ item, onChange, onRemove, isProduct }) => {
  const inp = 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-400 w-full';
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 space-y-2">
      <div className="flex items-start gap-2">
        {isProduct && item.thumbnail && (
          <img src={item.thumbnail} alt={item.productName} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
        )}
        {!isProduct && <Pill size={16} className="text-primary-500 flex-shrink-0 mt-1" />}
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{isProduct ? item.productName : item.medicineName}</p>
          {!isProduct && item.packSizeLabel && <p className="text-xs text-gray-400">{item.packSizeLabel}</p>}
        </div>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-500 transition-colors"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div><label className="text-[10px] text-gray-400 block mb-0.5">Dosage</label><input className={inp} value={item.dosage} onChange={e => onChange('dosage', e.target.value)} placeholder="1 tablet" /></div>
        <div><label className="text-[10px] text-gray-400 block mb-0.5">Frequency</label><input className={inp} value={item.frequency} onChange={e => onChange('frequency', e.target.value)} placeholder="Twice daily" /></div>
        <div><label className="text-[10px] text-gray-400 block mb-0.5">Duration</label><input className={inp} value={item.duration} onChange={e => onChange('duration', e.target.value)} placeholder="7 days" /></div>
        <div><label className="text-[10px] text-gray-400 block mb-0.5">Instructions</label><input className={inp} value={item.instructions} onChange={e => onChange('instructions', e.target.value)} placeholder="After meals" /></div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const DoctorPrescriptionPage = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ diagnosis: '', medicines: [], products: [], notes: '', followUpDate: '' });

  useEffect(() => {
    // Load consultation + existing prescription
    Promise.all([
      doctorAPI.getMyConsultationsAsDoctor({ limit: 100 }),
      doctorAPI.getPrescription(consultationId),
    ]).then(([cr, pr]) => {
      const c = cr.data.consultations.find(c => c._id === consultationId);
      setConsultation(c || null);
      if (pr.data.prescription) {
        const rx = pr.data.prescription;
        setForm({
          diagnosis: rx.diagnosis || '',
          medicines: rx.medicines || [],
          products: rx.products || [],
          notes: rx.notes || '',
          followUpDate: rx.followUpDate ? rx.followUpDate.split('T')[0] : '',
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [consultationId]);

  const updateMed = (i, k, v) => setForm(f => { const m = [...f.medicines]; m[i] = { ...m[i], [k]: v }; return { ...f, medicines: m }; });
  const removeMed = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updateProd = (i, k, v) => setForm(f => { const p = [...f.products]; p[i] = { ...p[i], [k]: v }; return { ...f, products: p }; });
  const removeProd = (i) => setForm(f => ({ ...f, products: f.products.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorAPI.createPrescription(consultationId, form);
      toast.success('Prescription saved!');
      setSaved(true);
    } catch (err) { toast.error(err.message || 'Failed to save'); } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  const inputCls = 'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="page-container max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/doctor/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
            <ArrowLeft size={14} />Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Write Prescription</h1>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : saved ? <><CheckCircle size={14} />Update</> : <><Save size={14} />Save Prescription</>}
          </button>
        </div>

        {/* Patient info */}
        {consultation && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center font-black text-primary-700 dark:text-primary-400 text-lg flex-shrink-0">
              {consultation.patient?.name?.[0] || 'P'}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{consultation.patient?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                <span className="flex items-center gap-1"><Calendar size={11} />{new Date(consultation.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {consultation.symptoms && <span className="flex items-center gap-1"><User size={11} />Symptoms noted</span>}
              </p>
              {consultation.symptoms && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{consultation.symptoms}"</p>}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* Diagnosis */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Diagnosis</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Nutritional deficiency, gut inflammation, stress-related fatigue…" />
          </div>

          {/* Medicines */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Pill size={16} className="text-primary-500" />Medicines</h3>
            <MedicineSearch onAdd={m => setForm(f => ({ ...f, medicines: [...f.medicines, m] }))} />
            {form.medicines.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.medicines.map((m, i) => (
                  <RxRow key={i} item={m} onChange={(k, v) => updateMed(i, k, v)} onRemove={() => removeMed(i)} isProduct={false} />
                ))}
              </div>
            )}
            {form.medicines.length === 0 && (
              <p className="text-xs text-gray-400 mt-3 text-center py-3">Search and add medicines above</p>
            )}
          </div>

          {/* Products */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><ShoppingBag size={16} className="text-teal-500" />Wellness Fuel Products</h3>
            <ProductSearch onAdd={p => setForm(f => ({ ...f, products: [...f.products, p] }))} />
            {form.products.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.products.map((p, i) => (
                  <RxRow key={i} item={p} onChange={(k, v) => updateProd(i, k, v)} onRemove={() => removeProd(i)} isProduct={true} />
                ))}
              </div>
            )}
            {form.products.length === 0 && (
              <p className="text-xs text-gray-400 mt-3 text-center py-3">Search and add recommended Wellness Fuel products above</p>
            )}
          </div>

          {/* Notes + follow-up */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Doctor's Notes</label>
              <textarea className={`${inputCls} resize-none`} rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="General advice, lifestyle tips, dietary recommendations…" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Follow-up Date (optional)</label>
              <input type="date" className={inputCls} value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all">
            {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : <><Save size={16} />Save & Send Prescription to Patient</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescriptionPage;
