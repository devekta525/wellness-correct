import { useState, useEffect } from 'react';
import { Settings, Save, Globe, Truck, Percent, Link2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    site_name: 'Wellness_fuel', site_tagline: 'AI-Powered Shopping',
    currency: 'INR', currency_symbol: '₹',
    free_shipping_threshold: 999, standard_shipping_cost: 49,
    tax_rate: 18, attribution_model: 'last_click',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getSettings().then(res => {
      setSettings(prev => ({ ...prev, ...res.data.settings }));
    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader size="lg" /></div>;

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Icon size={18} className="text-primary-600" />{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, settingKey, type = 'text', options }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      {options ? (
        <select value={settings[settingKey]} onChange={e => setSettings(s => ({ ...s, [settingKey]: e.target.value }))} className="input bg-white text-sm">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={settings[settingKey]} onChange={e => setSettings(s => ({ ...s, [settingKey]: type === 'number' ? parseFloat(e.target.value) : e.target.value }))} className="input text-sm" />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Settings className="text-primary-600" size={26} />Platform Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader size="sm" /> : <Save size={16} />}Save All Settings
        </button>
      </div>

      <Section icon={Globe} title="General">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Site Name" settingKey="site_name" />
          <Field label="Tagline" settingKey="site_tagline" />
          <Field label="Currency Code" settingKey="currency" />
          <Field label="Currency Symbol" settingKey="currency_symbol" />
        </div>
      </Section>

      <Section icon={Truck} title="Shipping">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Free Shipping Threshold (₹)" settingKey="free_shipping_threshold" type="number" />
          <Field label="Standard Shipping Cost (₹)" settingKey="standard_shipping_cost" type="number" />
        </div>
        <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
          Orders above ₹{settings.free_shipping_threshold} will get free shipping. Others pay ₹{settings.standard_shipping_cost}.
        </div>
      </Section>

      <Section icon={Percent} title="Tax">
        <Field label="GST / Tax Rate (%)" settingKey="tax_rate" type="number" />
        <div className="p-3 bg-yellow-50 rounded-xl text-xs text-yellow-700">
          Tax is applied as {settings.tax_rate}% on the order subtotal (after discounts).
        </div>
      </Section>

      <Section icon={Link2} title="Referral Attribution">
        <Field label="Attribution Model" settingKey="attribution_model" options={[
          { value: 'last_click', label: 'Last Click (Recommended) — Credit the last referral link before purchase' },
          { value: 'first_click', label: 'First Click — Credit the first referral link that brought the customer' },
        ]} />
        <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-700">
          <strong>Last Click:</strong> The most recent referral code gets credit. <strong>First Click:</strong> The original referral code gets credit.
        </div>
      </Section>
    </div>
  );
};

export default AdminSettingsPage;
