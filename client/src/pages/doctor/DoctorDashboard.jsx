import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Calendar, Clock, Video, Users, FileText, Settings, Save,
  Loader2, CheckCircle, XCircle, Timer, AlertCircle,
  ArrowRight, Stethoscope, IndianRupee, RefreshCw,
} from 'lucide-react';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:   { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Timer, label: 'Pending' },
  confirmed: { color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: CheckCircle, label: 'Confirmed' },
  ongoing:   { color: 'text-green-600 bg-green-50 border-green-200',    icon: Video, label: 'Ongoing' },
  completed: { color: 'text-gray-500 bg-gray-50 border-gray-200',       icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'text-red-600 bg-red-50 border-red-200',          icon: XCircle, label: 'Cancelled' },
};

const MeetingStatus = ({ meetingStatus, meetingLink }) => {
  if (meetingStatus === 'live') return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-green-500 px-2.5 py-1 rounded-full animate-pulse shadow-md shadow-green-500/30">
        <span className="w-2 h-2 rounded-full bg-white" />LIVE
      </span>
      {meetingLink && (
        <a href={meetingLink} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-2.5 py-1 rounded-full transition-colors">
          <Video size={11} />Start Meeting
        </a>
      )}
    </div>
  );
  if (meetingStatus === 'upcoming') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
      <span className="w-2 h-2 rounded-full bg-red-400" />Upcoming
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
      <span className="w-2 h-2 rounded-full bg-gray-400" />Ended
    </span>
  );
};

const DoctorDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [profile, setProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [schedule, setSchedule] = useState([]);
  const [meetingLink, setMeetingLink] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      doctorAPI.getMyProfile(),
      doctorAPI.getMyConsultationsAsDoctor({ limit: 50 }),
    ]).then(([pr, cr]) => {
      const p = pr.data.profile;
      setProfile(p);
      setConsultations(cr.data.consultations || []);
      setSchedule(p?.availability || []);
      setMeetingLink(p?.gmeetLink || '');
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (consultationId, status) => {
    setUpdatingId(consultationId);
    try {
      await doctorAPI.updateConsultationStatus(consultationId, { status });
      toast.success(`Consultation marked as ${status}`);
      load();
    } catch (err) { toast.error(err.message || 'Update failed'); } finally { setUpdatingId(null); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  // Not a doctor yet
  if (!profile) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-950/40 flex items-center justify-center mx-auto mb-6">
        <Stethoscope size={40} className="text-teal-600 dark:text-teal-400" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Complete Your Doctor Profile</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
        Set up your profile to start receiving consultation requests from patients.
      </p>
      <Link to="/doctor/setup" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
        Set Up Profile <ArrowRight size={16} />
      </Link>
    </div>
  );

  // Pending approval
  if (!profile.isApproved) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mx-auto mb-6">
        <AlertCircle size={40} className="text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Profile Under Review</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
        Your doctor profile has been submitted and is pending admin approval. You'll be notified once approved (within 24 hours).
      </p>
      <Link to="/doctor/setup" className="inline-flex items-center gap-2 text-primary-600 border border-primary-200 hover:bg-primary-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
        Edit Profile
      </Link>
    </div>
  );

  const now = Date.now();
  const upcoming = consultations.filter(c => ['pending','confirmed'].includes(c.status) && new Date(c.scheduledAt) >= new Date(now - 90*60*1000));
  const past = consultations.filter(c => c.status === 'completed' || c.status === 'cancelled' || (c.meetingStatus === 'ended' && c.status !== 'pending'));
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  const totalEarnings = consultations
    .filter(c => c.status === 'completed' && c.paymentStatus === 'paid')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const stats = [
    { label: 'Total Consultations', value: profile.totalConsultations, icon: Users, color: 'from-blue-500 to-primary-600' },
    { label: "Today's Appointments", value: consultations.filter(c => { const d = new Date(c.scheduledAt); const t = new Date(); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth(); }).length, icon: Calendar, color: 'from-teal-500 to-emerald-600' },
    { label: 'Total Earning', value: totalEarnings ? `₹${totalEarnings.toFixed(0)}` : '₹0', icon: IndianRupee, color: 'from-amber-500 to-orange-600' },
    { label: 'Rating', value: profile.rating?.count > 0 ? `${profile.rating.average?.toFixed(1)}/5` : 'N/A', icon: CheckCircle, color: 'from-violet-500 to-purple-600' },
  ];

  const handleScheduleChange = (idx, key, value) => {
    setSchedule(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const handleSaveSchedule = async () => {
    if (!profile) return;
    setSavingSchedule(true);
    try {
      await doctorAPI.upsertMyProfile({
        specialization: profile.specialization,
        qualifications: profile.qualifications || [],
        experience: profile.experience || 0,
        bio: profile.bio || '',
        languages: profile.languages || ['English', 'Hindi'],
        consultationFee: profile.consultationFee,
        consultationDuration: profile.consultationDuration || 30,
        profileImage: profile.profileImage || '',
        availability: schedule,
        gmeetLink: meetingLink,
        registrationNumber: profile.registrationNumber || '',
      });
      toast.success('Availability updated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update availability');
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page header — compact, inside layout */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 ring-2 ring-teal-500/20">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-black text-teal-600 dark:text-teal-400">{user?.name?.[0]}</div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 dark:text-white">Dr. {user?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.specialization} · {profile.experience} yrs · <span className="inline-flex items-center gap-0.5"><IndianRupee size={10} />{profile.consultationFee}/session</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load()} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 px-4 py-2 rounded-xl transition-colors font-medium">
              <RefreshCw size={14} />Refresh
            </button>
            <Link to="/doctor/setup" className="flex items-center gap-2 text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors font-semibold shadow-sm">
              <Settings size={14} />Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Weekly availability + meeting link */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Weekly availability</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update your online meeting link and slots for the week.</p>
            </div>
            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={savingSchedule}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60"
            >
              {savingSchedule ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save changes
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Online meeting link</label>
            <input
              value={meetingLink}
              onChange={e => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {schedule.map((row, idx) => (
              <div key={row.day || idx} className="flex items-center gap-3 text-xs">
                <div className="w-24 font-semibold text-gray-700 dark:text-gray-200 truncate">{row.day}</div>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={row.isAvailable}
                    onChange={e => handleScheduleChange(idx, 'isAvailable', e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">Available</span>
                </label>
                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="time"
                    value={row.startTime || '09:00'}
                    onChange={e => handleScheduleChange(idx, 'startTime', e.target.value)}
                    disabled={!row.isAvailable}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[11px] text-gray-800 dark:text-gray-200"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="time"
                    value={row.endTime || '17:00'}
                    onChange={e => handleScheduleChange(idx, 'endTime', e.target.value)}
                    disabled={!row.isAvailable}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[11px] text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultations */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-0">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Consultations</h2>
            <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl w-fit">
              {[{ id: 'upcoming', label: 'Upcoming / Active' }, { id: 'past', label: 'Past' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                    ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  {tab.label} {tab.id === 'upcoming' && upcoming.length > 0 && <span className="ml-1.5 bg-teal-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{upcoming.length}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {displayed.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No {activeTab} consultations</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 p-5">
              {displayed.map(c => {
                const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                const SIcon = sc.icon;
                return (
                  <div key={c._id} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-gray-50/60 dark:bg-gray-900/60">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center font-black text-primary-700 dark:text-primary-400 flex-shrink-0">
                        {c.patient?.name?.[0] || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{c.patient?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{c.patient?.email}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${sc.color}`}>
                            <SIcon size={9} />{sc.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={11} />{new Date(c.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={11} />{new Date(c.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <MeetingStatus meetingStatus={c.meetingStatus} meetingLink={c.meetingLink || profile.gmeetLink} />
                        </div>

                        {c.symptoms && <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">"{c.symptoms}"</p>}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {c.status === 'confirmed' && (
                            <button onClick={() => handleStatusUpdate(c._id, 'completed')} disabled={updatingId === c._id}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg transition-colors">
                              {updatingId === c._id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}Mark Complete
                            </button>
                          )}
                          {['confirmed', 'ongoing'].includes(c.status) && (
                            <button onClick={() => handleStatusUpdate(c._id, 'cancelled')} disabled={updatingId === c._id}
                              className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                              <XCircle size={11} />Cancel
                            </button>
                          )}
                          <Link to={`/doctor/prescription/${c._id}`}
                            className="flex items-center gap-1.5 text-xs font-semibold bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors">
                            <FileText size={11} />
                            {c.status === 'completed' ? 'View/Edit Prescription' : 'Write Prescription'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
