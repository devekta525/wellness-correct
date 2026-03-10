import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  ChevronDown,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { productAPI, categoryAPI, adminAPI } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const LIMIT = 15;

  useEffect(() => {
    adminAPI.getSettings().then((res) => {
      const sym = res.data?.settings?.currency_symbol ?? res.data?.settings?.currencySymbol;
      if (sym) setCurrencySymbol(sym);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter !== '') params.status = statusFilter === 'true' ? 'active' : 'inactive';
      const res = await productAPI.adminGetAll(params);
      setProducts(res.data.products || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotalItems(res.data.pagination?.total || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    categoryAPI.adminGetAll().then((res) => setCategories(res.data.categories || [])).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await productAPI.delete(deleteTarget._id);
      toast.success('Product deleted successfully');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    try {
      const isActive = bulkAction === 'activate';
      await Promise.all(selectedIds.map((id) => productAPI.update(id, { isActive })));
      toast.success(`${selectedIds.length} products ${isActive ? 'activated' : 'deactivated'}`);
      setSelectedIds([]);
      setBulkAction('');
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Bulk action failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">{totalItems} products total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white cursor-pointer min-w-[140px]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white cursor-pointer min-w-[120px]"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {selectedIds.length} selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            >
              <option value="">Bulk Action</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="table-responsive">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3.5 text-left w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3.5 text-left">Product</th>
                <th className="px-4 py-3.5 text-left">Category</th>
                <th className="px-4 py-3.5 text-left">Price</th>
                <th className="px-4 py-3.5 text-left">Stock</th>
                <th className="px-4 py-3.5 text-left">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3.5"><Skeleton className="w-4 h-4" /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3.5 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><Skeleton className="h-3.5 w-20" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-3.5 w-16" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-3.5 w-12" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Package}
                      title="No products found"
                      description="Try adjusting your search or filters."
                      actionLabel="Add Product"
                      onAction={() => navigate('/admin/products/new')}
                    />
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                      selectedIds.includes(product._id) ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {(product.thumbnail || product.images?.[0]?.url) ? (
                          <img
                            src={product.thumbnail || product.images?.[0]?.url}
                            alt={product.title}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-400">{product.brand || product.sku || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {currencySymbol}{Number(product.price).toFixed(2)}
                        </span>
                        {product.comparePrice > product.price && (
                          <span className="text-xs text-gray-400 line-through ml-1.5">
                            {currencySymbol}{Number(product.comparePrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-medium ${
                        product.stock <= 5
                          ? 'text-red-600 dark:text-red-400'
                          : product.stock <= product.lowStockThreshold
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge isActive={product.isActive} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await productAPI.update(product._id, { isActive: !product.isActive });
                              toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
                              fetchProducts();
                            } catch (err) {
                              toast.error(err.message);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {product.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminProductsPage;
