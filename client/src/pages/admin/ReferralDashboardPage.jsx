import { useState, useEffect } from 'react';
import { Link2, Plus, BarChart3, TrendingUp, MousePointer, ShoppingBag, DollarSign, Copy, Trash2, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { referralAPI, productAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-green-600 mt-1">{sub}</p>}
  </div>
);

const OWNER_TYPES = ['affiliate', 'influencer', 'store', 'campaign', 'admin', 'custom'];
// eslint-disable-next-line no-unused-vars
const COMMISSION_TYPES = ['percentage', 'fixed'];

const ReferralDashboardPage = () => {
  const [codes, setCodes] = useState([]);
  const [analytics, setAnalytics] = useState({ clicksOverTime: [], conversionsOverTime: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [editCode, setEditCode] = useState(null);
  const [deleteCode, setDeleteCode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [codeForm, setCodeForm] = useState({
    productId: '', ownerType: 'campaign', ownerName: '', customCode: '',
    expiresAt: '', usageLimit: '', commissionRate: 0, commissionType: 'percentage', notes: '',
  });

  useEffect(() => {
    fetchData();
    productAPI.adminGetAll({ limit: 100 }).then(res => setProducts(res.data.products)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codesRes, analyticsRes] = await Promise.all([
        referralAPI.getCodes({ limit: 50 }),
        referralAPI.getAnalytics(dateRange),
      ]);
      setCodes(codesRes.data.codes);
      setAnalytics({
        clicksOverTime: analyticsRes.data.clicksOverTime || [],
        conversionsOverTime: analyticsRes.data.conversionsOverTime || [],
        totals: analyticsRes.data.totals || {},
        codes: analyticsRes.data.codes || [],
      });
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!codeForm.productId) { toast.error('Select a product'); return; }
    setSaving(true);
    try {
      await referralAPI.createCode(codeForm);
      toast.success('Referral code created!');
      setShowCreateModal(false);
      setCodeForm({ productId: '', ownerType: 'campaign', ownerName: '', customCode: '', expiresAt: '', usageLimit: '', commissionRate: 0, commissionType: 'percentage', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await referralAPI.deleteCode(deleteCode._id);
      toast.success('Code deleted');
      setDeleteCode(null);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copyLink = (code, productSlug) => {
    const link = `${window.location.origin}/product/${productSlug}?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied!');
  };

  const handleExport = async () => {
    try {
      const res = await referralAPI.exportCSV(dateRange);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `referral-analytics-${Date.now()}.csv`;
      a.click();
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  const totals = analytics.totals || {};

  // Merge click and conversion data for chart
  const chartData = analytics.clicksOverTime.map(c => ({
    date: c._id,
    clicks: c.count,
    conversions: analytics.conversionsOverTime.find(cv => cv._id === c._id)?.count || 0,
    revenue: analytics.conversionsOverTime.find(cv => cv._id === c._id)?.revenue || 0,
  }));

  const CodeFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Product *</label>
        <select value={codeForm.productId} onChange={e => setCodeForm(f => ({ ...f, productId: e.target.value }))} className="input bg-white text-sm">
          <option value="">Select Product</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Owner Type</label>
          <select value={codeForm.ownerType} onChange={e => setCodeForm(f => ({ ...f, ownerType: e.target.value }))} className="input bg-white text-sm capitalize">
            {OWNER_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Owner Name</label>
          <input value={codeForm.ownerName} onChange={e => setCodeForm(f => ({ ...f, ownerName: e.target.value }))} className="input text-sm" placeholder="e.g. John Influencer" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Custom Code (optional)</label>
          <input value={codeForm.customCode} onChange={e => setCodeForm(f => ({ ...f, customCode: e.target.value.toUpperCase() }))} className="input text-sm font-mono" placeholder="Auto-generate if blank" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Usage Limit</label>
          <input type="number" value={codeForm.usageLimit} onChange={e => setCodeForm(f => ({ ...f, usageLimit: e.target.value }))} className="input text-sm" placeholder="Unlimited" min="0" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Commission Rate</label>
          <input type="number" value={codeForm.commissionRate} onChange={e => setCodeForm(f => ({ ...f, commissionRate: e.target.value }))} className="input text-sm" min="0" max="100" step="0.1" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Commission Type</label>
          <select value={codeForm.commissionType} onChange={e => setCodeForm(f => ({ ...f, commissionType: e.target.value }))} className="input bg-white text-sm">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date</label>
        <input type="datetime-local" value={codeForm.expiresAt} onChange={e => setCodeForm(f => ({ ...f, expiresAt: e.target.value }))} className="input text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
        <input value={codeForm.notes} onChange={e => setCodeForm(f => ({ ...f, notes: e.target.value }))} className="input text-sm" placeholder="Internal notes" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Link2 className="text-primary-600" size={26} />Referral Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Track performance of all referral codes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm py-2.5 flex items-center gap-2"><Download size={14} />Export CSV</button>
          <button onClick={fetchData} className="btn-secondary text-sm py-2.5 flex items-center gap-2"><RefreshCw size={14} /></button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm py-2.5 flex items-center gap-2"><Plus size={16} />New Code</button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex gap-3 items-center">
        <input type="date" value={dateRange.startDate} onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))} className="input py-2 text-sm w-44" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={dateRange.endDate} onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))} className="input py-2 text-sm w-44" />
        {(dateRange.startDate || dateRange.endDate) && (
          <button onClick={() => setDateRange({ startDate: '', endDate: '' })} className="text-sm text-red-500 hover:text-red-600">Clear</button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MousePointer} label="Total Clicks" value={totals.totalClicks || 0} color="bg-blue-500" />
        <StatCard icon={ShoppingBag} label="Conversions" value={totals.totalConversions || 0} color="bg-green-500" />
        <StatCard icon={DollarSign} label="Revenue" value={`₹${(totals.totalRevenue || 0).toFixed(0)}`} color="bg-purple-500" />
        <StatCard icon={TrendingUp} label="Conv. Rate" color="bg-orange-500"
          value={totals.totalClicks ? `${((totals.totalConversions / totals.totalClicks) * 100).toFixed(1)}%` : '0%'} />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={18} />Clicks & Conversions Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="clicks" stroke="#6366f1" fill="#ede9fe" name="Clicks" />
              <Area type="monotone" dataKey="conversions" stroke="#10b981" fill="#d1fae5" name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenue by Code Chart */}
      {codes.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Revenue by Code (Top 10)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={codes.slice(0, 10).map(c => ({ code: c.code, revenue: c.stats.revenue, clicks: c.stats.clicks }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="code" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val, name) => [name === 'revenue' ? `₹${val.toFixed(2)}` : val, name]} />
              <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" fill="#e0e7ff" name="Clicks" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Codes Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">All Referral Codes</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader size="md" /></div>
        ) : (
          <div className="table-responsive">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Code', 'Product', 'Owner', 'Clicks', 'Conversions', 'Revenue', 'Conv. Rate', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {codes.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400">No referral codes yet. Create your first one!</td></tr>
                ) : codes.map(code => (
                  <tr key={code._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">{code.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {code.product?.thumbnail && <img src={code.product.thumbnail} alt="" className="w-7 h-7 rounded-lg object-cover" />}
                        <span className="text-gray-700 max-w-32 truncate">{code.product?.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{code.ownerName || '—'}</td>
                    <td className="px-4 py-3 font-semibold">{code.stats.clicks}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{code.stats.conversions}</td>
                    <td className="px-4 py-3 font-semibold">₹{code.stats.revenue.toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${code.stats.conversionRate >= 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {code.stats.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {code.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => copyLink(code.code, code.product?.slug)} title="Copy Link"
                          className="p-1.5 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors">
                          <Copy size={14} />
                        </button>
                        <a href={`/product/${code.product?.slug}?ref=${code.code}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                          <ExternalLink size={14} />
                        </a>
                        <button onClick={() => setDeleteCode(code)} title="Delete"
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Referral Code" size="lg">
        <CodeFormFields />
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <Loader size="sm" /> : <Plus size={16} />}Create Code
          </button>
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog isOpen={!!deleteCode} onClose={() => setDeleteCode(null)} onConfirm={handleDelete}
        title="Delete Referral Code" message={`Delete code "${deleteCode?.code}"? This cannot be undone.`}
        confirmLabel="Delete" isDanger />
    </div>
  );
};

export default ReferralDashboardPage;
