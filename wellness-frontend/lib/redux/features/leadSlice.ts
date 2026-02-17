import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = getApiV1BaseUrl();

// Lead interface based on provided sample
export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  estimatedValue: number;
  notes: string;
  lastContact: string;
  createdAt: string;
  updatedAt: string;
}

// Define the API Lead type (from backend)
interface ApiLead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  estimatedValue: number;
  notes: string;
  lastContact: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
}

// Define the state structure
interface LeadState {
  data: Lead[];
  isLoading: boolean;
  error: string | null;
  selectedLead: Lead | null;
  filters: {
    status: string;
    priority: string;
    assignedTo: string;
    search: string;
    estimatedValueRange?: {
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

// Initial state
const initialState: LeadState = {
  data: [],
  isLoading: false,
  error: null,
  selectedLead: null,
  filters: {
    status: "",
    priority: "",
    assignedTo: "",
    search: "",
    estimatedValueRange: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Create the slice
const leadSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setLeadData: (
      state,
      action: PayloadAction<{ data: Lead[]; total: number }>,
    ) => {
      state.data = action.payload.data;
      state.pagination.total = action.payload.total;
      state.isLoading = false;
      state.error = null;
    },
    setLeadLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setLeadError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedLead: (state, action: PayloadAction<Lead>) => {
      state.selectedLead = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<LeadState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<LeadState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },
    updateLeadInList: (state, action: PayloadAction<Lead>) => {
      const index = state.data.findIndex(
        (lead) => lead._id === action.payload._id,
      );
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    removeLeadFromList: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((lead) => lead._id !== action.payload);
      state.pagination.total = state.pagination.total - 1;
    },
  },
});

// Export actions
export const {
  setLeadData,
  setLeadLoading,
  setLeadError,
  setSelectedLead,
  setFilters,
  setPagination,
  clearSelectedLead,
  updateLeadInList,
  removeLeadFromList,
} = leadSlice.actions;

// Helper function to map API lead to our Lead interface
const mapApiLeadToLead = (apiLead: ApiLead): Lead => ({
  _id: apiLead._id,
  name: apiLead.name,
  email: apiLead.email,
  phone: apiLead.phone,
  subject: apiLead.subject,
  message: apiLead.message,
  status: apiLead.status,
  priority: apiLead.priority,
  estimatedValue: apiLead.estimatedValue || 0,
  notes: apiLead.notes || "",
  lastContact: apiLead.lastContact,
  createdAt: apiLead.createdAt,
  updatedAt: apiLead.updatedAt,
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

// Fetch leads with filters and pagination
export const fetchLeadsData =
  () => async (dispatch: AppDispatch, getState: () => { leads: LeadState }) => {
    dispatch(setLeadLoading());
    try {
      const { filters, pagination } = getState().leads;
      const queryParams = new URLSearchParams();

      // Add pagination parameters
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      // Add filter parameters if they exist
      if (filters.status && filters.status !== "All") {
        queryParams.append("status", filters.status);
      }
      if (filters.priority && filters.priority !== "All") {
        queryParams.append("priority", filters.priority);
      }
      if (filters.assignedTo && filters.assignedTo !== "All") {
        queryParams.append("assignedTo", filters.assignedTo);
      }
      if (filters.search) {
        queryParams.append("q", filters.search);
      }
      if (filters.estimatedValueRange) {
        queryParams.append(
          "minValue",
          filters.estimatedValueRange.min.toString(),
        );
        queryParams.append(
          "maxValue",
          filters.estimatedValueRange.max.toString(),
        );
      }

      const response = await axios.get(`${API_BASE_URL}/leads?${queryParams}`);

      if (response.data?.success) {
        // Map API response to our Lead interface
        const mappedLeads = response.data.data.map((lead: ApiLead) =>
          mapApiLeadToLead(lead),
        );

        dispatch(
          setLeadData({
            data: mappedLeads,
            total: response.data.pagination.total,
          }),
        );
      } else {
        throw new Error(response.data?.message || "Failed to fetch leads");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setLeadError(errorMessage));
      return false;
    }
  };

// Fetch active leads
export const fetchActiveLeads =
  () => async (dispatch: AppDispatch, getState: () => { leads: LeadState }) => {
    dispatch(setLeadLoading());
    try {
      const { filters, pagination } = getState().leads;
      const queryParams = new URLSearchParams();

      // Add pagination parameters
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      // Add filter parameters if they exist
      if (filters.status && filters.status !== "") {
        queryParams.append("status", filters.status);
      }
      if (filters.search) {
        queryParams.append("q", filters.search);
      }

      const response = await axios.get(`${API_BASE_URL}/leads?${queryParams}`);
      if (response.data?.success) {
        // Map API response to our Lead interface
        const mappedLeads = response.data.data.map((lead: ApiLead) =>
          mapApiLeadToLead(lead),
        );

        dispatch(
          setLeadData({
            data: mappedLeads,
            total: response.data.pagination.total,
          }),
        );
      } else {
        throw new Error(response.data?.message || "Failed to fetch leads");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setLeadError(errorMessage));
      return false;
    }
  };

// Fetch lead by ID
export const fetchLeadById =
  (leadId: string) => async (dispatch: AppDispatch) => {
    dispatch(setLeadLoading());
    try {
      const response = await axios.get(`${API_BASE_URL}/leads/${leadId}`);
      if (response.data?.success) {
        const lead = response.data.data;
        const mappedLead = mapApiLeadToLead(lead);
        dispatch(setSelectedLead(mappedLead));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch lead");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setLeadError(errorMessage));
      return false;
    }
  };

// Fetch leads by status
export const fetchLeadsByStatus =
  (status: string) =>
  async (dispatch: AppDispatch, getState: () => { leads: LeadState }) => {
    dispatch(setLeadLoading());
    try {
      const { pagination } = getState().leads;
      const queryParams = new URLSearchParams();

      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("status", status);

      const response = await axios.get(`${API_BASE_URL}/leads?${queryParams}`);
      if (response.data?.success) {
        const mappedLeads = response.data.data.map((lead: ApiLead) =>
          mapApiLeadToLead(lead),
        );

        dispatch(
          setLeadData({
            data: mappedLeads,
            total: response.data.pagination.total,
          }),
        );
      } else {
        throw new Error(
          response.data?.message || "Failed to fetch leads by status",
        );
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setLeadError(errorMessage));
      return false;
    }
  };

// Fetch latest leads
export const fetchLatestLeads = () => async (dispatch: AppDispatch) => {
  dispatch(setLeadLoading());
  try {
    const response = await axios.get(
      `${API_BASE_URL}/leads?sort=-createdAt&limit=10`,
    );
    if (response.data?.success) {
      // Map API response to our Lead interface
      const mappedLeads = response.data.data.map((lead: ApiLead) =>
        mapApiLeadToLead(lead),
      );

      dispatch(
        setLeadData({
          data: mappedLeads,
          total: response.data.pagination.total,
        }),
      );
    } else {
      throw new Error(response.data?.message || "Failed to fetch latest leads");
    }
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setLeadError(errorMessage));
    return false;
  }
};

// Add a new lead
export const createLead =
  (newLead: Partial<Lead>) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/leads`, newLead);
      if (response.data?.success) {
        dispatch(setLeadLoading());
        return true;
      } else {
        const errorMessage = response.data?.message || "Failed to create lead";
        dispatch(setLeadError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setLeadError(errorMessage));
      return false;
    }
  };
// Update lead status
export const updateLeadStatus =
  (leadId: string, status: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/leads/${leadId}/status`,
        { status },
      );
      if (response.data?.success) {
        dispatch(setLeadLoading());
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to update lead status",
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setLeadError(errorMessage));
    }
  };
// Update lead priority
export const updateLeadPriority =
  (leadId: string, priority: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/leads/${leadId}`, {
        priority,
      });
      if (response.data?.success) {
        dispatch(setLeadLoading());
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to update lead priority",
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setLeadError(errorMessage));
    }
  };

// Assign lead to user
export const assignLead =
  (leadId: string, assignedTo: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/leads/${leadId}`, {
        assignedTo,
      });
      if (response.data?.success) {
        dispatch(setLeadLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to assign lead");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setLeadError(errorMessage));
    }
  };

// Edit a lead
export const updateLead =
  (leadId: string, updatedData: Partial<Lead>) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/leads/${leadId}`,
        updatedData,
      );
      if (response.data?.success) {
        if (response.data.data) {
          const mappedLead = mapApiLeadToLead(response.data.data);
          dispatch(updateLeadInList(mappedLead));
        }
        dispatch(setLeadLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update lead");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setLeadError(errorMessage));
      return false;
    }
  };

// Delete a lead
export const deleteLead = (leadId: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/leads/${leadId}`);
    if (response.data?.success) {
      dispatch(removeLeadFromList(leadId));
      return true;
    } else {
      throw new Error(response.data?.message || "Failed to delete lead");
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setLeadError(errorMessage));
    return false;
  }
};

// Mark lead as contacted
export const markLeadContacted =
  (leadId: string, notes?: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/leads/${leadId}/last-contact`,
        { notes },
      );
      if (response.data?.success) {
        if (response.data.data) {
          const mappedLead = mapApiLeadToLead(response.data.data);
          dispatch(updateLeadInList(mappedLead));
        }
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to mark lead as contacted",
        );
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setLeadError(errorMessage));
      return false;
    }
  };

// Selectors
export const selectLeadsData = (state: { leads: LeadState }) =>
  state.leads.data;
export const selectLeadsLoading = (state: { leads: LeadState }) =>
  state.leads.isLoading;
export const selectLeadsError = (state: { leads: LeadState }) =>
  state.leads.error;
export const selectSelectedLead = (state: { leads: LeadState }) =>
  state.leads.selectedLead;
export const selectLeadsFilters = (state: { leads: LeadState }) =>
  state.leads.filters;
export const selectLeadsPagination = (state: { leads: LeadState }) =>
  state.leads.pagination;

// Export the reducer
export default leadSlice.reducer;
