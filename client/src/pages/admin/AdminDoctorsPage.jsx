import { useState, useEffect } from 'react';
import {
  Search, Loader2, CheckCircle, XCircle, Eye, Trash2,
  Stethoscope, Users, Calendar, ChevronDown, ChevronUp,
  IndianRupee, Star, Award, Clock, Video, Filter,
} from 'lucide-react';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  pending:   { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending' },
  confirmed: { color: 'bg-blue-50 text-blue-700 border-blue-200',       label: 'Confirmed' },
  ongoing:   { color: 'bg-green-50 text-green-700 border-green-200',    label: 'Ongoing' },
  completed: { color: 'bg-gray-50 text-gray-600 border-gray-200',       label: 'Completed' },
  cancelled: { color: 'bg-red-50 text-red-600 border-red-200',          label: 'Cancelled' },
};

// ── Doctor detail modal ──────────────────────────────────────────────────────
const DoctorModal = ({ doctor, onClose, onUpdate }) => {
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(doctor.adminNotes || '');

  const handle = async (approved) => {
    setSaving(true);
    try {
      await doctorAPI.adminUpdate(doctor._id, { isApproved: approved, adminNotes: notes });
      toast.success(approved ? 'Doctor approved!' : 'Doctor rejected');
      onUpdate();
      onClose();
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-primary-100 dark:from-teal-950 dark:to-primary-950 flex-shrink-0">
              {doctor.profileImage || doctor.user?.avatar ? (
                <img src={doctor.profileImage || doctor.user.avatar} alt={doctor.user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black text-primary-600 dark:text-primary-400">{doctor.user?.name?.[0]}</div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Dr. {doctor.user?.name}</h2>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">{doctor.specialization}</p>
              <p className="text-xs text-gray-400">{doctor.user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doctor.isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                  {doctor.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Experience', value: `${doctor.experience} years`, icon: Award },
              { label: 'Fee', value: `₹${doctor.consultationFee}`, icon: IndianRupee },
              { label: 'Duration', value: `${doctor.consultationDuration} min`, icon: Clock },
              { label: 'Total Consultations', value: doctor.totalConsultations, icon: Users },
              { label: 'Rating', value: doctor.rating?.count > 0 ? `${doctor.rating.average?.toFixed(1)}/5 (${doctor.rating.count})` : 'No ratings yet', icon: Star },
              { label: 'Reg. No', value: doctor.registrationNumber || 'N/A', icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide flex items-center gap-1 mb-0.5"><Icon size={9} />{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {doctor.qualifications?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Qualifications</p>
              <div className="flex flex-wrap gap-1.5">
                {doctor.qualifications.map(q => (
                  <span key={q} className="text-xs px-2.5 py-1 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 rounded-full border border-primary-100 dark:border-primary-900">{q}</span>
                ))}
              </div>
            </div>
          )}

          {doctor.bio && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Bio</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{doctor.bio}</p>
            </div>
          )}

          {doctor.gmeetLink && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Video size={10} />Meet Link</p>
              <a href={doctor.gmeetLink} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline break-all">{doctor.gmeetLink}</a>
            </div>
          )}

          {/* Admin notes */}
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Internal notes about this doctor…"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!doctor.isApproved && (
              <button onClick={() => handle(true)} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}Approve Doctor
              </button>
            )}
            {doctor.isApproved && (
              <button onClick={() => handle(false)} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}Revoke Approval
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const AdminDoctorsPage = () => {
  const [tab, setTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [cPagination, setCPagination] = useState({ page: 1, pages: 1, total: 0 });

  const loadDoctors = (page = 1) => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (statusFilter === 'approved') params.status = 'approved';
    if (statusFilter === 'pending') params.status = 'pending';
    doctorAPI.adminGetAll(params)
      .then(r => { setDoctors(r.data.doctors); setPagination(r.data.pagination); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const loadConsultations = (page = 1) => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    doctorAPI.adminGetConsultations(params)
      .then(r => { setConsultations(r.data.consultations); setCPagination(r.data.pagination); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'doctors') loadDoctors(1);
    else loadConsultations(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor profile?')) return;
    setDeleting(id);
    try {
      await doctorAPI.adminDelete(id);
      toast.success('Doctor deleted');
      loadDoctors(1);
    } catch { toast.error('Failed to delete'); } finally { setDeleting(null); }
  };

  const filtered = search
    ? doctors.filter(d => d.user?.name?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase()))
    : doctors;

  const stats = [
    { label: 'Total Doctors', value: pagination.total, color: 'from-teal-500 to-primary-600', icon: Stethoscope },
    { label: 'Pending Approval', value: doctors.filter(d => !d.isApproved).length, color: 'from-amber-500 to-orange-600', icon: Clock },
    { label: 'Total Consultations', value: cPagination.total, color: 'from-blue-500 to-primary-600', icon: Calendar },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Doctors Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage doctor profiles, approvals and all consultations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-5">
        {[{ id: 'doctors', label: 'Doctors' }, { id: 'consultations', label: 'All Consultations' }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setStatusFilter(''); setSearch(''); }}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {tab === 'doctors' && (
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search doctors…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        )}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
          <option value="">All</option>
          {tab === 'doctors' ? (
            <><option value="approved">Approved</option><option value="pending">Pending</option></>
          ) : (
            Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)
          )}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
      ) : tab === 'doctors' ? (
        // ── Doctors table ───────────────────────────────────────────────
        filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><Stethoscope size={40} className="mx-auto mb-3 opacity-30" /><p>No doctors found</p></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Doctor</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Specialization</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Fee</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Consultations</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(doc => (
                  <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-teal-100 to-primary-100 flex-shrink-0">
                          {doc.profileImage || doc.user?.avatar ? (
                            <img src={doc.profileImage || doc.user.avatar} alt={doc.user?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-primary-600">{doc.user?.name?.[0]}</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Dr. {doc.user?.name}</p>
                          <p className="text-xs text-gray-400">{doc.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">{doc.specialization}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-gray-700 font-semibold">₹{doc.consultationFee}</td>
                    <td className="px-4 py-4 hidden lg:table-cell text-gray-500">{doc.totalConsultations}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${doc.isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {doc.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedDoctor(doc)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleDelete(doc._id)} disabled={deleting === doc._id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                          {deleting === doc._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i} onClick={() => loadDoctors(i + 1)}
                    className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${pagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        // ── Consultations table ─────────────────────────────────────────
        consultations.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><Calendar size={40} className="mx-auto mb-3 opacity-30" /><p>No consultations found</p></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Doctor</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Scheduled</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Amount</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {consultations.map(c => {
                  const sc = STATUS_CFG[c.status] || STATUS_CFG.pending;
                  return (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{c.patient?.name}</p>
                        <p className="text-xs text-gray-400">{c.patient?.email}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-700">Dr. {c.doctor?.user?.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">{new Date(c.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-400">{new Date(c.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell font-semibold text-gray-700">₹{c.amount}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${sc.color}`}>{sc.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {cPagination.pages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
                {[...Array(cPagination.pages)].map((_, i) => (
                  <button key={i} onClick={() => loadConsultations(i + 1)}
                    className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${cPagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {selectedDoctor && (
        <DoctorModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onUpdate={() => loadDoctors(1)}
        />
      )}
    </div>
  );
};

export default AdminDoctorsPage;
