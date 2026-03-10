import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, CreditCard } from 'lucide-react';
import { orderAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id).then(res => setOrder(res.data.order)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>;
  if (!order) return null;

  return (
    <div className="page-container py-12 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500">Thank you for your purchase. Your order is being processed.</p>
        </div>

        {/* Order Card */}
        <div className="card p-6 mb-5">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-black text-primary-600">#{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order Total</p>
              <p className="text-xl font-black text-gray-900">₹{order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              { icon: Package, label: 'Status', value: order.orderStatus.replace(/_/g, ' ').toUpperCase() },
              { icon: CreditCard, label: 'Payment', value: order.paymentMethod.toUpperCase() },
              { icon: MapPin, label: 'City', value: order.shippingAddress?.city },
              { icon: Truck, label: 'Est. Delivery', value: '3-7 Business Days' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 flex items-start gap-3">
                <Icon size={18} className="text-primary-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Items Ordered</h3>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image || 'https://via.placeholder.com/48'} alt={item.title}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Track your order CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 text-white text-center mb-5">
          <Truck size={32} className="mx-auto mb-2 opacity-90" />
          <h3 className="font-bold text-lg mb-1">Track Your Order</h3>
          <p className="text-white/80 text-sm mb-4">Get real-time updates on your delivery status</p>
          <Link to={`/orders/${order._id}`} className="bg-white text-primary-600 font-bold px-6 py-2.5 rounded-xl inline-block hover:shadow-lg transition-all">
            Track Order
          </Link>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-secondary flex items-center gap-2">Continue Shopping</Link>
          <Link to="/orders" className="btn-primary flex items-center gap-2"><Package size={16} />My Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
