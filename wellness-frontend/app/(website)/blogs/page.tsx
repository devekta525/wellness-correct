"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, User, ChevronRight, Loader2, Search } from "lucide-react";

interface Blog {
    _id: string;
    title: string;
    urlSlug: string;
    content: string;
    excerpt?: string;
    featuredImageUrl?: string;
    author?: {
        firstName: string;
        lastName: string;
    };
    category?: string;
    status: string;
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const BlogsPage = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/v1/blogs/published`
                );

                if (response.data.success) {
                    setBlogs(response.data.data.blogs);
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
                {/* Search Bar Container */}
                <div className="mb-10 sm:mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left w-full md:w-auto">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 dark:text-white mb-1.5 leading-tight">
                            Wellness Fuel Blog
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            Stay informed with trusted health articles, supplement guides, and practical tips for everyday vitality.
                        </p>
                    </div>

                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base min-h-[48px]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 sm:py-32">
                        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium text-sm sm:text-base">Drafting your experience...</p>
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {filteredBlogs.map((blog, index) => (
                            <motion.div
                                key={blog._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="group bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col h-full active:scale-[0.98] sm:hover:-translate-y-2 md:active:scale-100"
                            >
                                {/* Image Section */}
                                <div className="relative h-48 sm:h-52 lg:h-56 w-full overflow-hidden">
                                    <Image
                                        src={blog.featuredImageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"}
                                        alt={blog.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {blog.category && (
                                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                            <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/95 dark:bg-slate-800/90 backdrop-blur-md text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
                                                {blog.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-5 sm:p-7 flex flex-col grow">
                                    <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mb-3 sm:mb-4 font-bold tracking-tight">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "2-digit",
                                                year: "numeric",
                                            })}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            <span className="line-clamp-1">{blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : "Wellness Team"}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 dark:text-white mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                        {blog.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                                        {blog.excerpt || blog.content.replace(/<[^>]*>/g, "").slice(0, 150)}...
                                    </p>

                                    <div className="mt-auto">
                                        <Link
                                            href={`/blogs/${blog.urlSlug || blog._id}`}
                                            className="inline-flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95 min-h-[44px]"
                                        >
                                            Read Full Article
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="text-4xl sm:text-5xl mb-4">✍️</div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-2">No blogs found</h3>
                        <p className="text-sm sm:text-base text-slate-500">Try searching for something else or check back later.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BlogsPage;
