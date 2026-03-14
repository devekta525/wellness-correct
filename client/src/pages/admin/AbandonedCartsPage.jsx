import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, User, Package, IndianRupee,
  Clock, ChevronLeft, ChevronRight, RefreshCw,
  SlidersHorizontal, TrendingDown,
} from 'lucide-react';
import { abandonedCartAPI } from '../../services/api';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const timeAgo = (date) => {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const SORT_OPTIONS = [
  { value: 'value',  label: 'Highest Value' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'items',  label: 'Most Items' },
];

export default function AbandonedCartsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [sortBy, setSortBy]   = useState('value');
  const [minValue, setMinValue] = useState(0);
  const [showAll, setShowAll] = useState(true); // show all saved carts by default so admin sees data
  const [expanded, setExpanded] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await abandonedCartAPI.getAll({ page, limit: 20, sortBy, minValue, showAll: showAll ? '1' : undefined });
      setData(res.data);
    } catch (_) {}
    setLoading(false);
  }, [page, sortBy, minValue, showAll]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Abandoned Carts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Users who added products but didn't complete checkout</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => { setShowAll(true); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${showAll ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              All saved carts
            </button>
            <button
              type="button"
              onClick={() => { setShowAll(false); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${!showAll ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Abandoned only (1h+)
            </button>
          </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ShoppingCart, label: showAll ? 'Saved Carts' : 'Abandoned Carts', value: stats.totalAbandoned ?? '—', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
          { icon: IndianRupee, label: 'Total Lost Value', value: fmt(stats.totalValue), color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { icon: TrendingDown, label: 'Avg Cart Value', value: fmt(stats.avgValue), color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
          { icon: Package, label: 'Abandoned Items', value: stats.totalItems ?? '—', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Sort by</label>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setSortBy(o.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sortBy === o.value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            <SlidersHorizontal size={10} className="inline mr-1" />Min Value (₹)
          </label>
          <input
            type="number"
            value={minValue}
            onChange={(e) => { setMinValue(Number(e.target.value)); setPage(1); }}
            className="w-28 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            min={0}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={24} className="animate-spin mr-3" /> Loading…
          </div>
        ) : !data?.carts?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingCart size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">No abandoned carts found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Items</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Value</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.carts.map((cart) => (
                  <>
                    <tr
                      key={cart._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === cart._id ? null : cart._id)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">
                              {cart.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{cart.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{cart.user?.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {cart.items.slice(0, 3).map((item, i) => (
                              item.thumbnail ? (
                                <img
                                  key={i}
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-8 h-8 rounded-lg object-cover border-2 border-white dark:border-gray-900"
                                />
                              ) : (
                                <div key={i} className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                                  <Package size={12} className="text-gray-400" />
                                </div>
                              )
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900 dark:text-white">{fmt(cart.totalValue)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock size={13} />
                          <span className="text-xs">{timeAgo(cart.lastActivity)}</span>
                        </div>
                      </td>
                    </tr>
                    {expanded === cart._id && (
                      <tr key={`${cart._id}-exp`} className="bg-blue-50/50 dark:bg-blue-950/10">
                        <td colSpan={4} className="px-5 py-4">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Cart Items</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {cart.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                                {item.thumbnail ? (
                                  <img src={item.thumbnail} alt={item.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    <Package size={16} className="text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title || 'Product'}</p>
                                  <p className="text-xs text-gray-400">{fmt(item.price)} × {item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{fmt(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                            <span><User size={11} className="inline mr-1" />Joined {cart.user?.createdAt ? new Date(cart.user.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                            {cart.user?.phone && <span>📞 {cart.user.phone}</span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 text-xs font-bold">
                {page} / {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
