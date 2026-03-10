import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Heart, ShoppingCart, Zap, Shield, Truck, RotateCcw, Share2, ChevronLeft, ChevronRight, Minus, Plus, Check } from 'lucide-react';
import { productAPI, reviewAPI, referralAPI } from '../../services/api';
import { useSite } from '../../context/SiteContext';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/authSlice';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { settings } = useSite();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { referralCode } = useSelector(state => state.cart);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [related, setRelated] = useState([]);

  const isWishlisted = user?.wishlist?.some(id => id === product?._id || id?._id === product?._id);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getBySlug(slug);
        const p = res.data.product;
        setProduct(p);

        // Track referral visit if ref param present
        const urlRef = new URLSearchParams(window.location.search).get('ref');
        if (urlRef) {
          referralAPI.trackClick(urlRef, `/product/${slug}`).catch(() => {});
        }

        // Fetch reviews
        const revRes = await reviewAPI.getByProduct(p._id, { limit: 5 });
        setReviews(revRes.data.reviews);
        setReviewStats(revRes.data.stats);

        // Fetch related products
        if (p.category?._id) {
          const relRes = await productAPI.getAll({ category: p.category._id, limit: 5 });
          setRelated(relRes.data.products.filter(rp => rp._id !== p._id).slice(0, 4));
        }
      } catch (err) {
        toast.error(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, quantity }));
    window.location.href = '/checkout';
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    dispatch(toggleWishlist(product._id));
  };

  const handleShare = () => {
    const refCode = referralCode || Cookies.get('ref_code');
    const url = `${window.location.href}${refCode ? `?ref=${refCode}` : ''}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>;
  if (!product) return <div className="page-container py-16 text-center"><h2 className="text-2xl font-bold text-gray-600">Product not found</h2></div>;

  const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
  const images = product.images?.length > 0 ? product.images : [{ url: product.thumbnail || 'https://via.placeholder.com/600', alt: product.title }];

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 overflow-hidden">
        <Link to="/" className="hover:text-primary-600 truncate shrink-0">Home</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to={`/category/${product.category?.slug}`} className="hover:text-primary-600 truncate">{product.category?.name}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700 truncate min-w-0">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 group">
            <img src={images[selectedImage]?.url || 'https://via.placeholder.com/600'}
              alt={images[selectedImage]?.alt || product.title}
              className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button onClick={() => setSelectedImage(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setSelectedImage(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight size={18} />
                </button>
              </>
            )}
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 badge bg-red-500 text-white text-sm px-3 py-1">
                -{product.discount}%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary-500' : 'border-gray-200 hover:border-gray-400'}`}>
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          {product.brand && <p className="text-sm font-medium text-primary-600 uppercase tracking-wider">{product.brand}</p>}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.title}</h1>

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(product.ratings.average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.ratings.average.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.ratings.count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-gray-900">₹{discountedPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                <span className="badge bg-green-100 text-green-700 text-sm">Save ₹{(product.price - discountedPrice).toFixed(2)}</span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? (
              <><Check size={16} />In Stock {product.stock <= 10 && <span className="text-orange-500">(Only {product.stock} left)</span>}</>
            ) : (
              'Out of Stock'
            )}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-outline flex-1 flex items-center justify-center gap-2">
              <ShoppingCart size={18} />Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Zap size={18} />Buy Now
            </button>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button onClick={handleWishlist}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isWishlisted ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium">
              <Share2 size={16} />Share
            </button>
          </div>

          {/* Delivery perks */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
            {[
              { icon: Truck, text: 'Free Delivery', sub: `Orders ${settings?.currencySymbol || '₹'}${settings?.freeShippingThreshold ?? 999}+` },
              { icon: RotateCcw, text: 'Easy Returns', sub: '7-day return' },
              { icon: Shield, text: 'Secure Pay', sub: '100% safe' },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <Icon size={20} className="text-primary-600 mb-1" />
                <span className="text-xs font-semibold text-gray-800">{text}</span>
                <span className="text-xs text-gray-500">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-gray-200 mb-6 -mx-1 px-1">
          {['description', 'features', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold capitalize transition-all border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
              {tab === 'reviews' ? `Reviews (${product.ratings?.count || 0})` : tab}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') || '' }} />
        )}

        {activeTab === 'features' && (
          <div className="space-y-2">
            {product.attributes?.features?.length > 0 ? product.attributes.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            )) : <p className="text-gray-500">No features listed.</p>}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviewStats && (
              <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-2xl mb-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-gray-900">{(reviewStats.average || 0).toFixed(1)}</div>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < Math.round(reviewStats.average || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">{reviewStats.total} reviews</div>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-6">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${reviewStats.total ? ((reviewStats[['zero','one','two','three','four','five'][star]] || 0) / reviewStats.total * 100) : 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-6">{reviewStats[['zero','one','two','three','four','five'][star]] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                        {review.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{review.user?.name}</p>
                        {review.isVerifiedPurchase && <span className="badge bg-green-100 text-green-600 text-xs">Verified Purchase</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                  </div>
                  {review.title && <h4 className="font-semibold text-sm text-gray-800 mb-1">{review.title}</h4>}
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  {review.adminReply && (
                    <div className="mt-3 p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
                      <span className="font-semibold">Seller reply:</span> {review.adminReply}
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="section-title">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
