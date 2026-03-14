import { useEffect, useState, useCallback, useRef } from 'react';
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
    minRating: searchParams.get('minRating') || '',
    inStock: searchParams.get('inStock') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const sortSelectRef = useRef(null);

  // Keep search keyword visible: sync from URL when landing or when URL ?q= changes
  const qParam = searchParams.get('q') || '';
  useEffect(() => {
    setQuery(qParam);
    setInputVal(qParam);
  }, [qParam]);

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
        runId: 'search-filters-darkmode-pre-fix-1',
        hypothesisId: 'SF-H1',
        location: 'SearchPage.jsx:dark-mode-check',
        message: 'Search filters dark mode state',
        data: { isDark },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const el = sortSelectRef.current;
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
          runId: 'search-filters-darkmode-pre-fix-1',
          hypothesisId: 'SF-H2',
          location: 'SearchPage.jsx:sort-select-styles',
          message: 'Search sort select colors',
          data: {
            color: style.color,
            backgroundColor: style.backgroundColor,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
    }
  }, [filters.sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    setQuery(q);
    setFilters(f => ({ ...f, page: 1 }));
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (q) next.set('q', q); else next.delete('q');
      next.delete('page');
      return next;
    });
  };

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const clearFilters = () => {
    setQuery('');
    setInputVal('');
    const reset = { sort: 'newest', category: '', minPrice: '', maxPrice: '', featured: '', flashDeal: '', minRating: '', inStock: '', page: 1 };
    setFilters(reset);
    setSearchParams({});
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Search Bar — stacked on mobile so Search button is full-width and clear */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-0 sm:relative">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
              className="w-full pl-12 pr-4 sm:pr-32 py-3 sm:py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              placeholder="Search products, brands, categories..." />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 sm:px-5 text-sm hidden sm:inline-flex">
              Search
            </button>
          </div>
          <button type="submit" className="w-full sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 sm:w-auto btn-primary py-3 sm:py-2 px-5 text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 sm:hidden">
            <Search size={18} />
            Search
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
        <select
          ref={sortSelectRef}
          value={filters.sort}
          onChange={e => updateFilter('sort', e.target.value)}
          className="input py-2 text-sm w-full min-w-0 sm:w-36 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={filters.category}
          onChange={e => updateFilter('category', e.target.value)}
          className="input py-2 text-sm w-full min-w-0 sm:w-40 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <input
          type="number"
          value={filters.minPrice}
          onChange={e => updateFilter('minPrice', e.target.value)}
          className="input py-2 text-sm w-full sm:w-28 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          placeholder="Min ₹"
        />
        <input
          type="number"
          value={filters.maxPrice}
          onChange={e => updateFilter('maxPrice', e.target.value)}
          className="input py-2 text-sm w-full sm:w-28 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          placeholder="Max ₹"
        />
        <select
          value={filters.minRating}
          onChange={e => updateFilter('minRating', e.target.value)}
          className="input py-2 text-sm w-full min-w-0 sm:w-32 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>
        <select
          value={filters.inStock}
          onChange={e => updateFilter('inStock', e.target.value)}
          className="input py-2 text-sm w-full min-w-0 sm:w-36 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        >
          <option value="">All</option>
          <option value="true">In stock</option>
          <option value="false">Out of stock</option>
        </select>
        <select
          value={filters.featured}
          onChange={e => updateFilter('featured', e.target.value)}
          className="input py-2 text-sm w-full min-w-0 sm:w-32 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        >
          <option value="">All</option>
          <option value="true">Featured</option>
        </select>
        <select
          value={filters.flashDeal}
          onChange={e => updateFilter('flashDeal', e.target.value)}
          className="input py-2 text-sm w-full min-w-0 sm:w-32 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        >
          <option value="">All</option>
          <option value="true">Flash deals</option>
        </select>

        {(filters.category || filters.minPrice || filters.maxPrice || filters.minRating || filters.inStock || filters.featured || filters.flashDeal || query) && (
          <button type="button" onClick={clearFilters}
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
            onPageChange={page => { setFilters(f => ({ ...f, page })); setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(page)); return n; }); }} />
        </>
      )}
    </div>
  );
};

export default SearchPage;
