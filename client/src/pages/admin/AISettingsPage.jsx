import { useState, useEffect } from 'react';
import { Bot, Key, CheckCircle, XCircle, Eye, EyeOff, Zap, ExternalLink, RefreshCw, Cpu } from 'lucide-react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)', desc: 'Best vision + text quality, latest model' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: 'High quality, faster than GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', desc: 'Fastest, most economical (no vision)' },
];

const AISettingsPage = () => {
  const [settings, setSettings] = useState({
    hasApiKey: false,
    maskedKey: '',
    model: 'gpt-4o',
    hasGeminiKey: false,
    maskedGeminiKey: '',
  });
  const [apiKey, setApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [model, setModel] = useState('gpt-4o');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.getSettings().then(res => {
      setSettings(res.data.settings);
      setModel(res.data.settings.model || 'gpt-4o');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!apiKey && !settings.hasApiKey && !geminiApiKey && !settings.hasGeminiKey) {
      toast.error('Please enter at least one API key (OpenAI or Gemini)');
      return;
    }
    setSaving(true);
    try {
      const res = await aiAPI.saveSettings({
        openaiApiKey: apiKey || undefined,
        model,
        geminiApiKey: geminiApiKey || undefined,
      });
      toast.success(res.data?.message || 'AI settings saved successfully!');
      if (res.data?.warning) toast(res.data.warning, { icon: '⚠️', duration: 6000 });
      setApiKey('');
      setGeminiApiKey('');
      const settingsRes = await aiAPI.getSettings();
      setSettings(settingsRes.data.settings);
      setTestResult(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await aiAPI.test();
      setTestResult({ success: true, message: 'Connection successful! OpenAI API is working.' });
      toast.success('OpenAI connection successful!');
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
      toast.error('Connection failed: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="text-primary-600" size={28} />AI Configuration
        </h1>
        <p className="text-gray-500 mt-1">Configure OpenAI integration for AI-powered product generation</p>
      </div>

      {/* Current Status */}
      <div className={`rounded-2xl p-5 border-2 flex flex-wrap items-center gap-4 ${settings.hasApiKey || settings.hasGeminiKey ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}`}>
        {settings.hasApiKey || settings.hasGeminiKey ? (
          <CheckCircle size={32} className="text-green-500 flex-shrink-0" />
        ) : (
          <XCircle size={32} className="text-yellow-500 flex-shrink-0" />
        )}
        <div>
          <p className={`font-bold ${settings.hasApiKey || settings.hasGeminiKey ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
            {settings.hasApiKey || settings.hasGeminiKey ? 'API Keys Configured' : 'No API Key Configured'}
          </p>
          <p className={`text-sm ${settings.hasApiKey || settings.hasGeminiKey ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
            {settings.hasApiKey && `OpenAI: ${settings.maskedKey} • ${settings.model}. `}
            {settings.hasGeminiKey && `Gemini: ${settings.maskedGeminiKey} (Studio). `}
            {!settings.hasApiKey && !settings.hasGeminiKey && 'Add OpenAI and/or Gemini API keys below.'}
          </p>
        </div>
        {settings.hasApiKey && (
          <button onClick={handleTest} disabled={testing}
            className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            {testing ? <Loader size="sm" /> : <RefreshCw size={14} />}Test Connection
          </button>
        )}
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {testResult.success ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <p className="text-sm font-medium">{testResult.message}</p>
        </div>
      )}

      {/* API Key Configuration */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2"><Key size={18} className="text-primary-600" />OpenAI API Key</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Your API key is stored securely and used only for AI product generation.{' '}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline inline-flex items-center gap-1">
            Get your key <ExternalLink size={12} />
          </a>
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              API Key {settings.hasApiKey ? '(leave blank to keep current)' : '*'}
            </label>
            <div className="relative">
              <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="input pl-9 pr-12"
                placeholder={settings.hasApiKey ? settings.maskedKey : 'sk-...'}
              />
              <button onClick={() => setShowKey(!showKey)} type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2"><Cpu size={14} />AI Model</label>
            <div className="space-y-2">
              {AI_MODELS.map(m => (
                <label key={m.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${model === m.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <input type="radio" name="model" value={m.value} checked={model === m.value} onChange={() => setModel(m.value)}
                    className="mt-0.5 text-primary-600" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{m.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                  </div>
                  {m.value === 'gpt-4o' && <span className="ml-auto badge bg-primary-100 text-primary-700 text-xs">Best</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Gemini API Key (for Studio / product mockups) */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Key size={18} className="text-blue-600" />
              Gemini API Key (Studio mockups)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Used for the Studio page to generate product mockups with Gemini (Nano Banana).{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline inline-flex items-center gap-1">
                Get your key <ExternalLink size={12} />
              </a>
            </p>
            <div className="relative">
              <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="input pl-9 pr-12"
                placeholder={settings.hasGeminiKey ? settings.maskedGeminiKey : 'AIza...'}
              />
              <button
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {settings.hasGeminiKey && (
              <p className="text-xs text-gray-500 mt-1.5">Leave blank to keep current key</p>
            )}
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader size="sm" /> : <Key size={16} />}Save API Settings
          </button>
        </div>
      </div>

      {/* How to use */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-500" />How AI Product Generation Works</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Upload Product Image', desc: 'Go to Products → Add New Product → Upload & AI Analyze tab' },
            { step: '2', title: 'AI Analyzes Image', desc: 'GPT-4o Vision detects product type, colors, brand, material, and category' },
            { step: '3', title: 'Content Generated', desc: 'AI writes SEO-optimized title, description, tags, meta data, and keywords' },
            { step: '4', title: 'Review & Publish', desc: 'Review all AI-generated content, make edits if needed, then publish' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">{step}</div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">💡 Pro Tip: Use GPT-4o for best results. It has vision capabilities and generates highest quality product content.</p>
        </div>
      </div>

      {/* Pricing note */}
      <div className="text-xs text-gray-400 text-center pb-4">
        AI requests use your OpenAI API credits. GPT-4o Vision costs ~$0.01-0.03 per product analysis.{' '}
        <a href="https://openai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">View pricing</a>
      </div>
    </div>
  );
};

export default AISettingsPage;
