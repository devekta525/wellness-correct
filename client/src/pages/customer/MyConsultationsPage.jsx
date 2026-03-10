import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Video, Clock, Calendar, Stethoscope, Loader2, Pill,
  ShoppingBag, FileText, ChevronDown, ChevronUp, ExternalLink,
  CheckCircle, AlertCircle, Timer, XCircle, RefreshCw,
} from 'lucide-react';
import { doctorAPI } from '../../services/api';

const STATUS_CONFIG = {
  pending:   { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Timer, label: 'Pending' },
  confirmed: { color: 'bg-blue-50 text-blue-700 border-blue-200',      icon: CheckCircle, label: 'Confirmed' },
  ongoing:   { color: 'bg-green-50 text-green-700 border-green-200',   icon: Video, label: 'Ongoing' },
  completed: { color: 'bg-gray-50 text-gray-600 border-gray-200',      icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-red-50 text-red-700 border-red-200',         icon: XCircle, label: 'Cancelled' },
};

const MeetingBadge = ({ status }) => {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-green-500 px-2.5 py-1 rounded-full shadow-md shadow-green-500/30 animate-pulse">
      <span className="w-2 h-2 rounded-full bg-white" />LIVE — Join Now
    </span>
  );
  if (status === 'upcoming') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
      <span className="w-2 h-2 rounded-full bg-red-400" />Not Started Yet
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
      <span className="w-2 h-2 rounded-full bg-gray-400" />Session Ended
    </span>
  );
};

const PrescriptionCard = ({ prescription }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-green-600 dark:text-green-400" />
          <span className="text-sm font-bold text-green-800 dark:text-green-300">
            Prescription — {new Date(prescription.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        {open ? <ChevronUp size={14} className="text-green-600" /> : <ChevronDown size={14} className="text-green-600" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {prescription.diagnosis && (
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Diagnosis</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{prescription.diagnosis}</p>
            </div>
          )}

          {prescription.medicines?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Pill size={11} />Medicines</p>
              <div className="space-y-2">
                {prescription.medicines.map((m, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-100 dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{m.medicineName}</p>
                    {m.packSizeLabel && <p className="text-xs text-gray-400">{m.packSizeLabel}</p>}
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {m.dosage && <span className="text-xs text-gray-600 dark:text-gray-400">💊 {m.dosage}</span>}
                      {m.frequency && <span className="text-xs text-gray-600 dark:text-gray-400">🔁 {m.frequency}</span>}
                      {m.duration && <span className="text-xs text-gray-600 dark:text-gray-400">⏱ {m.duration}</span>}
                    </div>
                    {m.instructions && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">{m.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {prescription.products?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5"><ShoppingBag size={11} />Recommended Products</p>
              <div className="space-y-2">
                {prescription.products.map((p, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-100 dark:border-gray-700 flex items-start gap-3">
                    {p.thumbnail && <img src={p.thumbnail} alt={p.productName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.productName}</p>
                        {p.product?.slug && (
                          <Link to={`/product/${p.product.slug}`} className="text-primary-600 hover:text-primary-700 flex-shrink-0">
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {p.dosage && <span className="text-xs text-gray-600 dark:text-gray-400">💊 {p.dosage}</span>}
                        {p.frequency && <span className="text-xs text-gray-600 dark:text-gray-400">🔁 {p.frequency}</span>}
                        {p.duration && <span className="text-xs text-gray-600 dark:text-gray-400">⏱ {p.duration}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prescription.notes && (
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Doctor's Notes</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">{prescription.notes}</p>
            </div>
          )}

          {prescription.followUpDate && (
            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-semibold">
              <Calendar size={13} />Follow-up: {new Date(prescription.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ConsultationCard = ({ consultation }) => {
  const [prescription, setPrescription] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[consultation.status] || STATUS_CONFIG.pending;
  const SIcon = sc.icon;
  const ms = consultation.meetingStatus;

  const loadPrescription = async () => {
    if (!expanded) {
      try {
        const r = await doctorAPI.getMyPrescriptions();
        const rx = r.data.prescriptions.find(p => p.consultation?._id === consultation._id || p.consultation === consultation._id);
        setPrescription(rx || null);
      } catch {}
    }
    setExpanded(e => !e);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Doctor avatar */}
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-primary-100 dark:from-teal-950 dark:to-primary-950 flex-shrink-0">
            {consultation.doctor?.profileImage || consultation.doctor?.user?.avatar ? (
              <img src={consultation.doctor.profileImage || consultation.doctor.user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-primary-600">
                {consultation.doctor?.user?.name?.[0] || 'D'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Dr. {consultation.doctor?.user?.name}</h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{consultation.doctor?.specialization}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${sc.color}`}>
                <SIcon size={9} />{sc.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={11} />{new Date(consultation.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={11} />{new Date(consultation.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{consultation.duration} min</span>
            </div>

            {/* Meeting status + link */}
            {consultation.status !== 'cancelled' && consultation.meetingLink && (
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <MeetingBadge status={ms} />
                {ms === 'live' && (
                  <a href={consultation.meetingLink} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-md shadow-green-500/30">
                    <Video size={12} />Join Online
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toggle prescription */}
        <button onClick={loadPrescription}
          className="w-full mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="flex items-center gap-1.5"><FileText size={12} />Prescription & Details</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-50 dark:border-gray-800 pt-4">
          {consultation.symptoms && (
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Your Symptoms</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{consultation.symptoms}</p>
            </div>
          )}
          {prescription ? (
            <PrescriptionCard prescription={prescription} />
          ) : (
            <div className="text-center py-4 text-gray-400">
              <FileText size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">Prescription not available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MyConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    doctorAPI.getMyConsultations()
      .then(r => setConsultations(r.data.consultations || []))
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">My Consultations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your appointments and prescriptions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />Refresh
          </button>
          <Link to="/consultation" className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors">
            <Stethoscope size={12} />Book New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Stethoscope size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No consultations yet</p>
          <p className="text-sm mt-1 mb-6">Book a consultation with one of our wellness experts</p>
          <Link to="/consultation" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            Browse Doctors
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map(c => <ConsultationCard key={c._id} consultation={c} />)}
        </div>
      )}
    </div>
  );
};

export default MyConsultationsPage;
