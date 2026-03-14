import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { setCartOpen } from '../../store/slices/uiSlice';
import { removeFromCart, updateQuantity, selectCartItems, selectCartTotal, selectCartCount } from '../../store/slices/cartSlice';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartOpen } = useSelector(state => state.ui);
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  const headerTitleRef = useRef(null);

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
        runId: 'cart-drawer-darkmode-pre-fix-1',
        hypothesisId: 'CD-H1',
        location: 'CartDrawer.jsx:dark-mode-check',
        message: 'Cart drawer dark mode state',
        data: { isDark },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const el = headerTitleRef.current;
    if (el) {
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
          runId: 'cart-drawer-darkmode-pre-fix-1',
          hypothesisId: 'CD-H2',
          location: 'CartDrawer.jsx:header-title-styles',
          message: 'Cart drawer header title colors',
          data: {
            color: style.color,
            backgroundColor: style.backgroundColor,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
    }
  }, []);

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop: below navbar so navbar stays visible; dims and blocks interaction with main content only */}
      <div
        className={`fixed top-14 sm:top-16 left-0 right-0 bottom-0 z-40 bg-black/50 dark:bg-black/60 transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => dispatch(setCartOpen(false))}
        aria-hidden={!cartOpen}
      />

      {/* Drawer: starts below navbar so navbar remains visible and usable */}
      <div className={`fixed right-0 top-14 sm:top-16 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-950 z-50 shadow-2xl transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-primary-600" size={20} />
              <h2 ref={headerTitleRef} className="font-bold text-lg text-gray-900 dark:text-gray-100">Your Cart</h2>
              {count > 0 && <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{count}</span>}
            </div>
            <button onClick={() => dispatch(setCartOpen(false))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={48} className="text-gray-200 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-300 font-medium">Your cart is empty</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add some products to get started</p>
                <Link to="/search" onClick={() => dispatch(setCartOpen(false))}
                  className="btn-primary mt-4 inline-block text-sm">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                    <img src={item.product.thumbnail || 'https://via.placeholder.com/80'} alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2">{item.product.title}</p>
                      {item.variant && <p className="text-xs text-gray-500 dark:text-gray-400">{JSON.stringify(item.variant)}</p>}
                      <p className="text-primary-600 dark:text-primary-400 font-bold text-sm mt-1">₹{item.price.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity - 1 }))}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-800 dark:text-gray-100">{item.quantity}</span>
                          <button onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity + 1 }))}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => dispatch(removeFromCart(item.key))}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Subtotal ({count} items)</span>
                <span className="font-semibold">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span className={total > 999 ? 'text-green-600 font-medium' : ''}>
                  {total > 999 ? 'FREE' : '₹49.00'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span className="text-primary-600">₹{(total > 999 ? total : total + 49).toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full">
                Proceed to Checkout
              </button>
              <Link to="/cart" onClick={() => dispatch(setCartOpen(false))}
                className="block text-center text-sm text-primary-600 hover:underline">
                View full cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
