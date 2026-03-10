import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Bot, Upload, ImageIcon, Sparkles, Eye, Save, ArrowLeft, X, Plus, RefreshCw, CheckCircle, Tag, Info } from 'lucide-react';
import { productAPI, categoryAPI, aiAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Toggle from '../../components/common/Toggle';

const TABS = [
  { id: 'details', label: 'Product Details', icon: Tag },
  { id: 'ai', label: 'AI Analyze', icon: Bot },
  { id: 'seo', label: 'SEO & Meta', icon: Eye },
  { id: 'settings', label: 'Settings', icon: Info },
];

const emptyForm = {
  title: '', description: '', shortDescription: '', price: '', comparePrice: '',
  discount: 0, category: '', brand: '', sku: '', stock: 0, lowStockThreshold: 10,
  tags: [], isActive: true, isFeatured: false, isFlashDeal: false, flashDealExpiry: '',
  seo: { metaTitle: '', metaDescription: '', keywords: [], altText: '', slug: '' },
  attributes: { color: [], material: '', features: [] },
  aiGenerated: false, aiConfidenceScore: 0,
};

const AddEditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState('details');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setSEO = (key, value) => setForm(f => ({ ...f, seo: { ...f.seo, [key]: value } }));

  useEffect(() => {
    adminAPI.getSettings()
      .then(res => {
        const sym = res.data?.settings?.currency_symbol ?? res.data?.settings?.currencySymbol;
        if (sym) setCurrencySymbol(sym);
      })
      .catch(() => {});
  }, []);

  // Load categories + product data (if editing)
  useEffect(() => {
    categoryAPI.adminGetAll()
      .then(res => setCategories(res.data.categories || []))
      .catch(() => { });

    if (isEdit) {
      setLoading(true);
      productAPI.adminGetById(id)
        .then(res => {
          const p = res.data.product;
          setForm({
            title: p.title || '',
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            price: p.price != null ? String(p.price) : '',
            comparePrice: p.comparePrice != null ? String(p.comparePrice) : '',
            discount: p.discount || 0,
            category: p.category?._id || p.category || '',
            brand: p.brand || '',
            sku: p.sku || '',
            stock: p.stock || 0,
            lowStockThreshold: p.lowStockThreshold || 10,
            tags: p.tags || [],
            isActive: p.isActive !== undefined ? p.isActive : true,
            isFeatured: p.isFeatured || false,
            isFlashDeal: p.isFlashDeal || false,
            flashDealExpiry: p.flashDealExpiry
              ? new Date(p.flashDealExpiry).toISOString().slice(0, 16)
              : '',
            seo: {
              metaTitle: p.seo?.metaTitle || '',
              metaDescription: p.seo?.metaDescription || '',
              keywords: p.seo?.keywords || [],
              altText: p.seo?.altText || '',
              slug: p.seo?.slug || p.slug || '',
            },
            attributes: {
              color: p.attributes?.color || [],
              material: p.attributes?.material || '',
              features: p.attributes?.features || [],
            },
            aiGenerated: p.aiGenerated || false,
            aiConfidenceScore: p.aiConfidenceScore || 0,
          });
          if (p.images?.length) {
            setUploadedImages(p.images.map(img =>
              typeof img === 'string'
                ? { url: img }
                : { url: img.url, publicId: img.publicId }
            ));
          }
        })
        .catch(err => {
          toast.error(err.message || 'Failed to load product');
          navigate('/admin/products');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  // Drag-and-drop
  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    const preview = URL.createObjectURL(file);
    setUploadedImages(prev => [{ url: preview, file }, ...prev.filter(i => !i.file)]);
    setActiveTab('ai');
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await aiAPI.analyzeImage(formData);
      const { content, analysis, imageUrl } = res.data;
      setAiData({ analysis, confidence: analysis.confidenceScore });
      setForm(f => ({
        ...f,
        title: content.title || f.title,
        description: content.description || f.description,
        shortDescription: content.shortDescription || f.shortDescription,
        brand: content.brand || analysis.brand || f.brand,
        tags: content.tags || f.tags,
        seo: {
          metaTitle: content.seo?.metaTitle || f.seo.metaTitle,
          metaDescription: content.seo?.metaDescription || f.seo.metaDescription,
          keywords: content.seo?.keywords || f.seo.keywords,
          altText: content.seo?.altText || f.seo.altText,
          slug: content.seo?.slug || f.seo.slug,
        },
        attributes: {
          color: analysis.colors || [],
          material: analysis.material || '',
          features: content.bulletPoints || [],
        },
        price: content.suggestedPrice || f.price,
        aiGenerated: true,
        aiConfidenceScore: analysis.confidenceScore || 75,
      }));
      if (imageUrl) {
        setUploadedImages([{ url: imageUrl, publicId: res.data.imagePublicId }]);
      }
      toast.success('AI analysis complete! Review and edit the generated content.');
      setActiveTab('details');
    } catch (err) {
      toast.error(err.message || 'AI analysis failed. Check your API key in AI Settings.');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUploadImages = async () => {
    const toUpload = uploadedImages.filter(i => i.file);
    if (!toUpload.length) return uploadedImages;
    const formData = new FormData();
    toUpload.forEach(i => formData.append('images', i.file));
    try {
      const res = await productAPI.upload(formData);
      const cloudImages = res.data.images;
      const existing = uploadedImages.filter(i => !i.file);
      const merged = [...existing, ...cloudImages];
      setUploadedImages(merged);
      return merged;
    } catch {
      return uploadedImages;
    }
  };

  const handleSave = async (isActive = true) => {
    if (!form.title.trim() || !form.price || !form.category || !form.description.trim()) {
      toast.error('Title, Price, Category, and Description are required');
      setActiveTab('details');
      return;
    }
    setSaving(true);
    try {
      const finalImages = await handleUploadImages();
      const productData = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock: parseInt(form.stock),
        images: finalImages.map(i => ({
          url: i.url,
          alt: form.seo.altText || form.title,
          publicId: i.publicId || '',
        })),
        thumbnail: finalImages[0]?.url,
        isActive,
      };
      if (isEdit) {
        await productAPI.update(id, productData);
        toast.success('Product updated successfully!');
      } else {
        await productAPI.create(productData);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const TagInput = ({ tags, onChange, placeholder }) => {
    const [input, setInput] = useState('');
    const addTag = () => {
      const val = input.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        setInput('');
      }
    };
    return (
      <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 focus-within:ring-2 focus-within:ring-primary-500 bg-white dark:bg-gray-700">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2.5 py-1 rounded-full">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter((_, idx) => idx !== i))}><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            className="flex-1 text-sm outline-none bg-transparent dark:text-white"
            placeholder={placeholder || 'Add and press Enter...'}
          />
          <button type="button" onClick={addTag} className="text-primary-600 hover:text-primary-700">
            <Plus size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            {aiData && (
              <div className="flex items-center gap-2 mt-0.5">
                <Bot size={14} className="text-green-600" />
                <span className="text-xs text-green-600">AI Generated • Confidence: {aiData.confidence}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} disabled={saving}
            className="btn-secondary text-sm py-2.5 flex items-center gap-2">
            {saving ? <Loader size="sm" /> : <Save size={14} />}Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="btn-primary text-sm py-2.5 flex items-center gap-2">
            {saving ? <Loader size="sm" /> : <CheckCircle size={14} />}
            {isEdit ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
            <tab.icon size={15} />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <input value={form.title} onChange={e => setField('title', e.target.value)}
                      className="input" placeholder="Enter product title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Short Description</label>
                    <input value={form.shortDescription} onChange={e => setField('shortDescription', e.target.value)}
                      className="input" placeholder="Brief product description (shown in listings)" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Full Description <span className="text-red-500">*</span>
                    </label>
                    <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                      rows={6} className="input resize-none" placeholder="Detailed product description..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Key Features / Bullet Points</label>
                    <TagInput tags={form.attributes.features || []}
                      onChange={v => setForm(f => ({ ...f, attributes: { ...f.attributes, features: v } }))}
                      placeholder="Add feature and press Enter..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select value={form.category} onChange={e => setField('category', e.target.value)}
                        className="input bg-white dark:bg-gray-700">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Brand</label>
                      <input value={form.brand} onChange={e => setField('brand', e.target.value)}
                        className="input" placeholder="Brand name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Price ({currencySymbol}) <span className="text-red-500">*</span>
                      </label>
                      <input type="number" value={form.price} onChange={e => setField('price', e.target.value)}
                        className="input" placeholder="0.00" min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Compare Price ({currencySymbol})</label>
                      <input type="number" value={form.comparePrice} onChange={e => setField('comparePrice', e.target.value)}
                        className="input" placeholder="Original price" min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Discount (%)</label>
                      <input type="number" value={form.discount} onChange={e => setField('discount', e.target.value)}
                        className="input" min="0" max="100" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">SKU</label>
                      <input value={form.sku} onChange={e => setField('sku', e.target.value)}
                        className="input" placeholder="SKU-001" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Stock Quantity</label>
                      <input type="number" value={form.stock} onChange={e => setField('stock', e.target.value)}
                        className="input" min="0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Low Stock Alert</label>
                      <input type="number" value={form.lowStockThreshold} onChange={e => setField('lowStockThreshold', e.target.value)}
                        className="input" min="0" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Material</label>
                    <input value={form.attributes.material}
                      onChange={e => setForm(f => ({ ...f, attributes: { ...f.attributes, material: e.target.value } }))}
                      className="input" placeholder="e.g. Cotton, Plastic, Metal" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Tags</label>
                    <TagInput tags={form.tags} onChange={v => setField('tags', v)} placeholder="Add tag and press Enter..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
                <h2 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Sparkles className="text-primary-600" size={20} />AI Product Generator
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                  Upload a product image and AI will automatically generate title, description, SEO content, tags, and more.
                </p>
                <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}>
                  <input {...getInputProps()} />
                  {analyzing ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center animate-pulse">
                        <Bot size={32} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary-600">AI Analyzing Image...</p>
                        <p className="text-sm text-gray-500">Detecting product, generating content</p>
                      </div>
                      <Loader size="md" />
                    </div>
                  ) : uploadedImages.some(i => i.file) ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={uploadedImages.find(i => i.file)?.url} alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-xl shadow-md" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Image ready</p>
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={e => { e.stopPropagation(); setUploadedImages([]); }}
                          className="btn-secondary text-sm py-2">
                          <RefreshCw size={14} />Change Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={40} className="text-gray-400 mx-auto mb-3" />
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        {isDragActive ? 'Drop image here' : 'Drag & drop product image'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">or click to browse • JPG, PNG, WebP up to 10MB</p>
                      <p className="text-xs text-primary-500 mt-3">✨ AI will auto-generate all product details</p>
                    </>
                  )}
                </div>
              </div>
              {aiData && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-green-200 dark:border-green-900 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-500" />AI Analysis Results
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Product Type', value: aiData.analysis?.productType },
                      { label: 'Brand', value: aiData.analysis?.brand || 'Not detected' },
                      { label: 'Category', value: aiData.analysis?.category },
                      { label: 'Colors', value: aiData.analysis?.colors?.join(', ') || 'N/A' },
                      { label: 'Material', value: aiData.analysis?.material || 'N/A' },
                      { label: 'Confidence', value: `${aiData.confidence}%` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="font-medium text-gray-800 dark:text-white mt-0.5">{value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setActiveTab('details')}
                    className="btn-primary w-full mt-4 text-sm">Review Generated Content →</button>
                </div>
              )}
            </div>
          )}

          {/* SEO TAB */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">SEO & Meta Information</h2>
                <div className="space-y-4">
                  {[
                    { key: 'metaTitle', label: 'Meta Title', placeholder: 'SEO optimized title (50-60 chars)', max: 60 },
                    { key: 'slug', label: 'URL Slug', placeholder: 'product-url-slug' },
                    { key: 'altText', label: 'Image Alt Text', placeholder: 'Descriptive alt text for product image' },
                  ].map(({ key, label, placeholder, max }) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        {max && <span className={`text-xs ${(form.seo[key] || '').length > max ? 'text-red-500' : 'text-gray-400'}`}>
                          {(form.seo[key] || '').length}/{max}
                        </span>}
                      </div>
                      <input value={form.seo[key]} onChange={e => setSEO(key, e.target.value)}
                        className="input" placeholder={placeholder} />
                    </div>
                  ))}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                      <span className={`text-xs ${(form.seo.metaDescription || '').length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                        {(form.seo.metaDescription || '').length}/160
                      </span>
                    </div>
                    <textarea value={form.seo.metaDescription} onChange={e => setSEO('metaDescription', e.target.value)}
                      rows={3} className="input resize-none" placeholder="SEO meta description (150-160 chars)" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Keywords</label>
                    <TagInput tags={form.seo.keywords || []} onChange={v => setSEO('keywords', v)}
                      placeholder="Add keyword and press Enter..." />
                  </div>
                </div>
                {(form.seo.metaTitle || form.title) && (
                  <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">SERP Preview</p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <p className="text-blue-600 text-lg font-medium hover:underline cursor-pointer line-clamp-1">
                        {form.seo.metaTitle || form.title}
                      </p>
                      <p className="text-green-600 text-xs mt-0.5">
                        Wellness_fuel.com/product/{form.seo.slug || 'product-name'}
                      </p>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {form.seo.metaDescription || form.shortDescription || form.description?.substring(0, 160)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Product Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'isActive', label: 'Active / Published', desc: 'Make product visible to customers' },
                    { key: 'isFeatured', label: 'Featured Product', desc: 'Show in featured section on homepage' },
                    { key: 'isFlashDeal', label: 'Flash Deal', desc: 'Mark as flash/limited-time deal' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                      </div>
                      <Toggle checked={!!form[key]} onChange={() => setField(key, !form[key])} aria-label={label} />
                    </div>
                  ))}
                  {form.isFlashDeal && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Flash Deal Expiry</label>
                      <input type="datetime-local" value={form.flashDealExpiry}
                        onChange={e => setField('flashDealExpiry', e.target.value)} className="input" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Image Gallery */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ImageIcon size={18} />Product Images
            </h3>
            {uploadedImages.length > 0 ? (
              <div className="space-y-2">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img.url} alt={`Product ${i + 1}`} className="w-full h-40 object-cover rounded-xl" />
                    {i === 0 && <span className="absolute top-2 left-2 badge bg-primary-600 text-white text-xs">Main</span>}
                    <button type="button"
                      onClick={() => setUploadedImages(imgs => imgs.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div {...getRootProps()} className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-4 text-center cursor-pointer hover:border-primary-400 transition-colors mt-2">
                  <input {...getInputProps()} />
                  <p className="text-xs text-gray-400">+ Add more images</p>
                </div>
              </div>
            ) : (
              <div {...getRootProps()} className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                <input {...getInputProps()} />
                <ImageIcon size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Drop images or click to upload</p>
              </div>
            )}
          </div>

          {/* Preview Card */}
          {(form.title || uploadedImages.length > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Product Preview</h3>
              <div className="card hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                  {uploadedImages.length > 0 ? (
                    <img src={uploadedImages[0].url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400">{categories.find(c => c._id === form.category)?.name}</p>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-2 mt-0.5">
                    {form.title || 'Product Title'}
                  </p>
                  <p className="font-bold text-primary-600 mt-1">{currencySymbol}{parseFloat(form.price || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditProductPage;
