import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Tag, ChevronRight, Loader2, Search, BookOpen } from 'lucide-react';
import { blogAPI } from '../../services/api';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchBlogs = (page = 1, category = activeCategory, q = search) => {
    setLoading(true);
    const params = { page, limit: 9 };
    if (category) params.category = category;
    if (q) params.search = q;
    blogAPI.getAll(params)
      .then(r => {
        setBlogs(r.data.blogs);
        setPagination(r.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    blogAPI.getCategories().then(r => setCategories(r.data.categories || [])).catch(() => {});
    fetchBlogs(1, '', '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setSearch('');
    setSearchInput('');
    fetchBlogs(1, cat, '');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setActiveCategory('');
    fetchBlogs(1, '', searchInput);
  };

  const handlePage = (p) => fetchBlogs(p, activeCategory, search);

  return (
    <div className="animate-fade-in">

      {/* Hero */}
      <section className="relative py-20 md:py-24 overflow-hidden bg-gradient-to-br from-primary-950 via-blue-900 to-primary-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" />
        </div>
        <div className="page-container relative text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-primary-300 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/15">
            <BookOpen size={11} /> Wellness Insights
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            The Wellness Fuel <span className="text-primary-300">Blog</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-8">
            Science-backed articles on nutrition, performance, and living your healthiest life.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search articles…"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-primary-500 hover:bg-primary-400 text-white rounded-xl text-sm font-semibold transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-950 min-h-[60vh]">
        <div className="page-container">

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button onClick={() => handleCategory('')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!activeCategory ? 'bg-primary-600 text-white shadow' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                All
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => handleCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-primary-600 text-white shadow' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No articles found</p>
              <p className="text-sm mt-1">Check back soon for new content</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => handlePage(i + 1)}
                      className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${pagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const BlogCard = ({ blog }) => (
  <Link to={`/blog/${blog.slug}`}
    className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">

    {/* Cover image */}
    <div className="aspect-[16/9] bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-950/50 dark:to-blue-950/50 overflow-hidden">
      {blog.coverImage ? (
        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen size={40} className="text-primary-300" />
        </div>
      )}
    </div>

    <div className="p-5 flex flex-col flex-1 gap-3">
      {/* Category + read time */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-900 px-2 py-0.5 rounded-full">
          <Tag size={9} />{blog.category}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock size={9} />{blog.readTime} min read
        </span>
      </div>

      {/* Title */}
      <h2 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
        {blog.title}
      </h2>

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">{blog.excerpt}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-400">
            {blog.author?.name?.[0] || 'W'}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{blog.author?.name || 'Wellness Fuel'}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><Eye size={10} />{blog.views}</span>
          <span className="flex items-center gap-1 text-primary-600 font-semibold">Read <ChevronRight size={10} /></span>
        </div>
      </div>
    </div>
  </Link>
);

export default BlogsPage;
