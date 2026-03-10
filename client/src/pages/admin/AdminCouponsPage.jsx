import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';
import { couponAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import Toggle from '../../components/common/Toggle';
import toast from 'react-hot-toast';

const defaultForm = { code: '', type: 'percentage', value: '', minOrderAmount: 0, maxDiscount: '', usageLimit: '', userLimit: 1, expiresAt: '', description: '', isActive: true, isFirstOrderOnly: false };

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCoupons(); }, [page]);

  const fetchCoupons = async () => {
    setLoading(true);
    try { const res = await couponAPI.getAll({ page, limit: 20 }); setCoupons(res.data.coupons); setPagination(res.data.pagination); }
    catch {} finally { setLoading(false); }
  };

  const openCreate = () => { setForm(defaultForm); setEditItem(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ code: c.code, type: c.type, value: c.value, minOrderAmount: c.minOrderAmount, maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '', userLimit: c.userLimit, expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '', description: c.description || '', isActive: c.isActive, isFirstOrderOnly: c.isFirstOrderOnly }); setEditItem(c); setShowModal(true); };

  const handleSave = async () => {
    if (!form.code || !form.value || !form.expiresAt) { toast.error('Code, value, and expiry are required'); return; }
    setSaving(true);
    try {
      if (editItem) { await couponAPI.update(editItem._id, form); toast.success('Coupon updated!'); }
      else { await couponAPI.create(form); toast.success('Coupon created!'); }
      setShowModal(false);
      fetchCoupons();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await couponAPI.delete(deleteItem._id); toast.success('Coupon deleted'); setDeleteItem(null); fetchCoupons(); }
    catch (err) { toast.error(err.message); }
  };

  const typeLabel = { percentage: '%', fixed: '₹', free_shipping: 'Free Shipping' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Tag className="text-primary-600" size={26} />Coupons</h1>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 flex items-center gap-2"><Plus size={16} />Create Coupon</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><Loader /></div> : (
          <div className="table-responsive">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Code', 'Type', 'Value', 'Used / Limit', 'Expires', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">No coupons yet</td></tr> :
                  coupons.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><span className="font-mono font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">{c.code}</span></td>
                      <td className="px-4 py-3 capitalize text-gray-600">{c.type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 font-semibold">{c.type === 'free_shipping' ? 'FREE' : `${typeLabel[c.type]}${c.value}`}</td>
                      <td className="px-4 py-3 text-gray-600">{c.usageCount} / {c.usageLimit || '∞'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.expiresAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${c.isActive && new Date(c.expiresAt) > new Date() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {c.isActive && new Date(c.expiresAt) > new Date() ? 'Active' : 'Expired/Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-primary-50 text-primary-600 rounded-lg"><Edit size={14} /></button>
                          <button onClick={() => setDeleteItem(c)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination currentPage={page} totalPages={pagination?.pages || 1} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Coupon' : 'Create Coupon'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Coupon Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="input font-mono" placeholder="SAVE20" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Type *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input bg-white">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            {form.type !== 'free_shipping' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Value *</label>
                <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="input" placeholder={form.type === 'percentage' ? '20 (%)' : '100 (₹)'} />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Min Order (₹)</label>
              <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} className="input" placeholder="0" />
            </div>
            {form.type === 'percentage' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Max Discount (₹)</label>
                <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="input" placeholder="Optional cap" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="input" placeholder="Unlimited" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Per User Limit</label>
              <input type="number" value={form.userLimit} onChange={e => setForm(f => ({ ...f, userLimit: e.target.value }))} className="input" placeholder="1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date *</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" placeholder="Internal description" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-800">Active</span>
            <Toggle checked={form.isActive} onChange={() => setForm(f => ({ ...f, isActive: !f.isActive }))} aria-label="Coupon active" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader size="sm" /> : editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        title="Delete Coupon" message={`Delete coupon "${deleteItem?.code}"?`} confirmLabel="Delete" isDanger />
    </div>
  );
};

export default AdminCouponsPage;
