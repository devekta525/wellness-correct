import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Truck, ChevronDown, ChevronUp, CheckCircle2, XCircle,
  Loader2, Save, TestTube2, Eye, EyeOff, ToggleLeft, ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

// ── Small helpers ─────────────────────────────────────────────────────────────
const FieldInput = ({ field, value, onChange }) => {
  const [show, setShow] = useState(false);
  const isPassword = field.type === 'password';

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPassword && !show ? 'password' : 'text'}
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="input py-2 text-sm pr-10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Gateway Card ──────────────────────────────────────────────────────────────
const GatewayCard = ({ gateway, type, onSave, onTest }) => {
  const [expanded, setExpanded] = useState(false);
  const [enabled, setEnabled] = useState(gateway.enabled || false);
  const [mode, setMode] = useState(gateway.mode || 'test');
  const [config, setConfig] = useState(gateway.config || {});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [dirty, setDirty] = useState(false);

  const handleFieldChange = (key, val) => {
    setConfig(c => ({ ...c, [key]: val }));
    setDirty(true);
  };

  const handleToggleEnabled = () => {
    setEnabled(e => !e);
    setDirty(true);
  };

  const handleModeChange = (m) => {
    setMode(m);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(gateway.id, { enabled, mode, config });
      setDirty(false);
      toast.success(`${gateway.displayName} settings saved`);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Pass current form config and mode so test uses what user entered (even before Save)
      const result = await onTest(gateway.id, { config, mode });
      setTestResult({ ok: true, message: result.message });
    } catch (err) {
      setTestResult({ ok: false, message: err.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={`border-2 rounded-2xl transition-all ${enabled ? 'border-primary-400 dark:border-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
          {type === 'payment' ? <CreditCard size={20} /> : <Truck size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{gateway.displayName}</h3>
            {enabled && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            )}
            {enabled && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mode === 'live' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {mode === 'live' ? 'Live' : 'Test'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{gateway.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Enable/disable toggle */}
          <button onClick={handleToggleEnabled} className="focus:outline-none" title={enabled ? 'Disable' : 'Enable'}>
            {enabled
              ? <ToggleRight size={28} className="text-primary-600" />
              : <ToggleLeft size={28} className="text-gray-400" />
            }
          </button>
          {/* Expand/collapse */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded config */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* Mode selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Mode</label>
            <div className="flex gap-2">
              {['test', 'live'].map(m => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${mode === m ? (m === 'live' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-blue-500 border-blue-500 text-white') : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'}`}
                >
                  {m === 'live' ? '🔴 Live' : '🔵 Test'}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          {gateway.fields?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gateway.fields.map(field => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={config[field.key]}
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          )}

          {/* Test result */}
          {testResult && (
            <div className={`flex items-start gap-2 text-sm rounded-xl px-3 py-2 ${testResult.ok ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
              {testResult.ok ? <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="flex-shrink-0 mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <p className="text-xs text-gray-500 dark:text-gray-400">Test uses the keys above — no need to save first.</p>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {testing ? <Loader2 size={15} className="animate-spin" /> : <TestTube2 size={15} />}
              Test Connection
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const GatewaySettingsPage = () => {
  const [tab, setTab] = useState('payment');
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [shippingProviders, setShippingProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pgRes, spRes] = await Promise.all([
        adminAPI.getPaymentGateways(),
        adminAPI.getShippingProviders(),
      ]);
      setPaymentGateways(pgRes.data.gateways || []);
      setShippingProviders(spRes.data.providers || []);
    } catch (err) {
      toast.error('Failed to load gateway settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePaymentGateway = async (id, data) => {
    await adminAPI.savePaymentGateway(id, data);
    setPaymentGateways(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const testPaymentGateway = async (id, body = {}) => {
    const res = await adminAPI.testPaymentGateway(id, body);
    return res.data;
  };

  const saveShippingProvider = async (id, data) => {
    await adminAPI.saveShippingProvider(id, data);
    setShippingProviders(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const testShippingProvider = async (id, body = {}) => {
    const res = await adminAPI.testShippingProvider(id, body);
    return res.data;
  };

  const TABS = [
    { id: 'payment', label: 'Payment Gateways', icon: CreditCard, count: paymentGateways.filter(g => g.enabled).length },
    { id: 'shipping', label: 'Shipping Providers', icon: Truck, count: shippingProviders.filter(p => p.enabled).length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gateway Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure payment gateways and shipping providers. Toggle them on/off without losing credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            <Icon size={16} />
            {label}
            {count > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {tab === 'payment' && (
            <>
              {paymentGateways.length === 0 ? (
                <p className="text-gray-500 text-sm">No payment gateways available.</p>
              ) : (
                paymentGateways.map(gw => (
                  <GatewayCard
                    key={gw.id}
                    gateway={gw}
                    type="payment"
                    onSave={savePaymentGateway}
                    onTest={testPaymentGateway}
                  />
                ))
              )}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> Enable Razorpay for the best experience in India — it supports Cards, UPI, NetBanking and Wallets in a single integration.
                Only one gateway needs to be active, but you can enable multiple for customer choice.
              </div>
            </>
          )}

          {tab === 'shipping' && (
            <>
              {shippingProviders.length === 0 ? (
                <p className="text-gray-500 text-sm">No shipping providers available.</p>
              ) : (
                shippingProviders.map(p => (
                  <GatewayCard
                    key={p.id}
                    gateway={p}
                    type="shipping"
                    onSave={saveShippingProvider}
                    onTest={testShippingProvider}
                  />
                ))
              )}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> Only one shipping provider is active at a time (first enabled one is used).
                Shiprocket is recommended as it aggregates multiple couriers and provides the best rates.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GatewaySettingsPage;
