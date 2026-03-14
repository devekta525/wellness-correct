import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Star, Clock, IndianRupee, Search,
  Loader2, ArrowRight, ShieldCheck, Video, Award, Users,
  CheckCircle,
} from 'lucide-react';
import { doctorAPI } from '../../services/api';

const HERO_STATS = [
  { icon: Users, value: '500+', label: 'Consultations Done' },
  { icon: Award, value: '50+', label: 'Expert Doctors' },
  { icon: ShieldCheck, value: '100%', label: 'Verified Doctors' },
  { icon: Video, value: 'Live', label: 'Online Sessions' },
];

const ConsultationPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchDoctors = (page = 1, spec = activeSpec, q = search) => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (spec) params.specialization = spec;
    if (q) params.search = q;
    doctorAPI.getAll(params)
      .then(r => { setDoctors(r.data.doctors); setPagination(r.data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    doctorAPI.getSpecializations().then(r => setSpecializations(r.data.specializations || [])).catch(() => {});
    fetchDoctors(1, '', '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpec = (s) => { setActiveSpec(s); setSearch(''); fetchDoctors(1, s, ''); };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSpec('');
    fetchDoctors(1, '', search);
  };

  return (
    <div className="animate-fade-in">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-blue-900 to-teal-900 py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="page-container relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-teal-300 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/15">
                <Stethoscope size={11} /> Expert Wellness Consultations
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Talk to a Wellness<br /><span className="text-teal-300">Expert Doctor</span><br />from Home
              </h1>
              <p className="text-white/60 text-base md:text-lg mb-8 leading-relaxed">
                Book a private video consultation with certified nutrition & wellness doctors. Get personalised advice, prescriptions, and product recommendations.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#doctors" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-teal-500/30">
                  Browse Doctors <ArrowRight size={16} />
                </a>
                <Link to="/doctor/setup" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                  Join as Doctor
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {HERO_STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                    <Icon size={20} className="text-teal-300" />
                  </div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-white/50 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="page-container">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-primary-500 mb-6">How It Works</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Search, title: 'Find a Doctor', desc: 'Browse verified wellness experts by specialization' },
              { step: '02', icon: Clock, title: 'Book a Slot', desc: 'Pick a date & time that suits you' },
              { step: '03', icon: Video, title: 'Join Online', desc: 'Get notified when the session goes live (green indicator)' },
              { step: '04', icon: CheckCircle, title: 'Get Prescription', desc: 'Receive medicines & product recommendations in your dashboard' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mx-auto">
                    <Icon size={22} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-black bg-primary-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctor Listing ─────────────────────────────────────────────── */}
      <section id="doctors" className="py-14 md:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 text-center">
            Our Verified Wellness Doctors
          </h2>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors by name or specialization…"
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">Search</button>
            </form>
          </div>

          {/* Specialization chips */}
          {specializations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button onClick={() => handleSpec('')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!activeSpec ? 'bg-primary-600 text-white shadow' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                All
              </button>
              {specializations.map(s => (
                <button key={s} onClick={() => handleSpec(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeSpec === s ? 'bg-primary-600 text-white shadow' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Stethoscope size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No doctors found</p>
              <p className="text-sm mt-1">Check back soon as more doctors join</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
              </div>
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => fetchDoctors(i + 1)}
                      className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${pagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const DoctorCard = ({ doctor }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
    <div className="p-5">
      {/* Avatar + name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-primary-100 dark:from-teal-950 dark:to-primary-950 flex-shrink-0">
          {doctor.profileImage || doctor.user?.avatar ? (
            <img src={doctor.profileImage || doctor.user?.avatar} alt={doctor.user?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-black text-primary-600 dark:text-primary-400">
              {doctor.user?.name?.[0] || 'D'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">Dr. {doctor.user?.name}</h3>
          <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{doctor.specialization}</p>
          <p className="text-[11px] text-gray-400">{doctor.experience} yrs exp</p>
        </div>
      </div>

      {/* Rating */}
      {doctor.rating?.count > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className={i < Math.round(doctor.rating.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <span className="text-[11px] text-gray-500">{doctor.rating.average?.toFixed(1)} ({doctor.rating.count})</span>
        </div>
      )}

      {/* Languages */}
      {doctor.languages?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {doctor.languages.slice(0, 3).map(l => (
            <span key={l} className="text-[10px] px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full border border-gray-100 dark:border-gray-700">{l}</span>
          ))}
        </div>
      )}

      {/* Fee + duration */}
      <div className="flex items-center justify-between mb-4 py-3 border-t border-b border-gray-50 dark:border-gray-800">
        <div>
          <p className="text-[10px] text-gray-400">Consultation Fee</p>
          <p className="text-base font-black text-gray-900 dark:text-white flex items-center gap-0.5">
            <IndianRupee size={13} />{doctor.consultationFee}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400">Duration</p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{doctor.consultationDuration} min</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link to={`/consultation/${doctor._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors">
          Book Now <ArrowRight size={12} />
        </Link>
        <Link to={`/consultation/${doctor._id}`}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs font-semibold">
          Profile
        </Link>
      </div>
    </div>
  </div>
);

export default ConsultationPage;
