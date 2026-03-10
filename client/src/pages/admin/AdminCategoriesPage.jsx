import { useState, useEffect, useRef } from 'react';
import { FolderOpen, Plus, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import { categoryAPI, adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import Toggle from '../../components/common/Toggle';
import toast from 'react-hot-toast';

const CATEGORY_PLACEHOLDER = 'https://via.placeholder.com/200/c4b5fd/1e1b4b?text=Category';
const defaultForm = { name: '', description: '', image: '', icon: '', parent: '', isActive: true, order: 0 };

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'category');
      const res = await adminAPI.uploadSiteAsset(formData);
      setForm(f => ({ ...f, image: res.data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try { const res = await categoryAPI.adminGetAll(); setCategories(res.data.categories); }
    catch {} finally { setLoading(false); }
  };

  const openCreate = () => { setForm(defaultForm); setEditItem(null); setShowModal(true); };
  const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description || '', image: cat.image || '', icon: cat.icon || '', parent: cat.parent?._id || '', isActive: cat.isActive, order: cat.order || 0 }); setEditItem(cat); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editItem) {
        const categoryId = editItem._id || editItem.id;
        if (!categoryId) {
          toast.error('Category could not be identified. Please close and try again.');
          return;
        }
        await categoryAPI.update(categoryId, form);
        toast.success('Category updated!');
      } else {
        await categoryAPI.create(form);
        toast.success('Category created!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    const categoryId = deleteItem._id || deleteItem.id;
    if (!categoryId) { toast.error('Category could not be identified.'); setDeleteItem(null); return; }
    try { await categoryAPI.delete(categoryId); toast.success('Category deleted'); setDeleteItem(null); fetchCategories(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FolderOpen className="text-primary-600" size={26} />Categories</h1>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 flex items-center gap-2"><Plus size={16} />Add Category</button>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader size="md" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${cat.isActive ? 'border-gray-100' : 'border-red-100 opacity-70'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                    <img src={cat.image || CATEGORY_PLACEHOLDER} alt={cat.name} className="w-full h-full object-cover" onError={e => { e.target.onerror = null; e.target.src = CATEGORY_PLACEHOLDER; }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{cat.name}</h3>
                    {cat.parent && <p className="text-xs text-gray-400">Under: {cat.parent.name}</p>}
                  </div>
                </div>
                <span className={`badge text-xs ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {cat.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              {cat.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cat.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors font-medium">
                  <Edit size={12} />Edit
                </button>
                <button onClick={() => setDeleteItem(cat)} className="flex items-center gap-1.5 text-xs py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Category' : 'New Category'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Electronics, Fashion..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category Image (1:1)</label>
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={form.image || CATEGORY_PLACEHOLDER} alt="" className="w-full h-full object-cover" onError={e => { e.target.onerror = null; e.target.src = CATEGORY_PLACEHOLDER; }} />
              </div>
              <div className="flex-1 min-w-0">
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="btn-secondary text-sm py-2 flex items-center gap-2">
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploadingImage ? 'Uploading…' : 'Upload image'}
                </button>
                {form.image && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))} className="mt-2 text-xs text-red-600 hover:underline">
                    Remove image
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-1">Square image for this category. A placeholder is used if no image is set.</p>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input resize-none" placeholder="Category description..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Parent Category</label>
              <select value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))} className="input bg-white text-sm">
                <option value="">No parent (top-level)</option>
                {categories.filter(c => !editItem || c._id !== editItem._id).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sort Order</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) }))} className="input" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div><p className="font-medium text-gray-800 text-sm">Visible to customers</p><p className="text-xs text-gray-500">Toggle to show/hide this category</p></div>
            <Toggle checked={form.isActive} onChange={() => setForm(f => ({ ...f, isActive: !f.isActive }))} aria-label="Visible to customers" />
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
        title="Delete Category" message={`Delete "${deleteItem?.name}"? Products in this category won't be deleted.`}
        confirmLabel="Delete" isDanger />
    </div>
  );
};

export default AdminCategoriesPage;
