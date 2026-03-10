import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Calendar, Clock, Video, Users, FileText, Settings,
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
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [profile, setProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const load = () => {
    setLoading(true);
    Promise.all([
      doctorAPI.getMyProfile(),
      doctorAPI.getMyConsultationsAsDoctor({ limit: 50 }),
    ]).then(([pr, cr]) => {
      setProfile(pr.data.profile);
      setConsultations(cr.data.consultations || []);
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

  const stats = [
    { label: 'Total Consultations', value: profile.totalConsultations, icon: Users, color: 'from-blue-500 to-primary-600' },
    { label: "Today's Appointments", value: consultations.filter(c => { const d = new Date(c.scheduledAt); const t = new Date(); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth(); }).length, icon: Calendar, color: 'from-teal-500 to-emerald-600' },
    { label: 'Pending Approval', value: consultations.filter(c => c.status === 'pending').length, icon: Timer, color: 'from-amber-500 to-orange-600' },
    { label: 'Rating', value: profile.rating?.count > 0 ? `${profile.rating.average?.toFixed(1)}/5` : 'N/A', icon: CheckCircle, color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 to-primary-900 px-6 py-8">
        <div className="page-container max-w-5xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-black text-white">{user?.name?.[0]}</div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Dr. {user?.name}</h1>
                <p className="text-teal-300 text-sm">{profile.specialization} · {profile.experience} yrs exp</p>
                <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5"><IndianRupee size={10} />₹{profile.consultationFee} / session</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => load()} className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-xl transition-colors">
                <RefreshCw size={13} />Refresh
              </button>
              <Link to="/doctor/setup" className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl transition-colors font-semibold">
                <Settings size={13} />Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container max-w-5xl py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Consultations */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            {[{ id: 'upcoming', label: 'Upcoming / Active' }, { id: 'past', label: 'Past' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 -mb-px
                  ${activeTab === tab.id ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {tab.label} {tab.id === 'upcoming' && upcoming.length > 0 && <span className="ml-1 bg-teal-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{upcoming.length}</span>}
              </button>
            ))}
          </div>

          {displayed.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No {activeTab} consultations</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {displayed.map(c => {
                const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                const SIcon = sc.icon;
                return (
                  <div key={c._id} className="p-5">
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
