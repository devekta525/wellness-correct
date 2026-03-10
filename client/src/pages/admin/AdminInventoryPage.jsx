import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  RefreshCw,
} from 'lucide-react';
import { productAPI } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const LIMIT = 20;
const PLACEHOLDER_IMG = 'https://via.placeholder.com/80/f3f4f6/9ca3af?text=No+img';

const StockBadge = ({ stock, lowStockThreshold }) => {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
        <XCircle size={12} /> Out of stock
      </span>
    );
  }
  if (lowStockThreshold != null && stock <= lowStockThreshold) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        <AlertTriangle size={12} /> Low stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
      <CheckCircle size={12} /> In stock
    </span>
  );
};

const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState(''); // '', 'low_stock', 'out_of_stock'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [savingId, setSavingId] = useState(null);
  const [edits, setEdits] = useState({}); // { productId: { stock, lowStockThreshold } }

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search.trim()) params.search = search.trim();
      if (stockFilter === 'low_stock') params.status = 'low_stock';
      if (stockFilter === 'out_of_stock') params.status = 'out_of_stock';
      const res = await productAPI.adminGetAll(params);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || { pages: 1, total: 0 });
      setEdits({});
    } catch (err) {
      toast.error(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [page, search, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const getEdit = (product) => {
    const id = product._id;
    const e = edits[id];
    return {
      stock: e?.stock !== undefined ? e.stock : product.stock,
      lowStockThreshold: e?.lowStockThreshold !== undefined ? e.lowStockThreshold : (product.lowStockThreshold ?? 10),
    };
  };

  const setEdit = (productId, field, value) => {
    const num = field === 'stock' || field === 'lowStockThreshold' ? Math.max(0, parseInt(value, 10) || 0) : value;
    setEdits((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: num,
      },
    }));
  };

  const hasChanges = (product) => {
    const e = edits[product._id];
    if (!e) return false;
    return (
      (e.stock !== undefined && e.stock !== product.stock) ||
      (e.lowStockThreshold !== undefined && e.lowStockThreshold !== (product.lowStockThreshold ?? 10))
    );
  };

  const handleSave = async (product) => {
    const id = product._id;
    const { stock, lowStockThreshold } = getEdit(product);
    if (stock === product.stock && (product.lowStockThreshold ?? 10) === lowStockThreshold) {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    setSavingId(id);
    try {
      const res = await productAPI.update(id, { stock, lowStockThreshold });
      const updated = res.data.product;
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, ...updated } : p)));
      setEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.success('Inventory updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="text-primary-600" size={28} />
            Inventory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View and update product stock and low-stock thresholds.
          </p>
        </div>
        <button
          onClick={() => fetchProducts()}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 self-start sm:self-center"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or SKU..."
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={stockFilter}
          onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
          className="input w-44"
        >
          <option value="">All products</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="table-responsive">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Low stock at</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                        No products match your filters.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const { stock, lowStockThreshold } = getEdit(p);
                      const saving = savingId === p._id;
                      const changed = hasChanges(p);
                      return (
                        <tr key={p._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.thumbnail || p.images?.[0]?.url || PLACEHOLDER_IMG}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
                              />
                              <span className="font-medium text-gray-900 dark:text-white line-clamp-2">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.sku || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.category?.name || '—'}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              value={stock}
                              onChange={(e) => setEdit(p._id, 'stock', e.target.value)}
                              className="input w-20 py-1.5 text-center text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              value={lowStockThreshold}
                              onChange={(e) => setEdit(p._id, 'lowStockThreshold', e.target.value)}
                              className="input w-20 py-1.5 text-center text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <StockBadge stock={stock} lowStockThreshold={lowStockThreshold} />
                          </td>
                          <td className="px-4 py-3">
                            {(changed || saving) && (
                              <button
                                onClick={() => handleSave(p)}
                                disabled={saving}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
                              >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminInventoryPage;
