import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { productAPI } from '../../services/api';
import { useSelector } from 'react-redux';
import ProductCard from '../../components/product/ProductCard';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'bestseller', label: 'Best Sellers' },
];

const SearchPage = () => {
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useSelector(state => state.products);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') || 'newest',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') || '',
    flashDeal: searchParams.get('flashDeal') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 20 };
      if (query) params.search = query;
      const res = await productAPI.getAll(params);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  }, [query, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputVal);
    setFilters(f => ({ ...f, page: 1 }));
  };

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
            className="w-full pl-12 pr-24 sm:pr-32 py-3 sm:py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            placeholder="Search products, brands, categories..." />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 sm:px-5 text-sm">
            Search
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
        <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
          className="input py-2 text-sm w-full min-w-0 sm:w-36 bg-white">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select value={filters.category} onChange={e => updateFilter('category', e.target.value)}
          className="input py-2 text-sm w-full min-w-0 sm:w-40 bg-white">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
          className="input py-2 text-sm w-full sm:w-28 bg-white" placeholder="Min ₹" />
        <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
          className="input py-2 text-sm w-full sm:w-28 bg-white" placeholder="Max ₹" />

        {(filters.category || filters.minPrice || filters.maxPrice || query) && (
          <button onClick={() => { setQuery(''); setInputVal(''); setFilters({ sort: 'newest', category: '', minPrice: '', maxPrice: '', featured: '', flashDeal: '', page: 1 }); }}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 px-3 py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
            <X size={14} />Clear
          </button>
        )}

        {pagination && <span className="text-sm text-gray-500 w-full sm:w-auto sm:ml-auto">{pagination.total} results{query && ` for "${query}"`}</span>}
      </div>

      {/* Results */}
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
        <EmptyState icon={Search} title="No products found" description={query ? `No results for "${query}". Try different keywords.` : 'No products match your filters.'} />
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

export default SearchPage;
