import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { legalAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const FaqPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    legalAPI.getPage('faq')
      .then(res => {
        setContent(res.data.content);
        if (res.data.content?.categories?.length) {
          setActiveCategory(res.data.content.categories[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );

  if (!content) return null;

  const toggle = (id) => setOpenItem(prev => prev === id ? null : id);

  // Filter by search
  const filteredCategories = search.trim()
    ? content.categories?.map(cat => ({
        ...cat,
        items: cat.items?.filter(item =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.items?.length > 0)
    : content.categories?.filter(cat => activeCategory ? cat.id === activeCategory : true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
            <HelpCircle size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">{content.title}</h1>
          {content.intro && (
            <p className="text-amber-100 text-base max-w-xl mx-auto mb-6">{content.intro}</p>
          )}
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Tabs */}
          {!search && (
            <aside className="lg:w-56 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:sticky lg:top-24">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Categories</h2>
                <nav className="space-y-1">
                  {content.categories?.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-amber-50 text-amber-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {cat.name}
                      <span className="ml-1 text-xs text-gray-400">({cat.items?.length})</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* FAQ Items */}
          <div className="flex-1 space-y-8">
            {filteredCategories?.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <HelpCircle size={40} className="mx-auto mb-3 text-gray-300" />
                <p>No questions found for "<span className="font-medium">{search}</span>"</p>
              </div>
            )}

            {filteredCategories?.map(cat => (
              <div key={cat.id}>
                {(search || !activeCategory) && (
                  <h2 className="text-lg font-bold text-gray-900 mb-4">{cat.name}</h2>
                )}
                <div className="space-y-3">
                  {cat.items?.map(item => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                        {openItem === item.id
                          ? <ChevronUp size={18} className="flex-shrink-0 text-amber-600" />
                          : <ChevronDown size={18} className="flex-shrink-0 text-gray-400" />
                        }
                      </button>
                      {openItem === item.id && (
                        <div className="px-6 pb-5 border-t border-gray-50">
                          <p className="text-gray-600 leading-relaxed pt-4">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
