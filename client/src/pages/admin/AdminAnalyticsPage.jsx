import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const COLORS = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4'];

const StatCard = ({ icon: Icon, label, value, color, change }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
  </div>
);

const emptyAnalytics = { salesData: [], categoryData: [], paymentMethodData: [] };

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState('day');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [dateRange, groupBy]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getSalesAnalytics({ ...dateRange, groupBy });
      const payload = res.data?.salesData !== undefined ? res.data : { ...emptyAnalytics, ...res.data };
      setData({
        salesData: payload.salesData || [],
        categoryData: payload.categoryData || [],
        paymentMethodData: payload.paymentMethodData || [],
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load analytics');
      setData(emptyAnalytics);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader size="lg" /></div>;

  const totalRevenue = (data?.salesData || []).reduce((s, d) => s + (Number(d.revenue) || 0), 0);
  const totalOrders = (data?.salesData || []).reduce((s, d) => s + (Number(d.orders) || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
          {error} — Try changing the date range or refresh.
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-primary-600" size={26} />Sales Analytics
        </h1>
        <div className="flex gap-2">
          <input type="date" value={dateRange.startDate} onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))} className="input py-2 text-sm w-40" />
          <span className="text-gray-400 flex items-center text-sm">to</span>
          <input type="date" value={dateRange.endDate} onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))} className="input py-2 text-sm w-40" />
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="input py-2 text-sm w-28 bg-white">
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} color="bg-primary-600" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders} color="bg-green-500" />
        <StatCard icon={TrendingUp} label="Avg. Order Value" value={`₹${avgOrderValue.toFixed(0)}`} color="bg-orange-500" />
        <StatCard icon={BarChart3} label="Data Points" value={data?.salesData?.length || 0} color="bg-purple-500" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={18} />Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data?.salesData || []}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
            <Tooltip formatter={(val) => [`₹${val.toFixed(2)}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Orders Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.salesData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#10b981" name="Orders" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><PieIcon size={18} />Revenue by Category</h2>
          {data?.categoryData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.categoryData} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}>
                  {data.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={val => [`₹${val.toFixed(2)}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">No data for selected period (metrics are for paid orders only)</div>}
        </div>
      </div>

      {/* Payment Methods */}
      {data?.paymentMethodData?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Orders by Payment Method</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.paymentMethodData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="_id" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#6366f1" name="Orders" radius={[0, 4, 4, 0]} />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
