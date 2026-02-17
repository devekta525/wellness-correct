import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string | string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readTime: string;
  views: number;
  likes: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

interface ApiBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author?: string;
  category: string;
  tags?: string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readTime?: string;
  views?: number;
  likes?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  blogImages?: string[];
}

interface BlogsState {
  data: Blog[];
  isLoading: boolean;
  error: string | null;
  selectedBlog: Blog | null;
  filters: {
    category: string;
    status: string;
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: BlogsState = {
  data: [],
  isLoading: false,
  error: null,
  selectedBlog: null,
  filters: {
    category: "",
    status: "",
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const api = axios.create({
  baseURL: getApiV1BaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      let token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
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

const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    setBlogsData: (
      state,
      action: PayloadAction<{ data: Blog[]; total: number }>,
    ) => {
      state.data = action.payload.data;
      state.pagination.total = action.payload.total;
      state.isLoading = false;
      state.error = null;
    },
    setBlogsLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setBlogsError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedBlog: (state, action: PayloadAction<Blog>) => {
      state.selectedBlog = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<BlogsState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<BlogsState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
  },
});

export const {
  setBlogsData,
  setBlogsLoading,
  setBlogsError,
  setSelectedBlog,
  setFilters,
  setPagination,
  clearSelectedBlog,
} = blogsSlice.actions;

const mapApiBlogToBlog = (apiBlog: ApiBlog): Blog => ({
  _id: apiBlog._id,
  title: apiBlog.title,
  slug: apiBlog.slug,
  excerpt: apiBlog.excerpt,
  content: apiBlog.content,
  featuredImage: apiBlog.featuredImage,
  author: apiBlog.author || "Admin",
  category: apiBlog.category,
  tags: apiBlog.tags || [],
  status: apiBlog.status,
  publishedAt: apiBlog.publishedAt,
  createdAt: apiBlog.createdAt,
  updatedAt: apiBlog.updatedAt,
  readTime: apiBlog.readTime || "5 min read",
  views: apiBlog.views || 0,
  likes: apiBlog.likes || 0,
  metaTitle: apiBlog.metaTitle || apiBlog.title,
  metaDescription: apiBlog.metaDescription || apiBlog.excerpt,
  metaKeywords: apiBlog.metaKeywords || "",
  canonicalUrl: apiBlog.canonicalUrl || "",
  ogTitle: apiBlog.ogTitle || apiBlog.title,
  ogDescription: apiBlog.ogDescription || apiBlog.excerpt,
  ogImage: apiBlog.ogImage || apiBlog.featuredImage,
});

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export const fetchBlogsData =
  () =>
    async (dispatch: AppDispatch, getState: () => { blogs: BlogsState }) => {
      dispatch(setBlogsLoading());
      try {
        const { filters, pagination } = getState().blogs;
        const queryParams = new URLSearchParams();

        queryParams.append("page", pagination.page.toString());
        queryParams.append("limit", pagination.limit.toString());

        if (filters.category && filters.category !== "all") {
          queryParams.append("category", filters.category);
        }
        if (filters.search) {
          queryParams.append("search", filters.search);
        }

        const response = await api.get(`/blogs?${queryParams}`);

        if (response.data?.success) {
          const mappedBlogs = response.data.data.blogs.map((blog: ApiBlog) =>
            mapApiBlogToBlog(blog),
          );

          dispatch(
            setBlogsData({
              data: mappedBlogs,
              total: response.data.data.pagination.totalBlogs,
            }),
          );
        } else {
          throw new Error(response.data?.message || "Failed to fetch blogs");
        }
        return true;
      } catch (error: unknown) {
        const errorMessage = handleApiError(error);
        dispatch(setBlogsError(errorMessage));
        return false;
      }
    };

export const fetchActiveBlogs =
  () =>
    async (dispatch: AppDispatch, getState: () => { blogs: BlogsState }) => {
      dispatch(setBlogsLoading());
      try {
        const { filters, pagination } = getState().blogs;
        const queryParams = new URLSearchParams();

        queryParams.append("page", pagination.page.toString());
        queryParams.append("limit", pagination.limit.toString());

        if (filters.category && filters.category !== "") {
          queryParams.append("category", filters.category);
        }
        if (filters.search) {
          queryParams.append("search", filters.search);
        }

        queryParams.append("status", "published");
        const response = await api.get(`/blogs?${queryParams}`);

        if (response.data?.success) {
          const mappedBlogs = response.data.data.blogs.map((blog: ApiBlog) =>
            mapApiBlogToBlog(blog),
          );

          dispatch(
            setBlogsData({
              data: mappedBlogs,
              total: response.data.data.pagination.totalBlogs,
            }),
          );
        } else {
          throw new Error(response.data?.message || "Failed to fetch blogs");
        }
      } catch (error: unknown) {
        const errorMessage = handleApiError(error);
        dispatch(setBlogsError(errorMessage));
        return false;
      }
    };

export const fetchBlogById =
  (blogId: string) => async (dispatch: AppDispatch) => {
    dispatch(setBlogsLoading());
    try {
      const response = await api.get(`/blogs/${blogId}`);
      if (response.data?.success) {
        const blog = response.data.data;
        const mappedBlog = mapApiBlogToBlog(blog);
        dispatch(setSelectedBlog(mappedBlog));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch blog");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setBlogsError(errorMessage));
      return false;
    }
  };

export const fetchBlogBySlug =
  (slug: string) => async (dispatch: AppDispatch) => {
    dispatch(setBlogsLoading());
    try {
      const response = await api.get(`/blogs?search=${slug}`);
      if (response.data?.success) {
        const items = response.data.data.blogs || [];
        const mapped = items.map((blog: ApiBlog) => mapApiBlogToBlog(blog));
        const match = mapped.find(
          (blog: Blog) => blog.slug === slug || (blog as any).urlSlug === slug,
        );
        if (match) {
          dispatch(setSelectedBlog(match));
          return true;
        }
        throw new Error("Blog not found");
      }
      throw new Error(response.data?.message || "Failed to fetch blog");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setBlogsError(errorMessage));
      return false;
    }
  };

export const fetchLatestBlogs = () => async (dispatch: AppDispatch) => {
  dispatch(setBlogsLoading());
  try {
    const response = await api.get(`/blogs?page=1&limit=10`);
    if (response.data?.success) {
      const mappedBlogs = response.data.data.blogs.map((blog: ApiBlog) =>
        mapApiBlogToBlog(blog),
      );

      dispatch(
        setBlogsData({
          data: mappedBlogs,
          total: response.data.data.pagination.totalBlogs,
        }),
      );
    } else {
      throw new Error(response.data?.message || "Failed to fetch latest blogs");
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setBlogsError(errorMessage));
    return false;
  }
};

export const createBlog =
  (newBlog: FormData) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(`/blogs/create`, newBlog, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data?.success) {
        dispatch(fetchBlogsData());
        return true;
      } else {
        const errorMessage = response.data?.message || "Failed to create blog";
        dispatch(setBlogsError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setBlogsError(errorMessage));
      return false;
    }
  };

export const generateBlogs =
  (message: string) => async (dispatch: AppDispatch) => {
    try {
      throw new Error("Blog generation is not supported by the backend");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setBlogsError(errorMessage));
      throw error;
    }
  };

export const updateBlogStatus =
  (blogId: string, status: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(`/blogs/${blogId}`, { status });
      if (response.data?.success) {
        dispatch(fetchBlogsData());
      } else {
        throw new Error(
          response.data?.message || "Failed to update blog status",
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setBlogsError(errorMessage));
    }
  };

export const updateBlog =
  (blogId: string, updatedData: FormData) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(`/blogs/${blogId}`, updatedData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data?.success) {
        dispatch(fetchBlogsData());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update blog");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setBlogsError(errorMessage));
      return false;
    }
  };

export const deleteBlog = (blogId: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await api.delete(`/blogs/${blogId}`);
    if (response.data?.success) {
      dispatch(fetchBlogsData());
      return true;
    } else {
      throw new Error(response.data?.message || "Failed to delete blog");
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setBlogsError(errorMessage));
    return false;
  }
};

export const selectBlogsData = (state: { blogs: BlogsState }) =>
  state.blogs.data;
export const selectBlogsLoading = (state: { blogs: BlogsState }) =>
  state.blogs.isLoading;
export const selectBlogsError = (state: { blogs: BlogsState }) =>
  state.blogs.error;
export const selectSelectedBlog = (state: { blogs: BlogsState }) =>
  state.blogs.selectedBlog;
export const selectBlogsFilters = (state: { blogs: BlogsState }) =>
  state.blogs.filters;
export const selectBlogsPagination = (state: { blogs: BlogsState }) =>
  state.blogs.pagination;

export default blogsSlice.reducer;
