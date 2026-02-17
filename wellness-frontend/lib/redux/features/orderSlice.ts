import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = getApiV1BaseUrl();

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Define the Order type
export interface OrderUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
}

export interface OrderAddress {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
}

export interface OrderItem {
  product:
    | string
    | {
        _id?: string;
        name?: string;
        image?: string;
        price?: number;
      };
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  user: string | OrderUser;
  shippingAddress: string | OrderAddress;
  billingAddress: string | OrderAddress;
  items: OrderItem[];
  paymentMethod: "Credit Card" | "Debit Card" | "UPI" | "Net Banking" | "COD";
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Failed";
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  trackingNumber?: string;
  shippingCost: string;
  subtotal: number;
  totalAmount: number;
  notes?: string;
  isCouponApplied: boolean;
  couponCode?: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  cancelReason?: string;
  returnReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the state structure
interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    user?: string;
    status:
      | ""
      | "Pending"
      | "Processing"
      | "Shipped"
      | "Delivered"
      | "Cancelled"
      | "Returned";
    paymentStatus: "" | "Paid" | "Pending" | "Refunded" | "Failed";
    dateRange?: {
      from: string;
      to: string;
    };
    search?: string;
  };
}

// Initial state
const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
  filters: {
    user: "",
    status: "",
    paymentStatus: "",
  },
};

// Create the slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrdersData: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedOrder: (state, action: PayloadAction<Order>) => {
      state.selectedOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setOrderLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setOrderError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setOrderPagination: (
      state,
      action: PayloadAction<OrderState["pagination"]>,
    ) => {
      state.pagination = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<OrderState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

// Export actions
export const {
  setOrdersData,
  setSelectedOrder,
  setOrderLoading,
  setOrderError,
  setOrderPagination,
  clearSelectedOrder,
  setFilters,
  clearFilters,
} = orderSlice.actions;

// Error handler utility
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Fetch orders with filters
export const fetchOrdersData =
  (params?: { page?: number; limit?: number }) =>
  async (dispatch: AppDispatch, getState: () => { order: OrderState }) => {
    dispatch(setOrderLoading());
    try {
      const { filters } = getState().order;
      const queryParams = new URLSearchParams();

      // Add filter parameters if they exist
      if (filters.status) {
        queryParams.append("status", filters.status);
      }
      if (filters.paymentStatus) {
        queryParams.append("paymentStatus", filters.paymentStatus);
      }
      if (filters.user) {
        queryParams.append("user", filters.user);
      }
      if (filters.search) {
        queryParams.append("q", filters.search);
      }
      if (filters.dateRange) {
        queryParams.append("from", filters.dateRange.from);
        queryParams.append("to", filters.dateRange.to);
      }
      if (params?.page) {
        queryParams.append("page", String(params.page));
      }
      if (params?.limit) {
        queryParams.append("limit", String(params.limit));
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/orders?${queryString}` : `/orders`;

      const response = await api.get(url);

      if (response.data?.success) {
        dispatch(setOrdersData(response.data.data || []));
        if (response.data.pagination) {
          dispatch(setOrderPagination(response.data.pagination));
        } else {
          const inferredPage = params?.page ?? 1;
          const inferredLimit =
            params?.limit ?? response.data.data?.length ?? 0;
          const inferredTotal = response.data.data?.length ?? 0;
          dispatch(
            setOrderPagination({
              page: inferredPage,
              limit: inferredLimit,
              total: inferredTotal,
              pages: inferredLimit
                ? Math.max(1, Math.ceil(inferredTotal / inferredLimit))
                : 1,
            }),
          );
        }
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch orders");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setOrderError(errorMessage));
      return false;
    }
  };

// Fetch order by ID
export const fetchOrderById =
  (orderId: string) => async (dispatch: AppDispatch) => {
    dispatch(setOrderLoading());
    try {
      const response = await api.get(`/orders/${orderId}`);
      if (response.data?.success) {
        dispatch(setSelectedOrder(response.data.data));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch order");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setOrderError(errorMessage));
      return false;
    }
  };

// Create new order
export const createOrder =
  (orderData: Omit<Order, "_id" | "createdAt" | "updatedAt">) =>
  async (dispatch: AppDispatch) => {
    dispatch(setOrderLoading());
    try {
      const response = await api.post(`/orders`, orderData);
      if (response.data?.success) {
        dispatch(setSelectedOrder(response.data.data));
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to create order");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setOrderError(errorMessage));
      return false;
    }
  };

// Update order status
export const updateOrderStatus =
  (orderId: string, status: Order["status"], trackingNumber?: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(setOrderLoading());
    try {
      const response = await api.put(`/orders/${orderId}`, {
        status,
        trackingNumber,
      });
      if (response.data?.success) {
        dispatch(setSelectedOrder(response.data.data));
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to update order status",
        );
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setOrderError(errorMessage));
      return false;
    }
  };

// Update payment status
export const updatePaymentStatus =
  (orderId: string, paymentStatus: Order["paymentStatus"]) =>
  async (dispatch: AppDispatch) => {
    dispatch(setOrderLoading());
    try {
      const response = await api.put(`/orders/${orderId}`, {
        paymentStatus,
      });
      if (response.data?.success) {
        dispatch(setSelectedOrder(response.data.data));
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to update payment status",
        );
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setOrderError(errorMessage));
      return false;
    }
  };

// Cancel order
export const cancelOrder =
  (orderId: string, reason: string) => async (dispatch: AppDispatch) => {
    dispatch(setOrderLoading());
    try {
      const response = await api.put(`/orders/${orderId}`, {
        status: "Cancelled",
        cancelReason: reason,
      });
      if (response.data?.success) {
        dispatch(setSelectedOrder(response.data.data));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to cancel order");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setOrderError(errorMessage));
      return false;
    }
  };

// Return order
export const returnOrder =
  (orderId: string, reason: string) => async (dispatch: AppDispatch) => {
    dispatch(setOrderLoading());
    try {
      const response = await api.put(`/orders/${orderId}`, {
        status: "Returned",
        returnReason: reason,
      });
      if (response.data?.success) {
        dispatch(setSelectedOrder(response.data.data));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to return order");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setOrderError(errorMessage));
      return false;
    }
  };

// Selectors
export const selectOrders = (state: { order: OrderState }) =>
  state.order.orders;
export const selectSelectedOrder = (state: { order: OrderState }) =>
  state.order.selectedOrder;
export const selectOrderLoading = (state: { order: OrderState }) =>
  state.order.isLoading;
export const selectOrderError = (state: { order: OrderState }) =>
  state.order.error;
export const selectOrderFilters = (state: { order: OrderState }) =>
  state.order.filters;
export const selectOrderPagination = (state: { order: OrderState }) =>
  state.order.pagination;

// Export the reducer
export default orderSlice.reducer;
