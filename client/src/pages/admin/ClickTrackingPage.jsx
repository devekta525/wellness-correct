import { useState, useEffect, useCallback } from 'react';
import {
  MousePointer2, Monitor, Smartphone, Tablet,
  Globe, Tag, Users, BarChart2, Clock,
  ChevronLeft, ChevronRight, RefreshCw, ArrowLeft,
} from 'lucide-react';
import { clickTrackingAPI } from '../../services/api';

const DAYS_OPTIONS = [1, 7, 14, 30];
const CATEGORIES   = ['', 'navigation', 'product', 'button', 'link', 'search', 'cart', 'other'];

const DeviceIcon = ({ device }) => {
  if (device === 'mobile')  return <Smartphone size={14} className="text-blue-500" />;
  if (device === 'tablet')  return <Tablet size={14} className="text-purple-500" />;
  if (device === 'desktop') return <Monitor size={14} className="text-green-500" />;
  return <Globe size={14} className="text-gray-400" />;
};

const Bar = ({ value, max, color = 'bg-primary-500' }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
    <span className="text-xs text-gray-500 w-8 text-right">{value}</span>
  </div>
);

export default function ClickTrackingPage() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [days, setDays]           = useState(7);
  const [category, setCategory]   = useState('');
  const [page, setPage]           = useState(1);
  const [drillUser, setDrillUser] = useState(null); // { _id, name, email }
  const [userData, setUserData]   = useState(null);
  const [userPage, setUserPage]   = useState(1);
  const [userLoading, setUserLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { days, page, limit: 30 };
      if (category) params.category = category;
      const res = await clickTrackingAPI.getAnalytics(params);
      setData(res.data);
    } catch (_) {}
    setLoading(false);
  }, [days, category, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchUserData = useCallback(async () => {
    if (!drillUser) return;
    setUserLoading(true);
    try {
      const res = await clickTrackingAPI.getUserHistory(drillUser._id, { days: 30, page: userPage });
      setUserData(res.data);
    } catch (_) {}
    setUserLoading(false);
  }, [drillUser, userPage]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  // ── User drill-down view ──────────────────────────────────────────────
  if (drillUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setDrillUser(null); setUserData(null); setUserPage(1); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{drillUser.name}'s Click History</h2>
            <p className="text-sm text-gray-500">{drillUser.email} — Last 30 days</p>
          </div>
        </div>

        {userLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={22} className="animate-spin mr-3" /> Loading…
          </div>
        ) : userData && (
          <>
            {/* Page summary */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Top Pages Visited</h3>
              <div className="space-y-3">
                {userData.pageSummary?.length ? userData.pageSummary.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p._id}</p>
                      <p className="text-[10px] text-gray-400">{p.count} clicks · last {new Date(p.last).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Bar value={p.count} max={userData.pageSummary[0]?.count} />
                  </div>
                )) : <p className="text-sm text-gray-400">No data</p>}
              </div>
            </div>

            {/* Event list */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">All Events</h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {userData.events?.map((ev) => (
                  <div key={ev._id} className="flex items-start gap-4 px-5 py-3">
                    <DeviceIcon device={ev.device} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{ev.path}</p>
                      {ev.elementText && <p className="text-xs text-gray-400 truncate">"{ev.elementText}"</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-500 uppercase">{ev.category}</span>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(ev.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
              {userData.pagination?.pages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"><ChevronLeft size={14} /></button>
                  <span className="text-xs text-gray-500">{userPage} / {userData.pagination.pages}</span>
                  <button onClick={() => setUserPage((p) => Math.min(userData.pagination.pages, p + 1))} disabled={userPage === userData.pagination.pages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Main analytics view ───────────────────────────────────────────────
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Click Tracking</h2>
          <p className="text-sm text-gray-500 mt-0.5">User click behaviour across the storefront</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Period</label>
          <div className="flex gap-2">
            {DAYS_OPTIONS.map((d) => (
              <button key={d} onClick={() => { setDays(d); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${days === d ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {d === 1 ? 'Today' : `${d}d`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <RefreshCw size={24} className="animate-spin mr-3" /> Loading…
        </div>
      ) : data && (
        <>
          {/* Total Clicks stat */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
              <MousePointer2 size={28} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Clicks</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalClicks?.toLocaleString('en-IN') ?? 0}</p>
              <p className="text-xs text-gray-400">in the last {days} day{days !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Three column breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top pages */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={15} className="text-primary-500" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Top Pages</h3>
              </div>
              <div className="space-y-3">
                {data.clicksByPage?.slice(0, 8).map((p, i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">{p._id}</p>
                    <Bar value={p.count} max={data.clicksByPage[0]?.count} />
                  </div>
                ))}
              </div>
            </div>

            {/* By Category */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={15} className="text-purple-500" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">By Category</h3>
              </div>
              <div className="space-y-3">
                {data.clicksByCategory?.map((c, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize mb-1">{c._id}</p>
                    <Bar value={c.count} max={data.clicksByCategory[0]?.count} color="bg-purple-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* By Device */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={15} className="text-green-500" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">By Device</h3>
              </div>
              <div className="space-y-4">
                {data.clicksByDevice?.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <DeviceIcon device={d._id} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize mb-1">{d._id}</p>
                      <Bar value={d.count} max={Math.max(...(data.clicksByDevice?.map(x => x.count) || [1]))} color="bg-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Trend */}
          {data.clicksOverTime?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={15} className="text-primary-500" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Daily Click Trend</h3>
              </div>
              <div className="flex items-end gap-1 h-24">
                {(() => {
                  const maxVal = Math.max(...data.clicksOverTime.map(d => d.count), 1);
                  return data.clicksOverTime.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className="w-full bg-primary-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${(d.count / maxVal) * 80}px`, minHeight: '2px' }}
                        title={`${d._id}: ${d.count} clicks`}
                      />
                      <p className="text-[9px] text-gray-400 hidden group-hover:block absolute -mt-5">{d.count}</p>
                    </div>
                  ));
                })()}
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-[10px] text-gray-400">{data.clicksOverTime[0]?._id}</p>
                <p className="text-[10px] text-gray-400">{data.clicksOverTime[data.clicksOverTime.length - 1]?._id}</p>
              </div>
            </div>
          )}

          {/* Top Elements + Top Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Clicked Elements */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <MousePointer2 size={15} className="text-orange-500" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Top Clicked Elements</h3>
              </div>
              <div className="space-y-2">
                {data.topElements?.map((el, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 truncate">"{el._id.text}"</p>
                      <p className="text-[10px] text-gray-400 uppercase">{el._id.type}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{el.count}×</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Users size={15} className="text-blue-500" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Top Users by Clicks</h3>
              </div>
              <div className="space-y-2">
                {data.topUsers?.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => setDrillUser({ _id: u._id, name: u.userInfo?.name || 'User', email: u.userInfo?.email || '' })}
                    className="w-full flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-1 transition-colors text-left"
                  >
                    <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">{u.userInfo?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{u.userInfo?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{u.userInfo?.email}</p>
                    </div>
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{u.count} clicks</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Recent Click Events</h3>
              </div>
            </div>
            <div className="table-responsive">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Path</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Element</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Device</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.recentEvents?.map((ev) => (
                    <tr key={ev._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-3">
                        {ev.user ? (
                          <button
                            onClick={() => setDrillUser({ _id: ev.user._id, name: ev.user.name, email: ev.user.email })}
                            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline text-xs"
                          >
                            {ev.user.name}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Guest</span>
                        )}
                      </td>
                      <td className="px-5 py-3 max-w-[160px]">
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{ev.path}</p>
                      </td>
                      <td className="px-5 py-3 max-w-[160px]">
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{ev.elementText || ev.elementType || '—'}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-500 uppercase">{ev.category}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <DeviceIcon device={ev.device} />
                          <span className="text-xs text-gray-500 capitalize">{ev.device}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(ev.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination?.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  Page {page} of {data.pagination.pages} · {data.pagination.total} events
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"><ChevronLeft size={14} /></button>
                  <span className="px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 text-xs font-bold">{page} / {data.pagination.pages}</span>
                  <button onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
