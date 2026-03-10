import { useDispatch, useSelector } from 'react-redux';
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

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => dispatch(setCartOpen(false))}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-primary-600" size={20} />
              <h2 className="font-bold text-lg">Your Cart</h2>
              {count > 0 && <span className="badge bg-primary-100 text-primary-700">{count}</span>}
            </div>
            <button onClick={() => dispatch(setCartOpen(false))} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Add some products to get started</p>
                <Link to="/search" onClick={() => dispatch(setCartOpen(false))}
                  className="btn-primary mt-4 inline-block text-sm">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                    <img src={item.product.thumbnail || 'https://via.placeholder.com/80'} alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.product.title}</p>
                      {item.variant && <p className="text-xs text-gray-500">{JSON.stringify(item.variant)}</p>}
                      <p className="text-primary-600 font-bold text-sm mt-1">₹{item.price.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity - 1 }))}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity + 1 }))}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => dispatch(removeFromCart(item.key))}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
            <div className="border-t border-gray-100 p-5 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span className="font-semibold">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className={total > 999 ? 'text-green-600 font-medium' : ''}>
                  {total > 999 ? 'FREE' : '₹49.00'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900">
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
