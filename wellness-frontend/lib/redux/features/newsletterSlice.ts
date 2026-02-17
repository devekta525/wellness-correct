import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

export interface Newsletter {
  _id: string;
  email: string;
  status: "Subscribed" | "Unsubscribed";
  createdAt: string;
  updatedAt: string;
}

interface ApiNewsletter {
  _id: string;
  email: string;
  status: "Subscribed" | "Unsubscribed";
  createdAt: string;
  updatedAt: string;
}

interface NewsletterState {
  data: Newsletter[];
  isLoading: boolean;
  error: string | null;
  selectedNewsletter: Newsletter | null;
  filters: {
    status: string;
    email?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: NewsletterState = {
  data: [],
  isLoading: false,
  error: null,
  selectedNewsletter: null,
  filters: {
    status: "",
    email: "",
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

const newsletterSlice = createSlice({
  name: "newsletters",
  initialState,
  reducers: {
    setNewsletterData: (
      state,
      action: PayloadAction<{ data: Newsletter[]; total: number }>,
    ) => {
      state.data = action.payload.data;
      state.pagination.total = action.payload.total;
      state.isLoading = false;
      state.error = null;
    },
    setNewsletterLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setNewsletterError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedNewsletter: (
      state,
      action: PayloadAction<Newsletter | null>,
    ) => {
      state.selectedNewsletter = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setNewsletterFilters: (
      state,
      action: PayloadAction<Partial<NewsletterState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<NewsletterState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedNewsletter: (state) => {
      state.selectedNewsletter = null;
    },
  },
});

export const {
  setNewsletterData,
  setNewsletterLoading,
  setNewsletterError,
  setSelectedNewsletter,
  setNewsletterFilters,
  setPagination,
  clearSelectedNewsletter,
} = newsletterSlice.actions;

const mapApiNewsletterToNewsletter = (
  apiNewsletter: ApiNewsletter,
): Newsletter => ({
  _id: apiNewsletter._id,
  email: apiNewsletter.email,
  status: apiNewsletter.status,
  createdAt: apiNewsletter.createdAt,
  updatedAt: apiNewsletter.updatedAt,
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

export const fetchNewslettersData =
  () =>
  async (
    dispatch: AppDispatch,
    getState: () => { newsletters: NewsletterState },
  ) => {
    dispatch(setNewsletterLoading());
    try {
      const { filters, pagination } = getState().newsletters;
      const queryParams = new URLSearchParams();

      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.email) {
        queryParams.append("email", filters.email);
      }

      const response = await api.get(`/newsletters?${queryParams}`);

      if (response.data?.success) {
        const mappedNewsletters = response.data.data.map(
          (item: ApiNewsletter) => mapApiNewsletterToNewsletter(item),
        );

        dispatch(
          setNewsletterData({
            data: mappedNewsletters,
            total: response.data.pagination?.total || response.data.data.length,
          }),
        );
      } else {
        throw new Error(
          response.data?.message || "Failed to fetch newsletters",
        );
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setNewsletterError(errorMessage));
      return false;
    }
  };

export const fetchNewsletterById =
  (newsletterId: string) => async (dispatch: AppDispatch) => {
    dispatch(setNewsletterLoading());
    try {
      const response = await api.get(`/newsletters/${newsletterId}`);
      if (response.data?.success) {
        const newsletter = response.data.data;
        const mappedNewsletter = mapApiNewsletterToNewsletter(newsletter);
        dispatch(setSelectedNewsletter(mappedNewsletter));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch newsletter");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setNewsletterError(errorMessage));
      return false;
    }
  };

export const createNewsletter =
  (email: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.post(`/newsletters`, { email });
      if (response.data?.success) {
        dispatch(fetchNewslettersData());
        return true;
      } else {
        const errorMessage =
          response.data?.message || "Failed to subscribe to newsletter";
        dispatch(setNewsletterError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setNewsletterError(errorMessage));
      return false;
    }
  };

export const updateNewsletterStatus =
  (newsletterId: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.put(`/newsletters/${newsletterId}`);
      if (response.data?.success) {
        dispatch(fetchNewslettersData());
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to update newsletter status",
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setNewsletterError(errorMessage));
      return false;
    }
  };

export const deleteNewsletter =
  (newsletterId: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await api.delete(`/newsletters/${newsletterId}`);
      if (response.data?.success) {
        dispatch(fetchNewslettersData());
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to delete newsletter",
        );
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setNewsletterError(errorMessage));
      return false;
    }
  };

export const selectNewslettersData = (state: {
  newsletters: NewsletterState;
}) => state.newsletters.data;
export const selectNewslettersLoading = (state: {
  newsletters: NewsletterState;
}) => state.newsletters.isLoading;
export const selectNewslettersError = (state: {
  newsletters: NewsletterState;
}) => state.newsletters.error;
export const selectSelectedNewsletter = (state: {
  newsletters: NewsletterState;
}) => state.newsletters.selectedNewsletter;
export const selectNewsletterFilters = (state: {
  newsletters: NewsletterState;
}) => state.newsletters.filters;
export const selectNewsletterPagination = (state: {
  newsletters: NewsletterState;
}) => state.newsletters.pagination;

export default newsletterSlice.reducer;
