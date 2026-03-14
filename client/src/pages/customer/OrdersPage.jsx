import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const STATUS_COLORS = {
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  packed: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  out_for_delivery: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  returned: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await orderAPI.getMyOrders({ page, limit: 10 });
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [page]);

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Package className="text-primary-600 flex-shrink-0" size={24} />My Orders
      </h1>

      {loading ? (
        <div className="flex justify-center py-16"><Loader size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" description="Start shopping to see your orders here"
          actionLabel="Start Shopping" onAction={() => window.location.href = '/'} />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`badge text-xs px-2.5 py-1 font-semibold capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white mt-1">₹{order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-2 mb-3">
                {order.items?.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.image || 'https://via.placeholder.com/40'} alt={item.title}
                    className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                ))}
                {order.items?.length > 3 && (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    +{order.items.length - 3}
                  </div>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">{order.items?.length} item(s)</p>
              </div>

              <Link to={`/orders/${order._id}`}
                className="flex items-center justify-between w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium group">
                <span>Track Order</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}

          <Pagination currentPage={page} totalPages={pagination?.pages || 1} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
