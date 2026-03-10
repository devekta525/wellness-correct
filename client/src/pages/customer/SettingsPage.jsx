import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Moon, Globe, Shield, LogOut, ChevronRight, Trash2 } from 'lucide-react';
import Toggle from '../../components/common/Toggle';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import { updateProfile, logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { darkMode } = useSelector(state => state.ui);
  const [notifPrefs, setNotifPrefs] = useState(user?.notificationPrefs || { email: true, push: true, sms: false });
  const [language, setLanguage] = useState(user?.language || 'en');

  const saveNotifPrefs = async () => {
    await dispatch(updateProfile({ notificationPrefs: notifPrefs }));
    toast.success('Notification preferences saved!');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const ToggleRow = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-800 text-sm">{label}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} aria-label={label} />
    </div>
  );

  return (
    <div className="page-container py-8 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Notifications */}
      <div className="card p-6 mb-4">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell size={18} className="text-primary-600" />Notifications</h3>
        <div className="divide-y divide-gray-100">
          <ToggleRow checked={notifPrefs.email} onChange={() => setNotifPrefs(p => ({ ...p, email: !p.email }))} label="Email Notifications" desc="Receive order updates and offers via email" />
          <ToggleRow checked={notifPrefs.push} onChange={() => setNotifPrefs(p => ({ ...p, push: !p.push }))} label="Push Notifications" desc="Real-time alerts on your device" />
          <ToggleRow checked={notifPrefs.sms} onChange={() => setNotifPrefs(p => ({ ...p, sms: !p.sms }))} label="SMS Notifications" desc="Order updates via text message" />
        </div>
        <button onClick={saveNotifPrefs} className="btn-primary text-sm py-2.5 mt-4">Save Preferences</button>
      </div>

      {/* Appearance */}
      <div className="card p-6 mb-4">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Moon size={18} className="text-primary-600" />Appearance</h3>
        <ToggleRow checked={darkMode} onChange={() => dispatch(toggleDarkMode())} label="Dark Mode" desc="Switch to dark theme for better night viewing" />
      </div>

      {/* Language */}
      <div className="card p-6 mb-4">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Globe size={18} className="text-primary-600" />Language</h3>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="input py-2.5 text-sm max-w-xs">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
        </select>
        <button onClick={() => { dispatch(updateProfile({ language })); toast.success('Language updated!'); }}
          className="btn-primary text-sm py-2.5 mt-4 ml-3">Save</button>
      </div>

      {/* Privacy */}
      <div className="card p-6 mb-4">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield size={18} className="text-primary-600" />Privacy & Security</h3>
        <div className="space-y-2">
          {[
            { label: 'Privacy Policy', link: '/privacy' },
            { label: 'Terms of Service', link: '/terms' },
            { label: 'Data & Cookies', link: '/cookies' },
          ].map(({ label, link }) => (
            <a key={label} href={link} className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-xl px-3 transition-colors group">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
            </a>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Account</h3>
        <div className="space-y-2">
          <button onClick={handleLogout} className="flex items-center justify-between w-full py-3 px-3 hover:bg-red-50 rounded-xl transition-colors group text-left">
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-red-500" />
              <span className="text-sm font-medium text-red-600">Logout</span>
            </div>
            <ChevronRight size={16} className="text-red-300" />
          </button>
          <button className="flex items-center justify-between w-full py-3 px-3 hover:bg-red-50 rounded-xl transition-colors group text-left opacity-60">
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-red-500" />
              <span className="text-sm font-medium text-red-600">Delete Account</span>
            </div>
            <ChevronRight size={16} className="text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
