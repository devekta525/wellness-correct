import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/api";

export interface Product {
  _id: string;
  name: string;
  slug?: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    mrp: number;
  };
  stockQuantity: number;
  shortDescription: string;
  description?: string;
  longDescription: string;
  weightSize: {
    value: number;
    unit: string;
  };
  expiryDate: string;
  ingredients: string[];
  benefits: string[];
  dosageInstructions: string;
  manufacturer: string;
  images: string[];
  imageUrl?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}
interface ApiProduct {
  _id: string;
  name: string;
  slug?: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    mrp: number;
  };
  stockQuantity: number;
  shortDescription: string;
  description?: string;
  longDescription: string;
  weightSize: {
    value: number;
    unit: string;
  };
  expiryDate: string;
  ingredients: string[];
  benefits: string[];
  dosageInstructions: string;
  manufacturer: string;
  images: string[];
  imageUrl?: string;
  status?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
}
interface ProductState {
  data: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  filters: {
    category: string;
    status: string;
    search: string;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
const initialState: ProductState = {
  data: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
  filters: {
    category: "",
    status: "",
    search: "",
    priceRange: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProductData: (
      state,
      action: PayloadAction<{ data: Product[]; total: number }>,
    ) => {
      state.data = action.payload.data;
      state.pagination.total = action.payload.total;
      state.isLoading = false;
      state.error = null;
    },
    setProductLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setProductError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ProductState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<ProductState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
});
export const {
  setProductData,
  setProductLoading,
  setProductError,
  setSelectedProduct,
  setFilters,
  setPagination,
  clearSelectedProduct,
} = productSlice.actions;
const mapApiProductToProduct = (apiProduct: ApiProduct): Product => ({
  _id: apiProduct._id,
  name: apiProduct.name,
  slug: apiProduct.slug || "",
  category: apiProduct.category,
  price: {
    amount: apiProduct.price.amount,
    currency: apiProduct.price.currency,
    mrp: apiProduct.price.mrp || apiProduct.price.amount,
  },
  stockQuantity: apiProduct.stockQuantity,
  shortDescription: apiProduct.shortDescription,
  description: apiProduct.description || apiProduct.shortDescription,
  longDescription: apiProduct.longDescription,
  weightSize: apiProduct.weightSize,
  expiryDate: apiProduct.expiryDate,
  ingredients: apiProduct.ingredients || [],
  benefits: apiProduct.benefits || [],
  dosageInstructions: apiProduct.dosageInstructions,
  manufacturer: apiProduct.manufacturer,
  images: apiProduct.images || [],
  imageUrl:
    apiProduct.imageUrl || apiProduct.image || apiProduct.images?.[0] || "",
  status: apiProduct.status || "active",
  metaTitle: apiProduct.metaTitle || apiProduct.name,
  metaDescription: apiProduct.metaDescription || apiProduct.shortDescription,
  createdAt: apiProduct.createdAt,
  updatedAt: apiProduct.updatedAt,
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
export const fetchProductsData =
  () =>
  async (dispatch: AppDispatch, getState: () => { products: ProductState }) => {
    dispatch(setProductLoading());
    try {
      const { filters, pagination } = getState().products;
      const queryParams = new URLSearchParams();

      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      if (filters.category && filters.category !== "All") {
        queryParams.append("category", filters.category);
      }
      if (filters.status && filters.status !== "All") {
        queryParams.append("status", filters.status);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      const response = await api.get(`/v1/products?${queryParams}`);

      if (response.data?.success && Array.isArray(response.data.data)) {
        const mappedProducts = response.data.data.map((product: ApiProduct) =>
          mapApiProductToProduct(product),
        );

        dispatch(
          setProductData({
            data: mappedProducts,
            total:
              response.data.pagination?.totalProducts ||
              response.data.data.length,
          }),
        );
      } else {
        throw new Error(response.data?.message || "Failed to fetch products");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setProductError(errorMessage));
      return false;
    }
    return false;
  };

export const fetchProductBySlug =
  (slug: string) => async (dispatch: AppDispatch) => {
    dispatch(setProductLoading());
    try {
      const response = await api.get(`/v1/products/slug/${slug}`);
      if (response.data?.success && response.data.data) {
        const mappedProduct = mapApiProductToProduct(response.data.data);
        dispatch(setSelectedProduct(mappedProduct));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch product");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setProductError(errorMessage));
      return false;
    }
  };

// If you need a createProduct function (since there was a reference to newProduct), you can add:
export const createProduct =
  (newProduct: any) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(`/v1/products`, newProduct);
      if (response.data?.success) {
        dispatch(fetchProductsData());
        return true;
      } else {
        const errorMessage =
          response.data?.message || "Failed to create product";
        dispatch(setProductError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setProductError(errorMessage));
      return false;
    }
  };
export const updateProduct =
  (productId: string, updatedData: any) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(`/v1/products/${productId}`, updatedData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.data?.success) {
        dispatch(fetchProductsData());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update product");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setProductError(errorMessage));
      return false;
    }
  };
export const deleteProduct =
  (productId: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.delete(`/v1/products/${productId}`);
      if (response.data?.success) {
        dispatch(fetchProductsData());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete product");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setProductError(errorMessage));
      return false;
    }
  };
export const selectProductsData = (state: { products: ProductState }) =>
  state.products.data;
export const selectProductsLoading = (state: { products: ProductState }) =>
  state.products.isLoading;
export const selectProductsError = (state: { products: ProductState }) =>
  state.products.error;
export const selectSelectedProduct = (state: { products: ProductState }) =>
  state.products.selectedProduct;
export const selectProductsFilters = (state: { products: ProductState }) =>
  state.products.filters;
export const selectProductsPagination = (state: { products: ProductState }) =>
  state.products.pagination;
export default productSlice.reducer;
