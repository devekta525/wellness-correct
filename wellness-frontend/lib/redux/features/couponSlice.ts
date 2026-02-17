import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = getApiV1BaseUrl();

// Define the Coupon type
export interface Coupon {
  _id?: string;
  code: string;
  type: "Percentage" | "Fixed";
  value: string;
  maxDiscount: number;
  minOrderValue: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount?: number;
  userUsageLimit: number;
  applicableUsers?: string[];
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

// Define the API Coupon type (from backend)
interface ApiCoupon {
  _id?: string;
  code: string;
  type: "Percentage" | "Fixed";
  value: string;
  maxDiscount: number;
  minOrderValue: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  userUsageLimit: number;
  applicableUsers?: string[];
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

// Define the state structure
interface CouponState {
  data: Coupon[];
  isLoading: boolean;
  error: string | null;
  selectedCoupon: Coupon | null;
  filters: {
    status: string;
    name?: string;
  };
}

// Initial state
const initialState: CouponState = {
  data: [],
  isLoading: false,
  error: null,
  selectedCoupon: null,
  filters: {
    status: "",
    name: "",
  },
};

// Create the slice
const couponSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    setCouponData: (state, action: PayloadAction<Coupon[]>) => {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCouponLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setCouponError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedCoupon: (state, action: PayloadAction<Coupon>) => {
      state.selectedCoupon = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<CouponState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedCoupon: (state) => {
      state.selectedCoupon = null;
    },
  },
});

// Export actions
export const {
  setCouponData,
  setCouponLoading,
  setCouponError,
  setSelectedCoupon,
  setFilters,
  clearSelectedCoupon,
} = couponSlice.actions;

// Helper function to map API coupon to our Coupon interface
const mapApiCouponToCoupon = (apiCoupon: ApiCoupon): Coupon => ({
  _id: apiCoupon._id || "",
  code: apiCoupon.code,
  type: apiCoupon.type,
  value: apiCoupon.value,
  maxDiscount: apiCoupon.maxDiscount,
  minOrderValue: apiCoupon.minOrderValue,
  startDate: apiCoupon.startDate,
  expiryDate: apiCoupon.expiryDate,
  usageLimit: apiCoupon.usageLimit,
  usedCount: apiCoupon.usedCount,
  userUsageLimit: apiCoupon.userUsageLimit,
  applicableUsers: apiCoupon.applicableUsers || [],
  status: apiCoupon.status,
  createdAt: apiCoupon.createdAt,
  updatedAt: apiCoupon.updatedAt,
});

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

// Fetch coupons with filters
export const fetchCouponsData =
  () =>
  async (dispatch: AppDispatch, getState: () => { coupons: CouponState }) => {
    dispatch(setCouponLoading());
    try {
      const { filters } = getState().coupons;
      const queryParams = new URLSearchParams();

      // Add filter parameters if they exist
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.name) {
        queryParams.append("name", filters.name);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `${API_BASE_URL}/coupons?${queryString}`
        : `${API_BASE_URL}/coupons`;

      const response = await axios.get(url);

      if (response.data?.success && Array.isArray(response.data.data)) {
        // Map API response to our Coupon interface
        const mappedCoupons = response.data.data.map((coupon: ApiCoupon) =>
          mapApiCouponToCoupon(coupon),
        );

        dispatch(setCouponData(mappedCoupons));
      } else {
        throw new Error(response.data?.message || "Failed to fetch coupons");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setCouponError(errorMessage));
      return false;
    }
  };

// Fetch active coupons
export const fetchActiveCoupons = () => async (dispatch: AppDispatch) => {
  dispatch(setCouponLoading());
  try {
    const response = await axios.get(`${API_BASE_URL}/coupons?status=active`);
    if (response.data?.success && Array.isArray(response.data.data)) {
      // Map API response to our Coupon interface
      const mappedCoupons = response.data.data.map((coupon: ApiCoupon) =>
        mapApiCouponToCoupon(coupon),
      );

      dispatch(setCouponData(mappedCoupons));
    } else {
      throw new Error(response.data?.message || "Failed to fetch coupons");
    }
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setCouponError(errorMessage));
    return false;
  }
};

