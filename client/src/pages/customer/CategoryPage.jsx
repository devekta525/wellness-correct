import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { categoryAPI, productAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { Package } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'bestseller', label: 'Best Sellers' },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    categoryAPI.getBySlug(slug).then(res => setCategory(res.data.category)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;
      setLoading(true);
      try {
        const res = await productAPI.getAll({ ...filters, category: category._id, limit: 20 });
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, filters]);

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    setSearchParams(Object.fromEntries(Object.entries(updated).filter(([, v]) => v)));
  };

  const clearFilters = () => {
    setFilters({ sort: 'newest', minPrice: '', maxPrice: '', page: 1 });
    setSearchParams({});
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{category?.name || 'Category'}</h1>
          {category?.description && <p className="text-gray-500 text-sm mt-1">{category.description}</p>}
          {pagination && <p className="text-sm text-gray-400 mt-1">{pagination.total} products</p>}
        </div>

        {/* Sort + Filter */}
        <div className="flex items-center gap-3">
          <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
            className="input py-2 pr-8 text-sm w-40 bg-white">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={16} />Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {filterOpen && (
        <div className="card p-4 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
              <X size={14} />Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Min Price (₹)</label>
              <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                className="input py-2 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Max Price (₹)</label>
              <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                className="input py-2 text-sm" placeholder="99999" />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton aspect-square" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 w-1/3 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try adjusting your filters" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          <Pagination currentPage={filters.page} totalPages={pagination?.pages || 1}
            onPageChange={page => updateFilter('page', page)} />
        </>
      )}
    </div>
  );
};

export default CategoryPage;
