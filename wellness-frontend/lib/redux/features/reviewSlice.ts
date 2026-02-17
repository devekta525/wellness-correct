import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = `${getApiV1BaseUrl()}/reviews`;

// Define the Review type
export interface Review {
  _id: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  review: string;
  images: string[];
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

// Define the API Review type (from backend)
interface ApiReview {
  _id: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  review: string;
  images: string[];
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

// Define the state structure
interface ReviewState {
  data: Review[];
  publicTestimonials: Review[];
  isLoading: boolean;
  isTestimonialsLoading: boolean;
  error: string | null;
  testimonialsError: string | null;
  selectedReview: Review | null;
  filters: {
    status: "Pending" | "Approved" | "Rejected" | "";
    name?: string;
  };
}

// Initial state
const initialState: ReviewState = {
  data: [],
  publicTestimonials: [],
  isLoading: false,
  isTestimonialsLoading: false,
  error: null,
  testimonialsError: null,
  selectedReview: null,
  filters: {
    status: "",
    name: "",
  },
};

// Create the slice
const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setReviewData: (state, action: PayloadAction<Review[]>) => {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setReviewLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setReviewError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedReview: (state, action: PayloadAction<Review>) => {
      state.selectedReview = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ReviewState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },
    setTestimonialsLoading: (state) => {
      state.isTestimonialsLoading = true;
      state.testimonialsError = null;
    },
    setTestimonialsData: (state, action: PayloadAction<Review[]>) => {
      state.publicTestimonials = action.payload;
      state.isTestimonialsLoading = false;
      state.testimonialsError = null;
    },
    setTestimonialsError: (state, action: PayloadAction<string>) => {
      state.isTestimonialsLoading = false;
      state.testimonialsError = action.payload;
    },
  },
});

// Export actions
export const {
  setReviewData,
  setReviewLoading,
  setReviewError,
  setSelectedReview,
  setFilters,
  clearSelectedReview,
  setTestimonialsLoading,
  setTestimonialsData,
  setTestimonialsError,
} = reviewSlice.actions;

// Helper function to map API review to our Review interface
const mapApiReviewToReview = (apiReview: ApiReview): Review => ({
  _id: apiReview._id,
  name: apiReview.name,
  email: apiReview.email,
  rating: apiReview.rating,
  title: apiReview.title,
  review: apiReview.review,
  images: apiReview.images,
  status: apiReview.status,
  createdAt: apiReview.createdAt,
  updatedAt: apiReview.updatedAt,
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

// Fetch reviews with filters
export const fetchReviewsData =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setReviewLoading());
    try {
      const { filters } = getState().reviews;
      const params: Record<string, string> = {};

      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.name) {
        params.search = filters.name;
      }

      const response = await axios.get(API_BASE_URL, { params });

      if (response.data?.success && Array.isArray(response.data.data)) {
        const mappedReviews = response.data.data.map((review: ApiReview) =>
          mapApiReviewToReview(review),
        );
        dispatch(setReviewData(mappedReviews));
      } else {
        throw new Error(response.data?.message || "Failed to fetch reviews");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setReviewError(errorMessage));
      return false;
    }
  };

// Fetch review by ID
export const fetchReviewById =
  (reviewId: string) => async (dispatch: AppDispatch) => {
    dispatch(setReviewLoading());
    try {
      const response = await axios.get(`${API_BASE_URL}/${reviewId}`);
      if (response.data?.success) {
        const review = response.data.data;
        const mappedReview = mapApiReviewToReview(review);
        dispatch(setSelectedReview(mappedReview));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch review");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setReviewError(errorMessage));
      return false;
    }
  };

// Fetch latest reviews
export const fetchLatestReviews = () => async (dispatch: AppDispatch) => {
  dispatch(setReviewLoading());
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        status: "Approved",
        limit: 5,
        sort: "desc",
      },
    });
    if (response.data?.success && Array.isArray(response.data.data)) {
      const mappedReviews = response.data.data.map((review: ApiReview) =>
        mapApiReviewToReview(review),
      );
      dispatch(setReviewData(mappedReviews));
    } else {
      throw new Error(
        response.data?.message || "Failed to fetch latest reviews",
      );
    }
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setReviewError(errorMessage));
    return false;
  }
};

// Add a new review
export const createReview =
  (newReview: FormData) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(API_BASE_URL, newReview, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data?.success) {
        dispatch(setReviewLoading());
        return true;
      } else {
        const errorMessage =
          response.data?.message || "Failed to create review";
        dispatch(setReviewError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setReviewError(errorMessage));
      return false;
    }
  };

// Update review status
export const updateReviewStatus =
  (reviewId: string, status: "Pending" | "Approved" | "Rejected") =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${reviewId}/status`, {
        status,
      });
      if (response.data?.success) {
        dispatch(setReviewLoading());
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to update review status",
        );
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setReviewError(errorMessage));
    }
  };

// Edit a review
export const updateReview =
  (reviewId: string, updatedData: FormData) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${reviewId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data?.success) {
        dispatch(setReviewLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update review");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setReviewError(errorMessage));
      return false;
    }
  };

// Delete a review
export const deleteReview =
  (reviewId: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${reviewId}`);
      if (response.data?.success) {
        dispatch(setReviewLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete review");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setReviewError(errorMessage));
      return false;
    }
  };

// Public testimonials fetcher
export const fetchTestimonialsReviews =
  (limit = 6) =>
  async (dispatch: AppDispatch) => {
    dispatch(setTestimonialsLoading());
    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          status: "Approved",
          limit,
          sort: "desc",
        },
      });
      if (response.data?.success && Array.isArray(response.data.data)) {
        const mappedReviews = response.data.data.map((review: ApiReview) =>
          mapApiReviewToReview(review),
        );
        dispatch(setTestimonialsData(mappedReviews));
        return true;
      }
      throw new Error(response.data?.message || "Failed to fetch testimonials");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setTestimonialsError(errorMessage));
      return false;
    }
  };

// Selectors
export const selectReviewsData = (state: RootState) => state.reviews.data;
export const selectReviewsLoading = (state: RootState) =>
  state.reviews.isLoading;
export const selectReviewsError = (state: RootState) => state.reviews.error;
export const selectSelectedReview = (state: RootState) =>
  state.reviews.selectedReview;
export const selectReviewsFilters = (state: RootState) => state.reviews.filters;
export const selectTestimonialsData = (state: RootState) =>
  state.reviews.publicTestimonials;
export const selectTestimonialsLoading = (state: RootState) =>
  state.reviews.isTestimonialsLoading;
export const selectTestimonialsError = (state: RootState) =>
  state.reviews.testimonialsError;

// Export the reducer
export default reviewSlice.reducer;
