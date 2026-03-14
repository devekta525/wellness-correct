import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, ArrowRight, Star, Zap, CheckCircle2, Tag } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product, className = '' }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [imageError, setImageError] = useState(false);

  const productId = typeof product._id === 'string' ? product._id : product._id?.toString?.();
  const isWishlisted = user?.wishlist?.some((id) => {
    const wId = typeof id === 'object' && id !== null ? id._id?.toString?.() || id._id : (id?.toString?.() || id);
    return wId === productId;
  });

  // Price logic: prefer comparePrice field, then fall back to discount %
  const originalPrice = product.comparePrice || (product.discount > 0 ? product.price / (1 - product.discount / 100) : null);
  const salePrice = product.price;
  const savings = originalPrice ? originalPrice - salePrice : 0;
  const discountPct = originalPrice ? Math.round((savings / originalPrice) * 100) : product.discount;

  // Key features: use attributes.features, fall back to tags (max 3)
  const features = (product.attributes?.features?.length > 0
    ? product.attributes.features
    : product.tags || []
  ).slice(0, 3);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to your account first');
      return;
    }
    if (product.stock === 0) return;
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to your account first');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const imgSrc = imageError
    ? 'https://via.placeholder.com/400'
    : (product.thumbnail || product.images?.[0]?.url || 'https://via.placeholder.com/400');

  const outOfStock = product.stock === 0;

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
        runId: 'product-card-darkmode-pre-fix-1',
        hypothesisId: 'PC-H1',
        location: 'ProductCard.jsx:dark-mode-check',
        message: 'Product card dark mode state',
        data: { isDark },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
  }, []);

  return (
    <div className={`group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden flex flex-col
      shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_6px_rgba(15,23,42,0.8)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.18)]
      border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-500
      transition-all duration-300 hover:-translate-y-1.5 ${className}`}>

      {/* ── Image ─────────────────────────────────────── */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <img
          src={imgSrc}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 ${outOfStock ? 'opacity-60 grayscale' : ''}`}
          onError={() => setImageError(true)}
          style={{ transform: 'scale(1)', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {discountPct > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow">
              {discountPct}% OFF
            </span>
          )}
          {product.isFlashDeal && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white shadow flex items-center gap-0.5">
              <Zap size={9} />Flash Deal
            </span>
          )}
          {product.isFeatured && !product.isFlashDeal && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-600 text-white shadow">
              Featured
            </span>
          )}
          {outOfStock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-600 text-white shadow">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center
            shadow-md border transition-all duration-200 touch-manipulation
            ${isWishlisted
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white/90 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:text-red-500 hover:border-red-300'}`}>
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Info ──────────────────────────────────────── */}
      <Link to={`/product/${product.slug}`} className="flex flex-col flex-1 p-4 pb-0 gap-2.5 no-underline">

        {/* Category + Brand row */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.category?.name && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide
              bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-700 px-2 py-0.5 rounded-full">
              <Tag size={9} />
              {product.category.name}
            </span>
          )}
          {product.brand && (
            <span className="text-[10px] text-gray-400 dark:text-gray-400 font-medium">{product.brand}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug
          group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
          {product.title}
        </h3>

        {/* Rating */}
        {product.ratings?.count > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11}
                  className={i < Math.round(product.ratings.average)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'} />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              {product.ratings.average?.toFixed(1)} ({product.ratings.count})
            </span>
          </div>
        )}

        {/* Key Features */}
        {features.length > 0 && (
          <ul className="flex flex-col gap-1">
            {features.map((feat, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-300 leading-tight">
                <CheckCircle2 size={11} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Spacer pushes price+buttons to bottom */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">
              ₹{salePrice.toFixed(0)}
            </span>
            {originalPrice && originalPrice > salePrice && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">₹{originalPrice.toFixed(0)}</span>
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                  Save ₹{savings.toFixed(0)}
                </span>
              </div>
            )}
          </div>
          {product.stock > 0 && product.stock <= 10 && (
            <span className="text-[10px] text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
              Only {product.stock} left
            </span>
          )}
        </div>

      </Link>

      {/* Divider + Action Buttons (outside Link to avoid nested anchors) */}
        <div className="px-4 pb-4 flex flex-col gap-2.5 mt-auto">
        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
              transition-all duration-200 touch-manipulation
              ${outOfStock
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md active:scale-95'}`}>
            <ShoppingCart size={13} />
            {outOfStock ? 'Unavailable' : 'Add to Cart'}
          </button>

          <Link
            to={`/product/${product.slug}`}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold
              border border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20
              transition-all duration-200 whitespace-nowrap active:scale-95">
            Explore <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
