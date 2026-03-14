import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, Moon, Globe, Shield, LogOut, ChevronRight, Trash2 } from 'lucide-react';
import Toggle from '../../components/common/Toggle';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { updateProfile, logout, deleteAccount } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { darkMode } = useSelector(state => state.ui);
  const [notifPrefs, setNotifPrefs] = useState(user?.notificationPrefs || { email: true, push: true, sms: false });
  const [language, setLanguage] = useState(user?.language || 'en');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initialNotifPrefs = user?.notificationPrefs || { email: true, push: true, sms: false };
  const notifPrefsChanged = notifPrefs.email !== initialNotifPrefs.email || notifPrefs.push !== initialNotifPrefs.push || notifPrefs.sms !== initialNotifPrefs.sms;
  const languageChanged = language !== (user?.language || 'en');

  const saveNotifPrefs = async () => {
    if (!notifPrefsChanged) {
      toast('No changes to save', { icon: 'ℹ️' });
      return;
    }
    await dispatch(updateProfile({ notificationPrefs: notifPrefs }));
    toast.success('Notification preferences saved!');
  };

  const saveLanguage = () => {
    if (!languageChanged) {
      toast('No changes to save', { icon: 'ℹ️' });
      return;
    }
    dispatch(updateProfile({ language }));
    toast.success('Language updated!');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const ToggleRow = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} aria-label={label} />
    </div>
  );

  return (
    <div className="page-container py-8 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* Notifications */}
      <div className="card p-6 mb-4 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-primary-600 dark:text-primary-400" />Notifications</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <ToggleRow checked={notifPrefs.email} onChange={() => setNotifPrefs(p => ({ ...p, email: !p.email }))} label="Email Notifications" desc="Receive order updates and offers via email" />
          <ToggleRow checked={notifPrefs.push} onChange={() => setNotifPrefs(p => ({ ...p, push: !p.push }))} label="Push Notifications" desc="Real-time alerts on your device" />
          <ToggleRow checked={notifPrefs.sms} onChange={() => setNotifPrefs(p => ({ ...p, sms: !p.sms }))} label="SMS Notifications" desc="Order updates via text message" />
        </div>
        <button onClick={saveNotifPrefs} className="btn-primary text-sm py-2.5 mt-4">Save Preferences</button>
      </div>

      {/* Appearance */}
      <div className="card p-6 mb-4 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Moon size={18} className="text-primary-600 dark:text-primary-400" />Appearance</h3>
        <ToggleRow checked={darkMode} onChange={() => dispatch(toggleDarkMode())} label="Dark Mode" desc="Switch to dark theme for better night viewing" />
      </div>

      {/* Language */}
      <div className="card p-6 mb-4 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Globe size={18} className="text-primary-600 dark:text-primary-400" />Language</h3>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="input py-2.5 text-sm max-w-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
        </select>
        <button onClick={saveLanguage} className="btn-primary text-sm py-2.5 mt-4 ml-3">Save</button>
      </div>

      {/* Privacy */}
      <div className="card p-6 mb-4 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Shield size={18} className="text-primary-600 dark:text-primary-400" />Privacy & Security</h3>
        <div className="space-y-2">
          {[
            { label: 'Privacy Policy', to: '/privacy-policy' },
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Data Policy', to: '/privacy-policy#data' },
            { label: 'Cookies Policy', to: '/privacy-policy#cookies' },
          ].map(({ label, to }) => (
            <Link key={label} to={to} className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-3 transition-colors group">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="card p-6 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Account</h3>
        <div className="space-y-2">
          <button onClick={handleLogout} className="flex items-center justify-between w-full py-3 px-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group text-left">
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-red-500 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Logout</span>
            </div>
            <ChevronRight size={16} className="text-red-300 dark:text-red-500" />
          </button>
          <button type="button" onClick={() => setDeleteConfirmOpen(true)} className="flex items-center justify-between w-full py-3 px-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group text-left">
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-red-500 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</span>
            </div>
            <ChevronRight size={16} className="text-red-300 dark:text-red-500" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => !deleting && setDeleteConfirmOpen(false)}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be removed."
        confirmLabel="Delete My Account"
        isLoading={deleting}
        isDanger
        onConfirm={async () => {
          setDeleting(true);
          try {
            await dispatch(deleteAccount()).unwrap();
            navigate('/');
            toast.success('Account deleted');
          } catch (e) {
            toast.error(e?.message || 'Failed to delete account');
          } finally {
            setDeleting(false);
            setDeleteConfirmOpen(false);
          }
        }}
      />
    </div>
  );
};

export default SettingsPage;