// Fetch coupon by ID
export const fetchCouponById =
  (couponId: string) => async (dispatch: AppDispatch) => {
    dispatch(setCouponLoading());
    try {
      const response = await axios.get(`${API_BASE_URL}/coupons/${couponId}`);
      if (response.data?.success) {
        const coupon = response.data.data;
        const mappedCoupon = mapApiCouponToCoupon(coupon);
        dispatch(setSelectedCoupon(mappedCoupon));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch coupon");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setCouponError(errorMessage));
      return false;
    }
  };

// Fetch coupon by code
export const fetchCouponByCode =
  (code: string) => async (dispatch: AppDispatch) => {
    dispatch(setCouponLoading());
    try {
      const response = await axios.get(`${API_BASE_URL}/coupons?q=${code}`);
      if (response.data?.success) {
        const coupon = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data;
        if (coupon) {
          const mappedCoupon = mapApiCouponToCoupon(coupon);
          dispatch(setSelectedCoupon(mappedCoupon));
          return true;
        }
        throw new Error("Coupon not found");
      } else {
        throw new Error(response.data?.message || "Failed to fetch coupon");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setCouponError(errorMessage));
      return false;
    }
  };

// Fetch latest coupons
export const fetchLatestCoupons = () => async (dispatch: AppDispatch) => {
  dispatch(setCouponLoading());
  try {
    const response = await axios.get(
      `${API_BASE_URL}/coupons?sort=-createdAt&limit=10`,
    );
    if (response.data?.success) {
      const mappedCoupons = response.data.data.map((coupon: ApiCoupon) =>
        mapApiCouponToCoupon(coupon),
      );

      dispatch(setCouponData(mappedCoupons));
    } else {
      throw new Error(
        response.data?.message || "Failed to fetch latest coupons",
      );
    }
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setCouponError(errorMessage));
    return false;
  }
};

// Add a new coupon
export const createCoupon =
  (newCoupon: Coupon) => async (dispatch: AppDispatch) => {
    dispatch(setCouponLoading());
    try {
      const response = await axios.post(`${API_BASE_URL}/coupons`, newCoupon);
      if (response.data?.success) {
        dispatch(setCouponLoading());
        return true;
      } else {
        const errorMessage =
          response.data?.message || "Failed to create coupon";
        dispatch(setCouponError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setCouponError(errorMessage));
      return false;
    }
  };

// Update coupon status
export const updateCouponStatus =
  (couponId: string, status: "active" | "inactive") =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/coupons/${couponId}/status`,
        { status },
      );
      if (response.data?.success) {
        dispatch(setCouponLoading());
      } else {
        throw new Error(
          response.data?.message || "Failed to update coupon status",
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setCouponError(errorMessage));
    }
  };

// Edit a coupon
export const updateCoupon =
  (couponId: string, updatedData: Coupon) => async (dispatch: AppDispatch) => {
    dispatch(setCouponLoading());
    try {
      const response = await axios.put(
        `${API_BASE_URL}/coupons/${couponId}`,
        updatedData,
      );
      if (response.data?.success) {
        dispatch(setCouponLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update coupon");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setCouponError(errorMessage));
      return false;
    }
  };

// Delete a coupon
export const deleteCoupon =
  (couponId: string) => async (dispatch: AppDispatch) => {
    dispatch(setCouponLoading());
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/coupons/${couponId}`,
      );
      if (response.data?.success) {
        dispatch(setCouponLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete coupon");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setCouponError(errorMessage));
      return false;
    }
  };

export const validateCoupon =
  (couponCode: string, orderAmount: number, userId?: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(setCouponLoading());
    try {
      const response = await axios.post(`${API_BASE_URL}/coupons/validate`, {
        code: couponCode,
        orderAmount,
        userId,
      });
      if (response.data?.success) {
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to validate coupon");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setCouponError(errorMessage));
      return false;
    }
  };

export const redeemCoupon =
  (couponCode: string) => async (dispatch: AppDispatch) => {
    dispatch(setCouponLoading());
    try {
      const response = await axios.post(`${API_BASE_URL}/coupons/redeem`, {
        code: couponCode,
      });
      if (response.data?.success) {
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to redeem coupon");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setCouponError(errorMessage));
      return false;
    }
  };

// Selectors
export const selectCouponsData = (state: { coupons: CouponState }) =>
  state.coupons.data;
export const selectCouponsLoading = (state: { coupons: CouponState }) =>
  state.coupons.isLoading;
export const selectCouponsError = (state: { coupons: CouponState }) =>
  state.coupons.error;
export const selectSelectedCoupon = (state: { coupons: CouponState }) =>
  state.coupons.selectedCoupon;
export const selectCouponsFilters = (state: { coupons: CouponState }) =>
  state.coupons.filters;

// Export the reducer
export default couponSlice.reducer;
