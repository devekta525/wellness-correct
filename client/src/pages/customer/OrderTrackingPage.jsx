import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, MapPin, CheckCircle, Clock, XCircle, ChevronLeft, Phone } from 'lucide-react';
import { orderAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const ORDER_STAGES = [
  { key: 'pending', label: 'Pending Payment', icon: Clock, desc: 'Awaiting payment' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Your order has been placed' },
  { key: 'packed', label: 'Packed', icon: Package, desc: 'Your items are being packed' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'Order shipped via courier' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, desc: 'Arriving today' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Package delivered!' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id).then(res => setOrder(res.data.order)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>;
  if (!order) return null;

  const currentStageIndex = STATUS_ORDER.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link to="/orders" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors">
          <ChevronLeft size={18} />Back to Orders
        </Link>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.orderNumber}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`badge text-sm px-3 py-1.5 font-semibold capitalize ${
            isCancelled ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
            order.orderStatus === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
          }`}>
            {order.orderStatus.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Tracking Timeline */}
        <div className="card p-6 mb-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white mb-6">Tracking Status</h2>

          {isCancelled ? (
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-700 dark:text-red-400">
              <XCircle size={32} className="flex-shrink-0" />
              <div>
                <p className="font-bold">Order Cancelled</p>
                <p className="text-sm text-red-600 dark:text-red-500">{order.cancellationReason || 'This order has been cancelled'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {ORDER_STAGES.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const Icon = stage.icon;

                return (
                  <div key={stage.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompleted ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      } ${isCurrent ? 'ring-4 ring-primary-200 dark:ring-primary-800 scale-110' : ''}`}>
                        <Icon size={18} className={isCompleted ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
                      </div>
                      {index < ORDER_STAGES.length - 1 && (
                        <div className={`w-0.5 h-10 mt-1 ${isCompleted && index < currentStageIndex ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                      )}
                    </div>
                    <div className="pb-8 flex-1">
                      <p className={`font-semibold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{stage.label}</p>
                      <p className={`text-sm ${isCompleted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-500'}`}>{stage.desc}</p>
                      {isCurrent && order.statusHistory?.find(h => h.status === stage.key)?.updatedAt && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(order.statusHistory.find(h => h.status === stage.key).updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div className="card p-5 mb-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><MapPin size={18} className="text-primary-600 dark:text-primary-400" />Delivery Address</h3>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order.shippingAddress?.street}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1"><Phone size={12} />{order.shippingAddress?.phone}</p>
        </div>

        {/* Items */}
        <div className="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Ordered Items</h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <img src={item.image || 'https://via.placeholder.com/60'} alt={item.title} className="w-14 h-14 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 flex justify-between font-bold text-gray-900 dark:text-white">
            <span>Total Paid</span>
            <span className="text-primary-600 dark:text-primary-400">₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
