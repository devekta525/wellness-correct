import { useState, useEffect, useCallback } from 'react';
import {
  Shield, FileText, RefreshCcw, HelpCircle,
  Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Eye, EyeOff, ExternalLink,
} from 'lucide-react';
import { legalAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const PAGES = [
  { key: 'privacy_policy',  label: 'Privacy Policy',    icon: Shield,      color: 'blue',   path: '/privacy-policy' },
  { key: 'terms',           label: 'Terms & Conditions', icon: FileText,    color: 'gray',   path: '/terms' },
  { key: 'return_policy',   label: 'Return Policy',      icon: RefreshCcw,  color: 'emerald', path: '/return-policy' },
  { key: 'faq',             label: 'FAQ',                icon: HelpCircle,  color: 'amber',  path: '/faq' },
];

const COLOR_MAP = {
  blue:    { tab: 'border-blue-600 text-blue-600',    badge: 'bg-blue-50 text-blue-700',    btn: 'bg-blue-600 hover:bg-blue-700' },
  gray:    { tab: 'border-gray-700 text-gray-700',    badge: 'bg-gray-100 text-gray-700',   btn: 'bg-gray-800 hover:bg-gray-900' },
  emerald: { tab: 'border-emerald-600 text-emerald-600', badge: 'bg-emerald-50 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  amber:   { tab: 'border-amber-500 text-amber-600',  badge: 'bg-amber-50 text-amber-700',  btn: 'bg-amber-500 hover:bg-amber-600' },
};

const genId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// ─── Section Editor (for Privacy / Terms / Return Policy) ────────────────────
const SectionEditor = ({ content, onChange }) => {
  const sections = content.sections || [];

  const addSection = () => {
    onChange({
      ...content,
      sections: [...sections, { id: genId(), heading: 'New Section', content: '' }],
    });
  };

  const updateSection = (idx, field, val) => {
    const updated = sections.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    onChange({ ...content, sections: updated });
  };

  const removeSection = (idx) => {
    onChange({ ...content, sections: sections.filter((_, i) => i !== idx) });
  };

  const moveSection = (idx, dir) => {
    const arr = [...sections];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    onChange({ ...content, sections: arr });
  };

  return (
    <div className="space-y-4">
      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Page Title</label>
          <input
            className="input text-sm"
            value={content.title || ''}
            onChange={e => onChange({ ...content, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Last Updated</label>
          <input
            className="input text-sm"
            value={content.lastUpdated || ''}
            placeholder="e.g. March 10, 2026"
            onChange={e => onChange({ ...content, lastUpdated: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Introduction Text</label>
        <textarea
          rows={3}
          className="input text-sm resize-none"
          value={content.intro || ''}
          placeholder="Brief intro shown at the top of the page..."
          onChange={e => onChange({ ...content, intro: e.target.value })}
        />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Sections ({sections.length})</h3>
          <button
            onClick={addSection}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Plus size={15} /> Add Section
          </button>
        </div>

        {sections.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
            No sections yet. Click "Add Section" to get started.
          </div>
        )}

        {sections.map((section, idx) => (
          <SectionCard
            key={section.id}
            section={section}
            idx={idx}
            total={sections.length}
            onChange={(f, v) => updateSection(idx, f, v)}
            onRemove={() => removeSection(idx)}
            onMove={(dir) => moveSection(idx, dir)}
          />
        ))}
      </div>
    </div>
  );
};

const SectionCard = ({ section, idx, total, onChange, onRemove, onMove }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <GripVertical size={16} className="text-gray-400 cursor-grab flex-shrink-0" />
        <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
        <span className="flex-1 font-semibold text-gray-800 text-sm truncate">{section.heading || 'Untitled'}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors" title="Move up">
            <ChevronUp size={14} />
          </button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors" title="Move down">
            <ChevronDown size={14} />
          </button>
          <button onClick={() => setCollapsed(c => !c)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            {collapsed ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Heading</label>
            <input
              className="input text-sm"
              value={section.heading}
              onChange={e => onChange('heading', e.target.value)}
              placeholder="Section heading..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Content</label>
            <textarea
              rows={5}
              className="input text-sm resize-none"
              value={section.content}
              onChange={e => onChange('content', e.target.value)}
              placeholder="Write section content here..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── FAQ Editor ───────────────────────────────────────────────────────────────
const FaqEditor = ({ content, onChange }) => {
  const categories = content.categories || [];
  const [activeCat, setActiveCat] = useState(categories[0]?.id || null);

  const addCategory = () => {
    const newCat = { id: genId(), name: 'New Category', items: [] };
    const updated = [...categories, newCat];
    onChange({ ...content, categories: updated });
    setActiveCat(newCat.id);
  };

  const updateCategory = (catIdx, field, val) => {
    const updated = categories.map((c, i) => i === catIdx ? { ...c, [field]: val } : c);
    onChange({ ...content, categories: updated });
  };

  const removeCategory = (catIdx) => {
    const updated = categories.filter((_, i) => i !== catIdx);
    onChange({ ...content, categories: updated });
    setActiveCat(updated[0]?.id || null);
  };

  const addQuestion = (catIdx) => {
    const updated = categories.map((c, i) => {
      if (i !== catIdx) return c;
      return { ...c, items: [...(c.items || []), { id: genId(), question: '', answer: '' }] };
    });
    onChange({ ...content, categories: updated });
  };

  const updateQuestion = (catIdx, qIdx, field, val) => {
    const updated = categories.map((c, i) => {
      if (i !== catIdx) return c;
      const items = c.items.map((q, j) => j === qIdx ? { ...q, [field]: val } : q);
      return { ...c, items };
    });
    onChange({ ...content, categories: updated });
  };

  const removeQuestion = (catIdx, qIdx) => {
    const updated = categories.map((c, i) => {
      if (i !== catIdx) return c;
      return { ...c, items: c.items.filter((_, j) => j !== qIdx) };
    });
    onChange({ ...content, categories: updated });
  };

  const currentCatIdx = categories.findIndex(c => c.id === activeCat);
  const currentCat = categories[currentCatIdx];

  return (
    <div className="space-y-4">
      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Page Title</label>
          <input
            className="input text-sm"
            value={content.title || ''}
            onChange={e => onChange({ ...content, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Last Updated</label>
          <input
            className="input text-sm"
            value={content.lastUpdated || ''}
            placeholder="e.g. March 10, 2026"
            onChange={e => onChange({ ...content, lastUpdated: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Introduction Text</label>
        <textarea
          rows={2}
          className="input text-sm resize-none"
          value={content.intro || ''}
          placeholder="Brief intro shown at the top of the page..."
          onChange={e => onChange({ ...content, intro: e.target.value })}
        />
      </div>

      {/* Categories + Questions */}
      <div className="flex gap-4">
        {/* Category sidebar */}
        <div className="w-48 flex-shrink-0 space-y-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categories</div>
          {categories.map((cat, catIdx) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm truncate transition-colors ${
                activeCat === cat.id
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name || 'Untitled'}
              <span className="ml-1 text-xs text-gray-400">({cat.items?.length || 0})</span>
            </button>
          ))}
          <button
            onClick={addCategory}
            className="w-full flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>

        {/* Category editor */}
        <div className="flex-1 space-y-3">
          {!currentCat ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
              Select or add a category to edit Q&amp;As.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <input
                  className="input text-sm flex-1"
                  value={currentCat.name}
                  placeholder="Category name"
                  onChange={e => updateCategory(currentCatIdx, 'name', e.target.value)}
                />
                <button
                  onClick={() => removeCategory(currentCatIdx)}
                  className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {(currentCat.items || []).map((item, qIdx) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">Q{qIdx + 1}</span>
                    <button onClick={() => removeQuestion(currentCatIdx, qIdx)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <input
                    className="input text-sm"
                    placeholder="Question..."
                    value={item.question}
                    onChange={e => updateQuestion(currentCatIdx, qIdx, 'question', e.target.value)}
                  />
                  <textarea
                    rows={3}
                    className="input text-sm resize-none"
                    placeholder="Answer..."
                    value={item.answer}
                    onChange={e => updateQuestion(currentCatIdx, qIdx, 'answer', e.target.value)}
                  />
                </div>
              ))}

              <button
                onClick={() => addQuestion(currentCatIdx)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <Plus size={15} /> Add Question
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminLegalPagesPage = () => {
  const [activeTab, setActiveTab] = useState('privacy_policy');
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState({});
  const [saving, setSaving] = useState(false);

  const loadPage = useCallback(async (key) => {
    if (pages[key]) return; // already loaded
    setLoading(l => ({ ...l, [key]: true }));
    try {
      const res = await legalAPI.adminGetPage(key);
      setPages(p => ({ ...p, [key]: res.data.content }));
    } catch {
      toast.error(`Failed to load ${key}`);
    } finally {
      setLoading(l => ({ ...l, [key]: false }));
    }
  }, [pages]);

  useEffect(() => {
    loadPage(activeTab);
  }, [activeTab, loadPage]);

  const handleSave = async () => {
    if (!pages[activeTab]) return;
    setSaving(true);
    try {
      await legalAPI.updatePage(activeTab, pages[activeTab]);
      toast.success('Page saved successfully!');
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentPage = PAGES.find(p => p.key === activeTab);
  const colors = COLOR_MAP[currentPage?.color || 'blue'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage content for Privacy Policy, Terms, Returns, and FAQ</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={currentPage?.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-300 transition-colors"
          >
            <ExternalLink size={15} /> Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saving || loading[activeTab]}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 ${colors.btn}`}
          >
            {saving ? <Loader size="sm" /> : <Save size={15} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-200 p-1.5 overflow-x-auto">
        {PAGES.map(page => {
          const Icon = page.icon;
          const c = COLOR_MAP[page.color];
          const isActive = activeTab === page.key;
          return (
            <button
              key={page.key}
              onClick={() => setActiveTab(page.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                isActive
                  ? `border-b-2 ${c.tab} bg-gray-50`
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={15} />
              {page.label}
            </button>
          );
        })}
      </div>

      {/* Editor Area */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        {loading[activeTab] ? (
          <div className="flex justify-center py-16">
            <Loader size="lg" />
          </div>
        ) : pages[activeTab] ? (
          activeTab === 'faq' ? (
            <FaqEditor
              content={pages[activeTab]}
              onChange={val => setPages(p => ({ ...p, [activeTab]: val }))}
            />
          ) : (
            <SectionEditor
              content={pages[activeTab]}
              onChange={val => setPages(p => ({ ...p, [activeTab]: val }))}
            />
          )
        ) : null}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PAGES.map(page => {
          const Icon = page.icon;
          const c = COLOR_MAP[page.color];
          return (
            <a
              key={page.key}
              href={page.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow text-sm text-gray-600 hover:text-gray-900"
            >
              <span className={`p-1.5 rounded-lg text-xs ${c.badge}`}>
                <Icon size={14} />
              </span>
              {page.label}
              <ExternalLink size={12} className="ml-auto text-gray-300" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default AdminLegalPagesPage;
