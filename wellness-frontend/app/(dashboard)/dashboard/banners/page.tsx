"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { getApiV1BaseUrl } from "@/lib/utils/api";
import { toast } from "sonner";

// Create axios instance with interceptors for authentication
const authenticatedAxios = axios.create({
    baseURL: getApiV1BaseUrl(),
    withCredentials: true,
});

// Add request interceptor to include auth token
authenticatedAxios.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            let token =
                localStorage.getItem("authToken") ||
                localStorage.getItem("accessToken");

            if (token) {
                token = token.replace(/^"|"$/g, "");
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);
import Image from "next/image";
import { Trash2, Upload, ExternalLink } from "lucide-react";

interface Banner {
    _id: string;
    imageUrl: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (url?: string) => {
    if (!url) return "/Hero.png";
    let finalUrl = url;
    if (!url.startsWith("http")) {
        finalUrl = url.startsWith("/") ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
    }
    return encodeURI(finalUrl);
};

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await authenticatedAxios.get(`/banners`);
            if (res.data.success) {
                setBanners(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch banners");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please select images first");
            return;
        }
        if (banners.length + selectedFiles.length > 4) {
            toast.error(`You can only upload ${4 - banners.length} more banner(s).`);
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append("images", file);
            });

            const res = await authenticatedAxios.post(`/banners`, formData);

            if (res.data.success) {
                toast.success("Banners uploaded successfully");
                setSelectedFiles([]);
                fetchBanners();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to upload banners");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            const res = await authenticatedAxios.delete(`/banners/${id}`);
            if (res.data.success) {
                toast.success("Banner deleted");
                fetchBanners();
            }
        } catch (error) {
            toast.error("Failed to delete banner");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manage Banners</h1>
                    <p className="text-muted-foreground text-sm">Upload up to 4 banners. Recommend size: 1920x720.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border mb-8 flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Upload New Banners (Multiple Allowed)</label>
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={banners.length >= 4 || uploading}
                    />
                </div>
                <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading || banners.length >= 4}
                >
                    {uploading ? "Uploading..." : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <p>Loading banners...</p>
                ) : banners.length === 0 ? (
                    <p className="text-muted-foreground">No banners found. Upload one to get started.</p>
                ) : (
                    banners.map((banner, index) => (
                        <div key={banner._id} className="relative bg-slate-50 border rounded-xl overflow-hidden shadow-sm group">
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                                Slide {index + 1}
                            </div>
                            <div className="relative aspect-[16/6] w-full bg-slate-100">
                                <Image
                                    src={getImageUrl(banner.imageUrl)}
                                    alt={`Banner ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <div className="p-4 flex justify-between items-center bg-white border-t">
                                <a
                                    href={getImageUrl(banner.imageUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 flex items-center hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" /> View Original
                                </a>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(banner._id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
