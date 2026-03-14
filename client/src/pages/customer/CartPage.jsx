import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, Truck } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon, selectCartItems, selectCartTotal, selectCartCount } from '../../store/slices/cartSlice';
import { couponAPI } from '../../services/api';
import { useSite } from '../../context/SiteContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { settings } = useSite();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const { coupon, discount } = useSelector(state => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const firstItemTitleRef = useRef(null);

  const threshold = settings.freeShippingThreshold ?? 999;
  const shippingCost = settings.standardShippingCost ?? 49;
  const taxRate = (settings.taxRate ?? 18) / 100;
  const currencySymbol = settings.currencySymbol || '₹';
  const shipping = total - discount >= threshold ? 0 : shippingCost;
  const tax = (total - discount) * taxRate;
  const finalTotal = total - discount + shipping + tax;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');

    // #region agent log
    fetch('http://127.0.0.1:7436/ingest/62e2a1c9-8294-48a2-981c-e3fb6efe754a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '10b514',
      },
      body: JSON.stringify({
        sessionId: '10b514',
        runId: 'cart-page-darkmode-pre-fix-1',
        hypothesisId: 'CP-H1',
        location: 'CartPage.jsx:dark-mode-check',
        message: 'Cart page dark mode state',
        data: { isDark },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const el = firstItemTitleRef.current;
    if (el && typeof window !== 'undefined') {
      const style = window.getComputedStyle(el);
      // #region agent log
      fetch('http://127.0.0.1:7436/ingest/62e2a1c9-8294-48a2-981c-e3fb6efe754a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '10b514',
        },
        body: JSON.stringify({
          sessionId: '10b514',
          runId: 'cart-page-darkmode-pre-fix-1',
          hypothesisId: 'CP-H2',
          location: 'CartPage.jsx:item-title-styles',
          message: 'Cart item title text and background colors',
          data: {
            color: style.color,
            backgroundColor: style.backgroundColor,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
    }
  }, [items.length]);

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate(couponCode, total);
      dispatch(applyCoupon({ coupon: res.data.coupon, discount: res.data.coupon.discount }));
      toast.success(`Coupon "${res.data.coupon.code}" applied! Saved ${currencySymbol}${res.data.coupon.discount.toFixed(2)}`);
      setCouponCode('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-container py-16 text-center animate-fade-in">
        <ShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Shopping Cart ({count} items)</h1>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div key={item.key} className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex gap-3 sm:flex-1 min-w-0">
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <img src={item.product.thumbnail || 'https://via.placeholder.com/100'} alt={item.product.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl hover:opacity-90 transition-opacity" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`}>
                    <h3
                      ref={idx === 0 ? firstItemTitleRef : null}
                      className="font-semibold text-gray-800 dark:text-gray-200 hover:text-primary-600 transition-colors line-clamp-2 text-sm sm:text-base"
                    >
                      {item.product.title}
                    </h3>
                  </Link>
                  {item.variant && <p className="text-xs text-gray-500 mt-0.5">{JSON.stringify(item.variant)}</p>}
                  <p className="text-primary-600 font-bold mt-1">{currencySymbol}{item.price.toFixed(2)}</p>
                  {item.product.discount > 0 && (
                    <p className="text-xs text-gray-400 line-through">{currencySymbol}{item.product.price.toFixed(2)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 sm:border-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity - 1 }))}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity + 1 }))}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 dark:text-white">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => dispatch(removeFromCart(item.key))}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button onClick={() => { if (window.confirm('Clear your entire cart?')) dispatch(clearCart()); }}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 px-4 py-2 border border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 size={14} />Clear Cart
            </button>
            <Link to="/search" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 px-4 py-2 border border-primary-200 dark:border-primary-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              <ShoppingBag size={14} />Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag size={16} />Apply Coupon</h3>
            {coupon ? (
              <div className="flex items-center justify-between gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 truncate">{coupon.code} applied!</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Saved {currencySymbol}{discount.toFixed(2)}</p>
                </div>
                <button onClick={() => dispatch(removeCoupon())} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="input flex-1 min-w-0 py-2.5 text-sm" placeholder="Enter coupon code"
                  onKeyPress={e => e.key === 'Enter' && handleCoupon()} />
                <button onClick={handleCoupon} disabled={couponLoading}
                  className="btn-primary py-2.5 px-4 text-sm flex-shrink-0">Apply</button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{currencySymbol}{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1"><Truck size={14} />Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `${currencySymbol}${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax ({(settings.taxRate ?? 18)}% GST)</span>
                <span>{currencySymbol}{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span className="text-primary-600">{currencySymbol}{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                Add {currencySymbol}{(threshold - (total - discount)).toFixed(0)} more for FREE shipping!
              </p>
            )}

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
