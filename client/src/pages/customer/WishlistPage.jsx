import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart } from 'lucide-react';
import { toggleWishlist } from '../../store/slices/authSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const wishlist = user?.wishlist || [];

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Heart className="text-red-500" size={24} />Wishlist ({wishlist.length})
      </h1>

      {wishlist.length === 0 ? (
        <EmptyState icon={Heart} title="Your wishlist is empty" description="Save items you love by clicking the heart icon"
          actionLabel="Start Shopping" onAction={() => window.location.href = '/'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map(product => {
            const p = typeof product === 'object' ? product : { _id: product };
            if (!p.title) return null;
            const discountedPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;

            return (
              <div key={p._id} className="card group hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img src={p.thumbnail || 'https://via.placeholder.com/300'} alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={() => dispatch(toggleWishlist(p._id))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">
                    <Heart size={14} fill="currentColor" />
                  </button>
                </div>
                <div className="p-3">
                  <Link to={`/product/${p.slug}`} className="text-sm font-medium text-gray-800 hover:text-primary-600 line-clamp-2">{p.title}</Link>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-gray-900">₹{discountedPrice?.toFixed(2)}</span>
                    <button onClick={() => dispatch(addToCart({ product: p, quantity: 1 }))}
                      className="w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors">
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
