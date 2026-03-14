import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, MapPin, Plus, Edit3, Check } from 'lucide-react';
import { updateProfile } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
  }, [user]);
  const [newAddress, setNewAddress] = useState({ label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleSaveProfile = () => {
    dispatch(updateProfile(form));
    setEditing(false);
  };

  const handleAddAddress = async () => {
    try {
      await authAPI.addAddress(newAddress);
      toast.success('Address added!');
      setAddingAddress(false);
      window.location.reload();
    } catch (err) { toast.error(err.message); }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setChangingPw(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message); } finally { setSavingPw(false); }
  };

  if (!user) {
    return (
      <div className="page-container py-8 flex items-center justify-center min-h-[40vh]">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-5">
          <div className="card p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
                  <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs mt-1 capitalize">{user?.role}</span>
                </div>
              </div>
              <button onClick={() => setEditing(!editing)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${editing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50'}`}>
                <Edit3 size={14} />{editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-3">
                {[{ key: 'name', label: 'Full Name', icon: User }, { key: 'phone', label: 'Phone', icon: Phone }].map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="input pl-9 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
                    </div>
                  </div>
                ))}
                <button onClick={handleSaveProfile} disabled={loading} className="btn-primary text-sm py-2.5 flex items-center gap-2">
                  {loading ? <Loader size="sm" /> : <><Check size={16} />Save Changes</>}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: User, label: 'Full Name', value: user?.name },
                  { icon: Mail, label: 'Email', value: user?.email },
                  { icon: Phone, label: 'Phone', value: user?.phone || 'Not set' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <Icon size={16} className="text-primary-600 dark:text-primary-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="card p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={18} className="text-primary-600 dark:text-primary-400" />Saved Addresses</h3>
              <button onClick={() => setAddingAddress(true)} className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 font-medium">
                <Plus size={14} />Add New
              </button>
            </div>

            {(user?.addresses?.length ?? 0) === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No addresses saved yet.</p>
            ) : (
              <div className="space-y-3">
                {(user?.addresses || []).map((addr, i) => (
                  <div key={i} className={`p-4 rounded-xl border-2 transition-all ${addr.isDefault ? 'border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                    <div className="flex justify-between">
                      <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">{addr.label}</span>
                      {addr.isDefault && <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs">Default</span>}
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-2">{addr.fullName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{addr.street}, {addr.city}, {addr.state} {addr.pincode}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {addingAddress && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 animate-slide-up">
                <h4 className="font-semibold text-gray-800 dark:text-white">New Address</h4>
                {[
                  { key: 'fullName', label: 'Full Name', cols: 'col-span-2' },
                  { key: 'phone', label: 'Phone', type: 'tel' },
                  { key: 'label', label: 'Label (Home/Office)' },
                  { key: 'street', label: 'Street Address', cols: 'col-span-2' },
                  { key: 'city', label: 'City' },
                  { key: 'state', label: 'State' },
                  { key: 'pincode', label: 'Pincode' },
                ].map(({ key, label, cols, type }) => (
                  <div key={key} className={cols || ''}>
                    <input type={type || 'text'} value={newAddress[key]} onChange={e => setNewAddress(a => ({ ...a, [key]: e.target.value }))}
                      className="input py-2 text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" placeholder={label} />
                  </div>
                ))}
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress(a => ({ ...a, isDefault: e.target.checked }))} />
                  Set as default address
                </label>
                <div className="flex gap-2">
                  <button onClick={handleAddAddress} className="btn-primary text-sm py-2">Save Address</button>
                  <button onClick={() => setAddingAddress(false)} className="btn-secondary text-sm py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Change Password */}
          <div className="card p-5 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Security</h3>
            {!changingPw ? (
              <button onClick={() => setChangingPw(true)} className="w-full btn-outline text-sm py-2.5 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-300">Change Password</button>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'currentPassword', placeholder: 'Current Password' },
                  { key: 'newPassword', placeholder: 'New Password' },
                  { key: 'confirmPassword', placeholder: 'Confirm Password' },
                ].map(({ key, placeholder }) => (
                  <input key={key} type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    className="input py-2.5 text-sm w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder={placeholder} />
                ))}
                <div className="flex gap-2">
                  <button onClick={handleChangePassword} disabled={savingPw} className="btn-primary text-sm py-2 flex-1">
                    {savingPw ? <Loader size="sm" /> : 'Update'}
                  </button>
                  <button onClick={() => setChangingPw(false)} className="btn-secondary text-sm py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="card p-5 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Account Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A' },
                { label: 'Wishlist Items', value: user?.wishlist?.length || 0 },
                { label: 'Addresses', value: user?.addresses?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
