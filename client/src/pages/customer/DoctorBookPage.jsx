import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Star, Clock, IndianRupee, Video, ArrowLeft, Calendar,
  Loader2, CheckCircle, Stethoscope, Globe, Award, CreditCard, Wallet, Banknote,
} from 'lucide-react';
import { doctorAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const GATEWAY_ICONS = { razorpay: CreditCard, stripe: CreditCard, cashfree: Wallet, payu: Banknote };

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

const getDatesFromToday = (n = 14) => {
  const dates = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const fmt = (date) => date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtFull = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

// Given a date and booked slots (array of { start, end } ISO strings), return time strings that are available.
const getAvailableSlotsForDate = (date, bookedSlots, durationMinutes = 30) => {
  const dateStr = fmtFull(date);
  const now = new Date();
  const isToday = dateStr === fmtFull(now);

  return TIME_SLOTS.filter((timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

    if (isToday && slotStart <= now) return false;

    const overlaps = bookedSlots.some((b) => {
      const bStart = new Date(b.start).getTime();
      const bEnd = new Date(b.end).getTime();
      return slotStart.getTime() < bEnd && slotEnd.getTime() > bStart;
    });
    return !overlaps;
  });
};

let razorpayScriptPromise = null;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve();
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
};

const DoctorBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState([]);
  const [gatewayId, setGatewayId] = useState('');
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const dates = getDatesFromToday(14);

  useEffect(() => {
    doctorAPI.getById(id)
      .then(r => { setDoctor(r.data.doctor); setSelectedDate(dates[0]); })
      .catch(() => toast.error('Doctor not found'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 14);
    doctorAPI.getBookedSlots(id, { from: fmtFull(from), to: fmtFull(to) })
      .then(res => setBookedSlots(res.data.slots || []))
      .catch(() => setBookedSlots([]));
  }, [id]);

  useEffect(() => {
    paymentAPI.getActiveGateways()
      .then(res => {
        const g = res.data.gateways || [];
        setGateways(g);
        if (g.length) setGatewayId(g[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingGateways(false));
  }, []);

  const handleBook = async () => {
    if (!isAuthenticated) { toast.error('Please login to book a consultation'); navigate('/login'); return; }
    if (!selectedDate || !selectedTime) { toast.error('Please select date and time'); return; }
    if (!gatewayId || !gateways.length) { toast.error('No payment method available'); return; }

    const [h, m] = selectedTime.split(':');
    const dt = new Date(selectedDate);
    dt.setHours(parseInt(h), parseInt(m), 0, 0);

    setBooking(true);
    try {
      const res = await doctorAPI.book(id, { scheduledAt: dt.toISOString(), symptoms, gatewayId });
      const { consultation, paymentOrder } = res.data || {};
      if (!consultation || !paymentOrder) throw new Error('Unable to initiate payment. Please try again.');

      // ── Razorpay ───────────────────────────────────────────────────────
      if (gatewayId === 'razorpay') {
        await loadRazorpayScript();
        if (!window.Razorpay) throw new Error('Razorpay SDK not available');
        const rzp = new window.Razorpay({
          key: paymentOrder.key_id,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: 'Wellness Fuel',
          description: `Consultation with Dr. ${doctor.user?.name}`,
          order_id: paymentOrder.razorpayOrderId || paymentOrder.id,
          handler: async (response) => {
            try {
              await doctorAPI.verifyConsultationPayment({
                gatewayId: 'razorpay',
                consultationId: consultation._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setDone(true);
              toast.success('Payment successful. Consultation booked!');
            } catch (err) {
              toast.error(err.message || 'Payment verification failed');
            } finally {
              setBooking(false);
            }
          },
          prefill: { name: user?.name || '', email: user?.email || '' },
          theme: { color: '#0f766e' },
          modal: { ondismiss: () => { setBooking(false); toast.error('Payment cancelled'); } },
        });
        rzp.open();
        return;
      }

      // ── PayU (form redirect) ───────────────────────────────────────────
      if (gatewayId === 'payu') {
        const pd = paymentOrder;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = pd.action_url;
        const baseUrl = window.location.origin;
        const fields = {
          key: pd.merchant_key,
          txnid: pd.txn_id,
          amount: pd.amount,
          productinfo: pd.product_info || 'Consultation',
          firstname: pd.first_name,
          email: pd.email,
          phone: user?.phone || '',
          surl: `${baseUrl}/api/payments/payu/response`,
          furl: `${baseUrl}/api/payments/payu/response`,
          hash: pd.hash,
        };
        Object.entries(fields).forEach(([k, v]) => {
          const inp = document.createElement('input');
          inp.type = 'hidden';
          inp.name = k;
          inp.value = v || '';
          form.appendChild(inp);
        });
        document.body.appendChild(form);
        setBooking(false);
        form.submit();
        return;
      }

      // ── Cashfree (redirect to gateway, then to consultation-booked) ─────
      if (gatewayId === 'cashfree') {
        const gw = gateways.find(g => g.id === 'cashfree');
        const returnUrl = `${window.location.origin}/consultation-booked/${consultation._id}?gateway=cashfree`;
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
          const cashfree = new window.Cashfree({ mode: (gw && gw.mode) || 'sandbox' });
          cashfree.checkout({
            paymentSessionId: paymentOrder.paymentSessionId || paymentOrder.payment_session_id,
            returnUrl,
          });
        };
        document.body.appendChild(script);
        setBooking(false);
        return;
      }

      // ── Stripe (redirect to consultation-booked to verify) ─────────────
      if (gatewayId === 'stripe') {
        navigate(`/consultation-booked/${consultation._id}?gateway=stripe`, { replace: true });
        setBooking(false);
        return;
      }

      setBooking(false);
      toast.error('Unsupported payment method');
    } catch (err) {
      setBooking(false);
      toast.error(err.message || 'Could not start payment');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary-500" size={36} />
    </div>
  );

  if (!doctor) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Stethoscope size={64} className="text-gray-200 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Doctor Not Found</h2>
      <Link to="/consultation" className="mt-4 inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
        <ArrowLeft size={16} />Back to Doctors
      </Link>
    </div>
  );

  if (done) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Consultation Booked!</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Your appointment with Dr. {doctor.user?.name} is confirmed.</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        {selectedDate && fmt(selectedDate)} at {selectedTime} · {doctor.consultationDuration} min session
      </p>
      <p className="text-xs text-gray-400 mb-6 max-w-sm">
        You'll find the Online link in your <strong>My Consultations</strong> section. The link becomes active 10 minutes before the session (shown in green).
      </p>
      <div className="flex gap-3">
        <Link to="/my-consultations" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
          View My Consultations
        </Link>
        <Link to="/consultation" className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Browse More
        </Link>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in py-10">
      <div className="page-container max-w-5xl">
        <Link to="/consultation" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} />All Doctors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Doctor Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-primary-100 dark:from-teal-950 dark:to-primary-950 flex-shrink-0">
                  {doctor.profileImage || doctor.user?.avatar ? (
                    <img src={doctor.profileImage || doctor.user?.avatar} alt={doctor.user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-primary-600">{doctor.user?.name?.[0]}</div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">Dr. {doctor.user?.name}</h2>
                  <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">{doctor.specialization}</p>
                  <p className="text-xs text-gray-400">{doctor.experience} years experience</p>
                </div>
              </div>

              {doctor.rating?.count > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < Math.round(doctor.rating.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />)}
                  </div>
                  <span className="text-xs text-gray-500">{doctor.rating.average?.toFixed(1)} · {doctor.rating.count} reviews</span>
                </div>
              )}

              {doctor.bio && <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{doctor.bio}</p>}

              <div className="space-y-2">
                {doctor.qualifications?.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Award size={13} className="text-primary-500 flex-shrink-0" />
                    {doctor.qualifications.join(', ')}
                  </div>
                )}
                {doctor.languages?.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Globe size={13} className="text-primary-500 flex-shrink-0" />
                    {doctor.languages.join(', ')}
                  </div>
                )}
                {doctor.registrationNumber && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                    Reg. No: {doctor.registrationNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Fee card */}
            <div className="bg-gradient-to-br from-teal-50 to-primary-50 dark:from-teal-950/30 dark:to-primary-950/30 rounded-2xl border border-teal-100 dark:border-teal-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-2xl font-black text-gray-900 dark:text-white">
                  <IndianRupee size={18} />{doctor.consultationFee}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock size={12} />{doctor.consultationDuration} min</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 font-medium">
                <Video size={13} />Online session — link shared on booking
              </div>
            </div>
          </div>

          {/* Booking form — Calendly-style: date then available times only */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5">Choose Your Appointment</h3>

            {/* Date picker — calendar strip */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Select date</label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {dates.map((d, i) => {
                  const hasAvailability = doctor && getAvailableSlotsForDate(d, bookedSlots, doctor.consultationDuration).length > 0;
                  const isSelected = selectedDate && fmtFull(selectedDate) === fmtFull(d);
                  return (
                    <button key={i} type="button" onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                      className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-center transition-all border text-xs font-semibold min-w-[72px]
                        ${isSelected
                          ? 'bg-primary-600 border-primary-600 text-white shadow'
                          : hasAvailability
                            ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/30'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-default opacity-75'}`}>
                      <p>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                      <p className="font-black text-sm mt-0.5">{d.getDate()}</p>
                      <p>{d.toLocaleDateString('en-IN', { month: 'short' })}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available times only — Calendly-style list (booked slots removed) */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                {selectedDate ? `Available times for ${fmt(selectedDate)}` : 'Select time'}
              </label>
              {!selectedDate ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-3">Select a date first</p>
              ) : (() => {
                const available = doctor ? getAvailableSlotsForDate(selectedDate, bookedSlots, doctor.consultationDuration) : [];
                if (available.length === 0) {
                  return (
                    <p className="text-sm text-amber-600 dark:text-amber-400 py-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl px-4">
                      No availability on this day. Please choose another date.
                    </p>
                  );
                }
                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {available.map((t) => (
                      <button key={t} type="button" onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all border text-center
                          ${selectedTime === t
                            ? 'bg-primary-600 border-primary-600 text-white shadow'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/30'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Symptoms */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                Describe your symptoms / concerns <span className="normal-case font-normal text-gray-400">(optional)</span>
              </label>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3}
                placeholder="e.g., low energy, poor sleep, gut issues, weight management…"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
            </div>

            {/* Payment method */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Payment method</label>
              {loadingGateways ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 size={16} className="animate-spin" /> Loading…
                </div>
              ) : gateways.length === 0 ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">No payment method available. Please try again later.</p>
              ) : (
                <div className="space-y-2">
                  {gateways.map(gw => {
                    const Icon = GATEWAY_ICONS[gw.id] || CreditCard;
                    return (
                      <label key={gw.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${gatewayId === gw.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                        <input type="radio" name="consultGateway" value={gw.id} checked={gatewayId === gw.id} onChange={() => setGatewayId(gw.id)} className="text-primary-600" />
                        <Icon size={20} className={gatewayId === gw.id ? 'text-primary-600' : 'text-gray-500'} />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{gw.displayName}</p>
                          {gw.description && <p className="text-xs text-gray-500 line-clamp-1">{gw.description}</p>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-primary-50 dark:bg-primary-950/30 rounded-xl p-4 mb-5 border border-primary-100 dark:border-primary-900/50">
                <p className="text-xs font-bold text-primary-700 dark:text-primary-400 mb-1">Appointment Summary</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Dr. {doctor.user?.name}</strong> · {fmt(selectedDate)}, {selectedTime} · {doctor.consultationDuration} min
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1">
                  <IndianRupee size={13} />{doctor.consultationFee} — paid online
                </p>
              </div>
            )}

            <button onClick={handleBook} disabled={booking || !selectedDate || !selectedTime || !gateways.length}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              {booking ? <><Loader2 size={16} className="animate-spin" />Booking…</> : <><Calendar size={16} />Confirm Booking — ₹{doctor.consultationFee}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorBookPage;
