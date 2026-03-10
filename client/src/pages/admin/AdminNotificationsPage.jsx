import { useState, useEffect } from 'react';
import { Bell, Send, Mail, Smartphone, MessageCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import Toggle from '../../components/common/Toggle';
import toast from 'react-hot-toast';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', target: 'all', channels: { email: true, push: true, sms: false } });

  useEffect(() => {
    adminAPI.getNotifications().then(res => setNotifications(res.data.notifications)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!form.title || !form.message) { toast.error('Title and message are required'); return; }
    setSending(true);
    try {
      await adminAPI.createNotification(form);
      toast.success('Notification sent!');
      setForm({ title: '', message: '', target: 'all', channels: { email: true, push: true, sms: false } });
      const res = await adminAPI.getNotifications();
      setNotifications(res.data.notifications);
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  const ChannelToggle = ({ checked, onChange, icon: Icon, label }) => (
    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <Icon size={16} className="text-gray-600" />
      <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
      <Toggle checked={checked} onChange={onChange} aria-label={label} />
    </label>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bell className="text-primary-600" size={26} />Notifications</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Send size={18} className="text-primary-600" />Send Notification</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Notification title" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Message *</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} className="input resize-none" placeholder="Write your message..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Target Audience</label>
              <div className="flex gap-2">
                {['all', 'customer', 'affiliate'].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, target: t }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${form.target === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Send Via</label>
              <div className="space-y-2">
                <ChannelToggle checked={form.channels.email} onChange={() => setForm(f => ({ ...f, channels: { ...f.channels, email: !f.channels.email } }))} icon={Mail} label="Email" />
                <ChannelToggle checked={form.channels.push} onChange={() => setForm(f => ({ ...f, channels: { ...f.channels, push: !f.channels.push } }))} icon={Smartphone} label="Push Notification" />
                <ChannelToggle checked={form.channels.sms} onChange={() => setForm(f => ({ ...f, channels: { ...f.channels, sms: !f.channels.sms } }))} icon={MessageCircle} label="SMS" />
              </div>
            </div>
            <button onClick={handleSend} disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
              {sending ? <Loader size="sm" /> : <Send size={16} />}Send Notification
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Sent Notifications</h2>
          {loading ? <Loader /> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No notifications sent yet</p> :
                notifications.map(n => (
                  <div key={n._id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                      <span className={`badge text-xs ${n.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{n.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">Target: {n.target}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
