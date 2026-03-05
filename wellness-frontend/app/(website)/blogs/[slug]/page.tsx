"use client";

import React, { useState, useEffect, use } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Loader2, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Blog {
    _id: string;
    title: string;
    urlSlug: string;
    content: string;
    shortDescription?: string;
    featuredImage?: string;
    author?: string;
    category?: string;
    status: string;
    createdAt: string;
}

const BlogDetailsPage = ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = use(params);
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                const res = await axios.get(`${API_URL}/v1/blogs/public/${slug}`);
                if (res.data.blog) {
                    setBlog(res.data.blog);
                } else if (res.data.data) {
                    setBlog(res.data.data);
                } else {
                    setBlog(res.data);
                }
            } catch (err) {
                console.error("Error fetching blog details", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogDetail();
    }, [slug, API_URL]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Drafting your article...</p>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
                <div className="text-6xl mb-6">⚠️</div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Article Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-md text-center">
                    The blog post you're looking for might have been moved or is no longer available.
                </p>
                <Link href="/blogs">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8">
                        Back to All Blogs
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen">
            {/* Hero Header */}
            <header className="relative h-[50vh] min-h-[400px] w-full">
                <Image
                    src={blog.featuredImage || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200"}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Link
                                href="/blogs"
                                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 group transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                <span className="text-sm font-semibold tracking-wide">BACK TO INSIGHTS</span>
                            </Link>

                            <div className="mb-4">
                                {blog.category && (
                                    <span className="px-4 py-1.5 rounded-full bg-blue-600/90 text-white text-xs font-bold uppercase tracking-widest">
                                        {blog.category}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight mb-6">
                                {blog.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white ring-2 ring-white/20">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <span>{blog.author || "Wellness Team"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <span>
                                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "2-digit",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <span>{Math.ceil(blog.content.length / 1000) || 5} min read</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Article Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    {/* Summary/Intro */}
                    {blog.shortDescription && (
                        <p className="text-2xl font-medium text-slate-700 dark:text-slate-300 border-l-4 border-blue-600 pl-6 mb-12 italic leading-relaxed">
                            {blog.shortDescription}
                        </p>
                    )}

                    {/* Main Body */}
                    <div
                        className="blog-content ricth-text text-slate-800 dark:text-slate-200 leading-[1.8] text-lg space-y-8"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>

                {/* Footer info */}
                <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-blue-600" />
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                                    #{blog.category || "Wellness"}
                                </span>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                                    #Science
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-400">SHARE:</span>
                            <div className="flex gap-2">
                                {['FB', 'TW', 'IN'].map(social => (
                                    <button key={social} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all">
                                        {social}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BlogDetailsPage;
