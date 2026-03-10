import { useState, useEffect, useRef } from 'react';
import { Award, Plus, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import { brandAPI, adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import Toggle from '../../components/common/Toggle';
import toast from 'react-hot-toast';

const BRAND_PLACEHOLDER = 'https://via.placeholder.com/200/fbbf24/1e1b4b?text=Brand';
const defaultForm = { name: '', description: '', image: '', isActive: true, order: 0 };

const AdminBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'brand');
      const res = await adminAPI.uploadSiteAsset(formData);
      setForm((f) => ({ ...f, image: res.data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await brandAPI.adminGetAll();
      setBrands(res.data.brands);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(defaultForm);
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (b) => {
    setForm({
      name: b.name,
      description: b.description || '',
      image: b.image || '',
      isActive: b.isActive,
      order: b.order || 0,
    });
    setEditItem(b);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        const brandId = editItem._id || editItem.id;
        if (!brandId) {
          toast.error('Brand could not be identified. Please close and try again.');
          return;
        }
        await brandAPI.update(brandId, form);
        toast.success('Brand updated!');
      } else {
        await brandAPI.create(form);
        toast.success('Brand created!');
      }
      setShowModal(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const brandId = deleteItem._id || deleteItem.id;
    if (!brandId) {
      toast.error('Brand could not be identified.');
      setDeleteItem(null);
      return;
    }
    try {
      await brandAPI.delete(brandId);
      toast.success('Brand deleted');
      setDeleteItem(null);
      fetchBrands();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="text-primary-600" size={26} /> Brands
        </h1>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 flex items-center gap-2">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader size="md" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => (
            <div
              key={b._id}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border-2 transition-all ${
                b.isActive ? 'border-gray-100 dark:border-gray-800' : 'border-red-100 dark:border-red-900/50 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
                    <img
                      src={b.image || BRAND_PLACEHOLDER}
                      alt={b.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = BRAND_PLACEHOLDER;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{b.name}</h3>
                  </div>
                </div>
                <span
                  className={`badge text-xs ${
                    b.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              {b.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{b.description}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-medium"
                >
                  <Edit size={12} /> Edit
                </button>
                <button
                  onClick={() => setDeleteItem(b)}
                  className="flex items-center gap-1.5 text-xs py-2 px-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors font-medium"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Brand' : 'New Brand'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Brand Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              placeholder="e.g. Nike, Samsung"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Brand Image (1:1)</label>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <img
                  src={form.image || BRAND_PLACEHOLDER}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = BRAND_PLACEHOLDER;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="btn-secondary text-sm py-2 flex items-center gap-2"
                >
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploadingImage ? 'Uploading…' : 'Upload image'}
                </button>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: '' }))}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Remove image
                  </button>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Square image for this brand.</p>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="input resize-none"
              placeholder="Brand description..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Sort Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
              className="input"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Visible to customers</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle to show/hide this brand</p>
            </div>
            <Toggle checked={form.isActive} onChange={() => setForm((f) => ({ ...f, isActive: !f.isActive }))} aria-label="Visible to customers" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader size="sm" /> : editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Delete "${deleteItem?.name}"? Products with this brand won't be deleted.`}
        confirmLabel="Delete"
        isDanger
      />
    </div>
  );
};

export default AdminBrandsPage;
