"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, User, ChevronRight, Loader2, BookOpen } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function BlogSection() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(`${API_URL}/v1/blogs/published`);
                if (response.data.success) {
                    setBlogs(response.data.data.blogs);
                }
            } catch (error) {
                console.error("Error fetching blogs for homepage:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (blogs.length === 0) return null;

    return (
        <section className="py-16 sm:py-24 bg-slate-50/50">
            <div className="w-full max-w-screen-xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-[11px] font-bold uppercase tracking-widest mb-4">
                            <BookOpen className="w-3.5 h-3.5" />
                            Health Insights
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 font-serif leading-tight">
                            Latest from Our <span className="text-blue-600">Blog</span>
                        </h2>
                        <p className="mt-4 text-slate-500 text-sm sm:text-lg">
                            Expert advice on nutrition, wellness, and supplements to help you live your best life.
                        </p>
                    </div>
                    <Link
                        href="/blogs"
                        className="hidden md:inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                    >
                        View All Articles
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Blog Cards (Stacked Vertical for Mobile) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                    {blogs.slice(0, 3).map((blog, index) => (
                        <motion.div
                            key={blog._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                        >
                            {/* Image */}
                            <div className="relative aspect-video sm:aspect-[16/10] overflow-hidden">
                                <Image
                                    src={blog.featuredImageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"}
                                    alt={blog.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {blog.category && (
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                            {blog.category}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "2-digit",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="line-clamp-1">{blog.author ? `${blog.author.firstName}` : "Wellness Team"}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                    {blog.title}
                                </h3>

                                <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                                    {blog.excerpt || blog.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
                                </p>

                                <div className="mt-auto">
                                    <Link
                                        href={`/blogs/${blog.urlSlug || blog._id}`}
                                        className="flex items-center gap-2 text-slate-900 font-bold text-sm group/btn"
                                    >
                                        Read More
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile View All CTA */}
                <div className="mt-10 text-center md:hidden">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl shadow-sm"
                    >
                        View All Articles
                        <ChevronRight className="w-5 h-5 text-blue-600" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
