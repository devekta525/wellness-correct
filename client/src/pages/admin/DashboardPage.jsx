import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Skeleton ───────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, change, changeLabel, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-3" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  const isPositive = change >= 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp size={14} className="text-emerald-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-400">{changeLabel}</span>
        </div>
      )}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusStyles = {
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  packed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  out_for_delivery: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-400',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[status] || statusStyles.pending}`}>
    {status?.replace(/_/g, ' ')}
  </span>
);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-base font-bold text-primary-600">
          ₹{payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboard();
        setData(res.data);
      } catch (err) {
        toast.error(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = [
    {
      label: 'Total Revenue',
      value: loading ? '-' : `₹${(data?.stats?.revenue?.total || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      change: data?.stats?.revenue?.changePercent,
      changeLabel: 'vs last week',
    },
    {
      label: 'Total Orders',
      value: loading ? '-' : (data?.stats?.orders?.total || 0).toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      change: data?.stats?.orders?.changePercent,
      changeLabel: 'vs last week',
    },
    {
      label: 'Total Products',
      value: loading ? '-' : (data?.stats?.products?.total || 0).toLocaleString(),
      icon: Package,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      label: 'Total Customers',
      value: loading ? '-' : (data?.stats?.users?.total || 0).toLocaleString(),
      icon: Users,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      change: data?.stats?.users?.changePercent,
      changeLabel: 'vs last week',
    },
  ];

  // Build chart data from salesLast7Days
  const chartData = loading
    ? []
    : (data?.salesLast7Days || []).map(d => ({ day: d._id?.slice(5), revenue: d.revenue || 0 }));

  const recentOrders = (data?.recentOrders || []).filter(
    (o) => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled'
  );
  const topProducts = data?.topProducts || [];
  const lowStockProducts = data?.lowStockProducts || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <Link
          to="/admin/analytics"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View Analytics <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days sales performance</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium">
              7 Days
            </span>
          </div>
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Top Products</h3>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, idx) => (
                <div key={product._id} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                    {idx + 1}
                  </div>
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.title}</p>
                    <p className="text-xs text-gray-400">{product.totalSales || 0} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{product.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="table-responsive">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No recent orders</p>
            ) : (
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/40 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Order</th>
                    <th className="text-left px-5 py-3">Customer</th>
                    <th className="text-left px-5 py-3">Total</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentOrders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-mono text-primary-600 dark:text-primary-400">
                          #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{order.total?.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h3>
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              {lowStockProducts.length}
            </span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">All products are well stocked</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30"
                >
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-amber-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.title}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {product.stock} left in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && lowStockProducts.length > 0 && (
            <Link
              to="/admin/products"
              className="mt-3 flex items-center justify-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Manage inventory <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
