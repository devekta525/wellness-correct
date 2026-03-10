import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Eye, Search, Loader2,
  Save, X, Image, Link2, Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Quote, Code, Minus,
  RotateCcw, RotateCw, Tag, Globe, FileText, ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import { blogAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Rich Text Editor ────────────────────────────────────────────────────────
const ToolbarBtn = ({ onClick, active, title, children, className = '' }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-all
      ${active ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
      ${className}`}>
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-gray-200 mx-0.5" />;

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  // Only sync from external when value changes & editor is not focused
  useEffect(() => {
    if (!editorRef.current) return;
    if (document.activeElement === editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const isActive = (cmd) => {
    try { return document.queryCommandState(cmd); }
    catch { return false; }
  };

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  const insertHR = () => exec('insertHorizontalRule');

  const formatBlock = (tag) => exec('formatBlock', tag);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">

        {/* Undo / Redo */}
        <ToolbarBtn title="Undo" onClick={() => exec('undo')}><RotateCcw size={13} /></ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => exec('redo')}><RotateCw size={13} /></ToolbarBtn>
        <Divider />

        {/* Headings */}
        <ToolbarBtn title="Heading 1" onClick={() => formatBlock('h1')}><Heading1 size={14} /></ToolbarBtn>
        <ToolbarBtn title="Heading 2" onClick={() => formatBlock('h2')}><Heading2 size={14} /></ToolbarBtn>
        <ToolbarBtn title="Heading 3" onClick={() => formatBlock('h3')}><Heading3 size={14} /></ToolbarBtn>
        <ToolbarBtn title="Paragraph" onClick={() => formatBlock('p')} className="text-xs font-semibold">P</ToolbarBtn>
        <Divider />

        {/* Inline formatting */}
        <ToolbarBtn title="Bold" active={isActive('bold')} onClick={() => exec('bold')}><Bold size={13} /></ToolbarBtn>
        <ToolbarBtn title="Italic" active={isActive('italic')} onClick={() => exec('italic')}><Italic size={13} /></ToolbarBtn>
        <ToolbarBtn title="Underline" active={isActive('underline')} onClick={() => exec('underline')}><UnderlineIcon size={13} /></ToolbarBtn>
        <ToolbarBtn title="Strikethrough" active={isActive('strikeThrough')} onClick={() => exec('strikeThrough')} className="text-xs line-through font-bold">S</ToolbarBtn>
        <ToolbarBtn title="Inline Code" onClick={() => exec('insertHTML', `<code>${window.getSelection()?.toString() || 'code'}</code>`)}><Code size={13} /></ToolbarBtn>
        <Divider />

        {/* Lists */}
        <ToolbarBtn title="Bullet List" active={isActive('insertUnorderedList')} onClick={() => exec('insertUnorderedList')}><List size={14} /></ToolbarBtn>
        <ToolbarBtn title="Numbered List" active={isActive('insertOrderedList')} onClick={() => exec('insertOrderedList')}><ListOrdered size={14} /></ToolbarBtn>
        <ToolbarBtn title="Blockquote" onClick={() => formatBlock('blockquote')}><Quote size={13} /></ToolbarBtn>
        <Divider />

        {/* Alignment */}
        <ToolbarBtn title="Align Left" active={isActive('justifyLeft')} onClick={() => exec('justifyLeft')}><AlignLeft size={13} /></ToolbarBtn>
        <ToolbarBtn title="Align Center" active={isActive('justifyCenter')} onClick={() => exec('justifyCenter')}><AlignCenter size={13} /></ToolbarBtn>
        <ToolbarBtn title="Align Right" active={isActive('justifyRight')} onClick={() => exec('justifyRight')}><AlignRight size={13} /></ToolbarBtn>
        <Divider />

        {/* Insert */}
        <ToolbarBtn title="Insert Link" onClick={insertLink}><Link2 size={13} /></ToolbarBtn>
        <ToolbarBtn title="Insert Image" onClick={insertImage}><Image size={13} /></ToolbarBtn>
        <ToolbarBtn title="Horizontal Rule" onClick={insertHR}><Minus size={13} /></ToolbarBtn>
        <Divider />

        {/* Text color */}
        <div className="flex items-center gap-0.5" title="Text Color">
          <span className="text-xs text-gray-500 ml-1 mr-0.5">Color</span>
          <input
            type="color"
            className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0.5"
            onChange={e => exec('foreColor', e.target.value)}
          />
        </div>

        {/* Highlight */}
        <div className="flex items-center gap-0.5" title="Highlight">
          <span className="text-xs text-gray-500 ml-1 mr-0.5">Bg</span>
          <input
            type="color"
            defaultValue="#fef08a"
            className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0.5"
            onChange={e => exec('hiliteColor', e.target.value)}
          />
        </div>
        <Divider />

        {/* Remove formatting */}
        <ToolbarBtn title="Clear Formatting" onClick={() => exec('removeFormat')}
          className="text-[10px] font-bold text-red-400 hover:text-red-600">Tx</ToolbarBtn>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Start writing your article here…"
        className="min-h-[400px] p-6 text-gray-800 text-sm leading-7 focus:outline-none
          [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-6
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h2]:mt-5
          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:mb-2 [&_h3]:mt-4
          [&_p]:mb-4 [&_p]:leading-7
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary-400 [&_blockquote]:bg-primary-50 [&_blockquote]:px-5 [&_blockquote]:py-2 [&_blockquote]:rounded-r-xl [&_blockquote]:my-4 [&_blockquote]:text-gray-600 [&_blockquote]:italic
          [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-pink-600
          [&_a]:text-primary-600 [&_a]:underline
          [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_img]:shadow
          [&_hr]:border-gray-200 [&_hr]:my-6
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
      />

      {/* Word count */}
      <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {(value || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-xs text-gray-400">Rich Text Editor</span>
      </div>
    </div>
  );
};

// ─── Blog Form ───────────────────────────────────────────────────────────────
const BlogForm = ({ blog, onSave, onCancel }) => {
  const isEdit = !!blog?._id;
  const [form, setForm] = useState({
    title: blog?.title || '',
    slug: blog?.slug || '',
    content: blog?.content || '',
    excerpt: blog?.excerpt || '',
    coverImage: blog?.coverImage || '',
    category: blog?.category || '',
    tags: blog?.tags?.join(', ') || '',
    status: blog?.status || 'draft',
    seo: { metaTitle: blog?.seo?.metaTitle || '', metaDescription: blog?.seo?.metaDescription || '', keywords: blog?.seo?.keywords?.join(', ') || '' },
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // content | seo

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setSeo = (k, v) => setForm(p => ({ ...p, seo: { ...p.seo, [k]: v } }));

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && form.title && !form.slug) {
      const s = form.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
      set('slug', s);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.content.trim() || form.content === '<br>') return toast.error('Content is required');

    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      seo: { ...form.seo, keywords: form.seo.keywords.split(',').map(k => k.trim()).filter(Boolean) },
    };

    try {
      if (isEdit) {
        await blogAPI.update(blog._id, payload);
        toast.success('Blog updated!');
      } else {
        await blogAPI.create(payload);
        toast.success('Blog created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all';
  const labelCls = 'block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5';

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft size={16} />Back
        </button>
        <h1 className="text-xl font-black text-gray-900">{isEdit ? 'Edit Article' : 'Write New Article'}</h1>
        <div className="ml-auto flex items-center gap-2">
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : (isEdit ? 'Update' : 'Publish')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Title + Editor */}
        <div className="xl:col-span-2 space-y-5">
          <div>
            <input
              className="w-full text-2xl font-black text-gray-900 border-b-2 border-gray-100 focus:border-primary-400 pb-3 focus:outline-none bg-transparent placeholder:text-gray-300 transition-colors"
              placeholder="Article title…"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[{ id: 'content', label: 'Content', icon: FileText }, { id: 'seo', label: 'SEO', icon: Globe }].map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors
                  ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                <tab.icon size={14} />{tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'content' && (
            <RichTextEditor value={form.content} onChange={v => set('content', v)} />
          )}

          {activeTab === 'seo' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-gray-900">SEO Settings</h3>
              <div>
                <label className={labelCls}>Meta Title</label>
                <input className={inputCls} value={form.seo.metaTitle} onChange={e => setSeo('metaTitle', e.target.value)} placeholder="SEO title (leave blank to use article title)" />
              </div>
              <div>
                <label className={labelCls}>Meta Description</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.seo.metaDescription} onChange={e => setSeo('metaDescription', e.target.value)} placeholder="SEO description (150–160 characters recommended)" />
              </div>
              <div>
                <label className={labelCls}>Keywords (comma-separated)</label>
                <input className={inputCls} value={form.seo.keywords} onChange={e => setSeo('keywords', e.target.value)} placeholder="wellness, nutrition, health" />
              </div>
              <div>
                <label className={labelCls}>Excerpt</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Short summary shown in blog list (auto-generated if left blank)" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Meta sidebar */}
        <div className="space-y-5">

          {/* Slug */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className={labelCls}>URL Slug</label>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <span className="text-xs text-gray-400 shrink-0">/blog/</span>
              <input
                className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none"
                value={form.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="article-url-slug"
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className={labelCls}>Cover Image</label>
            {form.coverImage && (
              <div className="relative mb-3 rounded-xl overflow-hidden aspect-video bg-gray-100">
                <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button type="button" onClick={() => set('coverImage', '')}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                  <X size={12} />
                </button>
              </div>
            )}
            <input
              className={inputCls}
              value={form.coverImage}
              onChange={e => set('coverImage', e.target.value)}
              placeholder="Paste image URL or upload via Cloudinary"
            />
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className={labelCls}>Category</label>
            <input className={inputCls} value={form.category} onChange={e => set('category', e.target.value)} placeholder="General" list="blog-cats" />
            <datalist id="blog-cats">
              {['General', 'Nutrition', 'Fitness', 'Wellness', 'Science', 'Recipes', 'Lifestyle'].map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className={labelCls}>Tags <span className="normal-case font-normal text-gray-400">(comma-separated)</span></label>
            <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="collagen, protein, immunity" />
          </div>

          {/* Preview */}
          {form.slug && (
            <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 justify-center w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors">
              <ExternalLink size={13} />Preview on site
            </a>
          )}
        </div>
      </form>
    </div>
  );
};

// ─── Blog List ───────────────────────────────────────────────────────────────
const AdminBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState('list'); // list | form
  const [editingBlog, setEditingBlog] = useState(null);

  const fetchBlogs = (page = 1) => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (statusFilter) params.status = statusFilter;
    blogAPI.adminGetAll(params)
      .then(r => { setBlogs(r.data.blogs); setPagination(r.data.pagination); })
      .catch(() => toast.error('Failed to load blogs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBlogs(1); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await blogAPI.delete(id);
      toast.success('Deleted');
      fetchBlogs(pagination.page);
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = async (id) => {
    try {
      const r = await blogAPI.adminGetById(id);
      setEditingBlog(r.data.blog);
      setView('form');
    } catch { toast.error('Failed to load blog'); }
  };

  const handleSave = () => {
    setView('list');
    setEditingBlog(null);
    fetchBlogs(1);
  };

  if (view === 'form') {
    return <BlogForm blog={editingBlog} onSave={handleSave} onCancel={() => { setView('list'); setEditingBlog(null); }} />;
  }

  const filtered = search
    ? blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()))
    : blogs;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total articles</p>
        </div>
        <button onClick={() => { setEditingBlog(null); setView('form'); }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} />New Article
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No articles found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Article</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Author</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Views</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(blog => (
                <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {blog.coverImage ? (
                        <img src={blog.coverImage} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{blog.title}</p>
                        <p className="text-xs text-gray-400">{blog.readTime} min read</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      <Tag size={8} />{blog.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-gray-500">{blog.author?.name || '—'}</td>
                  <td className="px-4 py-4 hidden lg:table-cell text-gray-500">{blog.views}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${blog.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {blog.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                        <Eye size={15} />
                      </a>
                      <button onClick={() => handleEdit(blog._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(blog._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => fetchBlogs(i + 1)}
                  className={`w-8 h-8 rounded-full text-sm font-semibold transition-all ${pagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBlogsPage;
