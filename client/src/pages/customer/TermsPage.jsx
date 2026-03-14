import { useState, useEffect } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { legalAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const TermsPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    legalAPI.getPage('terms')
      .then(res => setContent(res.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );

  if (!content) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-950 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">{content.title}</h1>
          {content.lastUpdated && (
            <p className="text-gray-400 text-sm">Last updated: {content.lastUpdated}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contents</h2>
              <nav className="space-y-1">
                {content.sections?.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <ChevronRight size={14} className="flex-shrink-0" />
                    <span className="truncate">{section.heading}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {content.intro && (
              <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed">{content.intro}</p>
              </div>
            )}

            {content.sections?.map((section, idx) => (
              <div
                key={section.id}
                id={`section-${section.id}`}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 scroll-mt-24"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {section.heading}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
