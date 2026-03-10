import { useState, useEffect } from 'react';
import { Package, Eye, RefreshCw, ChevronDown } from 'lucide-react';
import { orderAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
const STATUS_COLORS = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700', packed: 'bg-yellow-100 text-yellow-700', shipped: 'bg-purple-100 text-purple-700', out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', returned: 'bg-gray-100 text-gray-700' };
const PAYMENT_COLORS = { pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-700' };

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', paymentStatus: '', search: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', note: '', trackingNumber: '' });
  const [updating, setUpdating] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchOrders(); }, [page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.adminGetAll({ page, limit: 20, ...filters });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch { } finally { setLoading(false); }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await orderAPI.updateStatus(statusModal._id, statusForm);
      toast.success('Order status updated!');
      setStatusModal(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Package className="text-primary-600" size={26} />Orders</h1>
        <button onClick={fetchOrders} className="btn-secondary text-sm py-2.5 flex items-center gap-2"><RefreshCw size={14} />Refresh</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="input py-2 text-sm w-48" placeholder="Search order #..." />
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input py-2 text-sm w-48 bg-white capitalize">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filters.paymentStatus} onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value }))} className="input py-2 text-sm w-40 bg-white">
          <option value="">All Payments</option>
          {['pending', 'paid', 'failed', 'refunded'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><Loader size="md" /></div> : (
          <div className="table-responsive">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">No orders found</td></tr>
                ) : orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-primary-600 text-xs">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.items?.length} items</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${PAYMENT_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-primary-50 text-primary-600 rounded-lg"><Eye size={14} /></button>
                        <button onClick={() => { setStatusModal(order); setStatusForm({ status: order.orderStatus, note: '', trackingNumber: order.trackingNumber || '' }); }}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg"><ChevronDown size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination currentPage={page} totalPages={pagination?.pages || 1} onPageChange={setPage} />

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Customer', value: selectedOrder.user?.name || 'Guest' },
                { label: 'Email', value: selectedOrder.user?.email || selectedOrder.guestEmail },
                { label: 'Status', value: <span className={`badge text-xs ${STATUS_COLORS[selectedOrder.orderStatus]}`}>{selectedOrder.orderStatus.replace(/_/g, ' ')}</span> },
                { label: 'Payment', value: <span className={`badge text-xs ${PAYMENT_COLORS[selectedOrder.paymentStatus]}`}>{selectedOrder.paymentStatus}</span> },
                { label: 'Method', value: selectedOrder.paymentMethod },
                { label: 'Tracking #', value: selectedOrder.trackingNumber || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-medium text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Shipping Address</h4>
              <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.fullName} • {selectedOrder.shippingAddress?.phone}</p>
              <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}</p>
            </div>
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Items</h4>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2"><span>Total</span><span className="text-primary-600">₹{selectedOrder.total?.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Order Status" size="sm">
        {statusModal && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">New Status</label>
              <select value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))} className="input bg-white capitalize">
                {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tracking Number</label>
              <input value={statusForm.trackingNumber} onChange={e => setStatusForm(f => ({ ...f, trackingNumber: e.target.value }))} className="input" placeholder="Optional tracking number" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Note</label>
              <textarea value={statusForm.note} onChange={e => setStatusForm(f => ({ ...f, note: e.target.value }))} className="input resize-none" rows={2} placeholder="Optional note" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStatusModal(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={updating} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                {updating ? <Loader size="sm" /> : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
