import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Star, Clock, IndianRupee, Video, ArrowLeft, Calendar,
  Loader2, CheckCircle, Stethoscope, Globe, Award,
} from 'lucide-react';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';

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

const DoctorBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState(false);

  const dates = getDatesFromToday(14);

  useEffect(() => {
    doctorAPI.getById(id)
      .then(r => { setDoctor(r.data.doctor); setSelectedDate(dates[0]); })
      .catch(() => toast.error('Doctor not found'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) { toast.error('Please login to book a consultation'); navigate('/login'); return; }
    if (!selectedDate || !selectedTime) { toast.error('Please select date and time'); return; }

    const [h, m] = selectedTime.split(':');
    const dt = new Date(selectedDate);
    dt.setHours(parseInt(h), parseInt(m), 0, 0);

    setBooking(true);
    try {
      await doctorAPI.book(id, { scheduledAt: dt.toISOString(), symptoms, paymentMethod: 'online' });
      setDone(true);
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setBooking(false);
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

          {/* Booking form */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5">Choose Your Appointment</h3>

            {/* Date picker */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Select Date</label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {dates.map((d, i) => (
                  <button key={i} onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-center transition-all border text-xs font-semibold min-w-[68px]
                      ${selectedDate && fmtFull(selectedDate) === fmtFull(d)
                        ? 'bg-primary-600 border-primary-600 text-white shadow'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'}`}>
                    <p>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                    <p className="font-black text-sm">{d.getDate()}</p>
                    <p>{d.toLocaleDateString('en-IN', { month: 'short' })}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Select Time</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border
                      ${selectedTime === t
                        ? 'bg-primary-600 border-primary-600 text-white shadow'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
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

            <button onClick={handleBook} disabled={booking || !selectedDate || !selectedTime}
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
