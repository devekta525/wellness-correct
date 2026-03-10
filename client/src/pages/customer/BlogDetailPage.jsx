import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, Tag, ArrowLeft, Loader2, BookOpen, Calendar } from 'lucide-react';
import { blogAPI } from '../../services/api';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    blogAPI.getBySlug(slug)
      .then(r => setBlog(r.data.blog))
      .catch(e => setError(e.message || 'Article not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary-500" size={36} />
    </div>
  );

  if (error || !blog) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <BookOpen size={64} className="text-gray-200 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Article Not Found</h2>
      <p className="text-gray-500 mb-6">{error || 'This article may have been moved or removed.'}</p>
      <Link to="/blogs" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
        <ArrowLeft size={16} />Back to Blog
      </Link>
    </div>
  );

  return (
    <div className="animate-fade-in">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-blue-900 to-primary-900 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/3" />
        </div>
        <div className="page-container relative max-w-3xl">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={14} />All Articles
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-white/10 text-primary-300 border border-white/20 px-2.5 py-1 rounded-full">
              <Tag size={9} />{blog.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/50"><Clock size={11} />{blog.readTime} min read</span>
            <span className="flex items-center gap-1 text-xs text-white/50"><Eye size={11} />{blog.views} views</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{blog.title}</h1>

          {blog.excerpt && <p className="text-white/60 text-base md:text-lg leading-relaxed mb-6">{blog.excerpt}</p>}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600/50 flex items-center justify-center text-sm font-bold text-white">
              {blog.author?.name?.[0] || 'W'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{blog.author?.name || 'Wellness Fuel'}</p>
              {blog.publishedAt && (
                <p className="text-white/40 text-xs flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {blog.coverImage && (
        <div className="w-full max-w-4xl mx-auto px-4 -mt-10 relative z-10">
          <img src={blog.coverImage} alt={blog.title}
            className="w-full aspect-video object-cover rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800" />
        </div>
      )}

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="page-container max-w-3xl">
          <div
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-600 dark:prose-li:text-gray-300
              prose-blockquote:border-l-4 prose-blockquote:border-primary-400 prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-950/30 prose-blockquote:rounded-r-xl prose-blockquote:px-5 prose-blockquote:py-1
              prose-img:rounded-xl prose-img:shadow-md
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">Tags:</span>
              {blog.tags.map(tag => (
                <Link key={tag} to={`/blogs?tag=${tag}`}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-700 transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link to="/blogs"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:gap-3 transition-all text-sm">
              <ArrowLeft size={16} />Back to all articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetailPage;
