import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Wallet, Banknote, Package, MapPin, ChevronRight, Lock, Loader2, Tag, Trash2 } from 'lucide-react';
import { orderAPI, paymentAPI, couponAPI } from '../../services/api';
import { clearCart, selectCartItems, selectCartTotal, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { useSite } from '../../context/SiteContext';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

// eslint-disable-next-line no-unused-vars
const STATIC_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: Package, desc: 'Pay when delivered' },
];

// Icons for known gateway IDs
const GATEWAY_ICONS = {
  razorpay: CreditCard,
  stripe: CreditCard,
  cashfree: Wallet,
  payu: Banknote,
};

// ── Razorpay helper ────────────────────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const { coupon, discount, referralCode } = useSelector(state => state.cart);
  const { settings } = useSite();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(
    user?.addresses?.find(a => a.isDefault) || {
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '', city: '', state: '', pincode: '', country: 'India',
    }
  );
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [gateways, setGateways] = useState([]);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});

  const threshold = settings.freeShippingThreshold ?? 999;
  const shippingCost = settings.standardShippingCost ?? 49;
  const taxRate = (settings.taxRate ?? 18) / 100;
  const currencySymbol = settings.currencySymbol || '₹';
  const shipping = subtotal - discount >= threshold ? 0 : shippingCost;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + shipping + tax;

  useEffect(() => {
    paymentAPI.getActiveGateways()
      .then(res => {
        const active = res.data.gateways || [];
        setGateways(active);
        if (active.length > 0) setPaymentMethod(active[0].id);
      })
      .catch(() => { })
      .finally(() => setLoadingGateways(false));
  }, []);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate(couponCode.trim(), subtotal);
      const { coupon: c } = res.data;
      dispatch(applyCoupon({ coupon: c, discount: c.discount }));
      toast.success(`Coupon "${c.code}" applied! Saved ${settings.currencySymbol || '₹'}${(c.discount || 0).toFixed(2)}`);
      setCouponCode('');
    } catch (err) {
      toast.error(err.message || 'Invalid or expired coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // Build the payment methods list shown to users
  const paymentMethods = [
    ...gateways.map(gw => ({
      id: gw.id,
      label: gw.displayName,
      icon: GATEWAY_ICONS[gw.id] || CreditCard,
      desc: gw.description || '',
      gateway: gw,
    })),
    { id: 'cod', label: 'Cash on Delivery', icon: Package, desc: 'Pay when delivered' },
  ];

  const validateAddress = () => {
    const errors = {};

    if (!address.fullName || !address.street || !address.city || !address.pincode) {
      toast.error('Please fill all required address fields');
      if (!address.fullName) errors.fullName = 'Full Name is required';
      if (!address.phone) errors.phone = 'Phone number is required';
      if (!address.pincode) errors.pincode = 'Pincode is required';
      if (!address.street) errors.street = 'Street Address is required';
      if (!address.city) errors.city = 'City is required';
      if (!address.state) errors.state = 'State is required';
    }
    const phoneDigits = (address.phone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast.error('Phone number must be exactly 10 digits (India)');
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    const pincodeDigits = (address.pincode || '').replace(/\D/g, '');
    if (pincodeDigits.length !== 6) {
      toast.error('Pincode must be exactly 6 digits (Indian postal code)');
      errors.pincode = 'Pincode must be exactly 6 digits';
    }
    setAddressErrors(errors);

    // #region agent log
    fetch('http://127.0.0.1:7436/ingest/62e2a1c9-8294-48a2-981c-e3fb6efe754a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '10b514',
      },
      body: JSON.stringify({
        sessionId: '10b514',
        runId: 'checkout-address-validation-pre-fix-1',
        hypothesisId: 'CO-H1',
        location: 'CheckoutPage.jsx:validateAddress',
        message: 'Checkout address validation result',
        data: {
          hasErrors: Object.keys(errors).length > 0,
          errorKeys: Object.keys(errors),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    return Object.keys(errors).length === 0;
  };

  // ── Place order + handle gateway flows ──────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    setPlacing(true);
    try {
      // 1. Create the order (COD) or with pending payment status
      const orderRes = await orderAPI.create({
        items: items.map(i => ({ product: i.product._id, quantity: i.quantity, variant: i.variant })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code,
        referralCode,
      });
      const order = orderRes.data.order;

      // 2. COD — done
      if (paymentMethod === 'cod') {
        dispatch(clearCart());
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${order._id}`);
        return;
      }

      // 3. Razorpay popup flow
      if (paymentMethod === 'razorpay') {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Failed to load Razorpay SDK');

        const pgRes = await paymentAPI.createOrder({ gatewayId: 'razorpay', orderId: order._id });
        const { id: rzpOrderId, amount, currency, key_id } = pgRes.data.paymentOrder;

        await new Promise((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: key_id,
            amount,
            currency,
            order_id: rzpOrderId,
            name: 'Wellness_fuel',
            description: `Order #${order._id}`,
            prefill: {
              name: address.fullName,
              email: user?.email || '',
              contact: address.phone,
            },
            handler: async (response) => {
              try {
                await paymentAPI.verify({
                  gatewayId: 'razorpay',
                  orderId: order._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                resolve();
              } catch (e) { reject(e); }
            },
            modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
          });
          rzp.open();
        });

        dispatch(clearCart());
        toast.success('Payment successful!');
        navigate(`/order-confirmation/${order._id}`);
        return;
      }

      // 4. PayU form-redirect flow
      if (paymentMethod === 'payu') {
        const pgRes = await paymentAPI.createOrder({ gatewayId: 'payu', orderId: order._id });
        const pd = pgRes.data.paymentOrder;

        // Build and auto-submit a hidden form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = pd.action_url;
        const fields = {
          key: pd.merchant_key, txnid: pd.txn_id, amount: pd.amount,
          productinfo: pd.product_info, firstname: pd.first_name, email: pd.email,
          phone: address.phone || '',
          surl: `${window.location.origin}/api/payments/payu/response`,
          furl: `${window.location.origin}/api/payments/payu/response`,
          hash: pd.hash,
        };
        Object.entries(fields).forEach(([k, v]) => {
          const inp = document.createElement('input');
          inp.type = 'hidden'; inp.name = k; inp.value = v || '';
          form.appendChild(inp);
        });
        document.body.appendChild(form);
        dispatch(clearCart());
        form.submit();
        return;
      }

      // 5. Cashfree redirect
      if (paymentMethod === 'cashfree') {
        const pgRes = await paymentAPI.createOrder({ gatewayId: 'cashfree', orderId: order._id });
        const { payment_session_id } = pgRes.data.paymentOrder;
        // Load Cashfree SDK from CDN
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
          const cashfree = new window.Cashfree({ mode: pgRes.data.paymentOrder.mode || 'sandbox' });
          cashfree.checkout({ paymentSessionId: payment_session_id, returnUrl: `${window.location.origin}/order-confirmation/${order._id}` });
        };
        document.body.appendChild(script);
        dispatch(clearCart());
        return;
      }

      // 6. Stripe (uses clientSecret from order create response)
      if (paymentMethod === 'stripe') {
        const pgRes = await paymentAPI.createOrder({ gatewayId: 'stripe', orderId: order._id });
        const { client_secret } = pgRes.data.paymentOrder;
        // Store client secret in sessionStorage for the checkout to use
        sessionStorage.setItem('stripe_cs', client_secret);
        sessionStorage.setItem('stripe_order_id', order._id);
        // Redirect to Stripe-specific page or handle inline
        // For now: show a message and clear cart
        dispatch(clearCart());
        toast.success('Order placed. Complete payment with your bank.');
        navigate(`/order-confirmation/${order._id}`);
        return;
      }

      // Fallback: just go to confirmation
      dispatch(clearCart());
      toast.success('Order placed!');
      navigate(`/order-confirmation/${order._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-2 mb-6 sm:mb-8">
        {[{ num: 1, label: 'Address' }, { num: 2, label: 'Payment' }, { num: 3, label: 'Review' }].map((s, i) => (
          <div key={s.num} className="flex items-center gap-1 sm:gap-2">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium text-xs sm:text-sm ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
              <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current flex-shrink-0">{s.num}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < 2 && <ChevronRight size={14} className="text-gray-400 flex-shrink-0 hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2"><MapPin size={20} className="text-primary-600 dark:text-primary-400" />Shipping Address</h2>

              {user?.addresses?.length > 0 && (
                <div className="space-y-2 mb-5">
                  {user.addresses.map((addr, i) => (
                    <label key={i} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-colors bg-white dark:bg-gray-800/50">
                      <input type="radio" name="savedAddress" onChange={() => setAddress(addr)} className="mt-1 text-primary-600" />
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{addr.label} — {addr.fullName}</p>
                        <p className="text-gray-600 dark:text-gray-300">{addr.street}, {addr.city}, {addr.state} {addr.pincode}</p>
                        <p className="text-gray-500 dark:text-gray-400">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                  <div className="relative"><div className="border-t border-gray-200 dark:border-gray-700 my-3" /><span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-3 text-xs text-gray-400 dark:text-gray-500">or use new address</span></div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'fullName', label: 'Full Name', full: true },
                  { key: 'phone', label: 'Phone Number', type: 'tel' },
                  { key: 'pincode', label: 'Pincode' },
                  { key: 'street', label: 'Street Address', full: true },
                  { key: 'city', label: 'City' },
                  { key: 'state', label: 'State' },
                ].map(({ key, label, type, full }) => {
                  const isPhone = key === 'phone';
                  const isPincode = key === 'pincode';
                  const value = address[key] || '';
                  const onChange = (e) => {
                    let v = e.target.value;
                    if (isPhone) v = v.replace(/\D/g, '').slice(0, 10);
                    if (isPincode) v = v.replace(/\D/g, '').slice(0, 6);
                    setAddress(a => ({ ...a, [key]: v }));
                  };
                  return (
                    <div key={key} className={full ? 'col-span-1 sm:col-span-2' : ''}>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                        {label} *
                      </label>
                      <input
                        type={type || 'text'}
                        value={value}
                        onChange={onChange}
                        className={`input py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                          addressErrors[key] ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                        }`}
                        placeholder={isPhone ? '10-digit mobile' : isPincode ? '6-digit pincode' : label}
                        inputMode={isPhone || isPincode ? 'numeric' : 'text'}
                      />
                      {addressErrors[key] && (
                        <p className="mt-1 text-xs text-red-500">
                          {addressErrors[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (validateAddress()) setStep(2);
                }}
                className="btn-primary mt-6 flex items-center gap-2"
              >
                Continue to Payment <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6 animate-fade-in bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2"><CreditCard size={20} className="text-primary-600 dark:text-primary-400" />Payment Method</h2>

              {loadingGateways ? (
                <div className="flex items-center gap-3 py-6 text-gray-400 dark:text-gray-500">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Loading payment options…</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <label key={method.id} className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === method.id ? 'border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                      <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)} className="text-primary-600" />
                      <method.icon size={22} className={paymentMethod === method.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'} />
                      <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{method.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Review Order <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card p-6 animate-fade-in bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-5">Review Your Order</h2>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <img src={item.product.thumbnail} alt={item.product.title} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{item.product.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-5 text-sm">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Delivery Address</h4>
                <p className="text-gray-600 dark:text-gray-300">{address.fullName} • {address.phone}</p>
                <p className="text-gray-600 dark:text-gray-300">{address.street}, {address.city}, {address.state} {address.pincode}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-5 text-sm">
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Payment Method</h4>
                <p className="text-gray-600 dark:text-gray-300">{paymentMethods.find(m => m.id === paymentMethod)?.label || paymentMethod}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-5">
                <Lock size={12} />
                <span>Your payment information is secure and encrypted</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {placing ? <Loader size="sm" /> : `Place Order • ${currencySymbol}${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="card p-4 sm:p-5 h-fit order-1 lg:order-2 lg:sticky lg:top-24 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h3>

          {/* Coupon */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1"><Tag size={12} />Coupon</p>
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-2.5">
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">{coupon.code}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Saved {currencySymbol}{discount.toFixed(2)}</p>
                </div>
                <button type="button" onClick={() => dispatch(removeCoupon())} className="text-red-400 hover:text-red-600 p-1" aria-label="Remove coupon">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  className="input flex-1 min-w-0 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Enter code"
                />
                <button type="button" onClick={handleApplyCoupon} disabled={couponLoading} className="btn-secondary py-2 px-3 text-sm whitespace-nowrap flex-shrink-0">
                  {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><span>Discount</span><span>-{currencySymbol}{discount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>{shipping === 0 ? 'FREE' : `${currencySymbol}${shipping}`}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Tax ({(settings.taxRate ?? 18)}%)</span><span>{currencySymbol}{tax.toFixed(2)}</span></div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-primary-600 dark:text-primary-400 text-base"><span>Total</span><span>{currencySymbol}{total.toFixed(2)}</span></div>
          </div>
          {referralCode && <p className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg p-2">Referral: {referralCode}</p>}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
