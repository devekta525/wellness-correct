import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";
import { RootState } from "../store";

// --- Types ---
export interface PrescriptionMedication {
  product: string;
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing?: string;
  instructions?: string;
  quantity: number;
  price?: number;
}

export interface Prescription {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    patientId?: string;
    email?: string;
    phone?: string;
  };
  patientName: string;
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
    license?: string;
  };
  prescriptionDate: string;
  diagnosis: string;
  symptoms?: string;
  medications: PrescriptionMedication[];
  generalInstructions?: string;
  followUpDate?: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface PrescriptionState {
  data: Prescription[];
  selectedPrescription: Prescription | null;
  stats: {
    totalPrescriptions: number;
    activePrescriptions: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: PrescriptionState = {
  data: [],
  selectedPrescription: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

const getAuthConfig = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return {
    withCredentials: true,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    },
  };
};

const API_URL = `${getApiV1BaseUrl()}/prescriptions`;

// --- Thunks ---

export const fetchPrescriptions = createAsyncThunk(
  "prescriptions/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append("page", params.page.toString());
      if (params.limit) query.append("limit", params.limit.toString());
      if (params.status && params.status !== "all")
        query.append("status", params.status);
      if (params.search) query.append("search", params.search);

      const response = await axios.get(
        `${API_URL}?${query.toString()}`,
        getAuthConfig(),
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch prescriptions",
      );
    }
  },
);

export const fetchPrescriptionById = createAsyncThunk(
  "prescriptions/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch prescription",
      );
    }
  },
);

export const createPrescription = createAsyncThunk(
  "prescriptions/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data, getAuthConfig());
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create prescription",
      );
    }
  },
);

export const updatePrescription = createAsyncThunk(
  "prescriptions/update",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/${id}`,
        data,
        getAuthConfig(),
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update prescription",
      );
    }
  },
);

export const deletePrescription = createAsyncThunk(
  "prescriptions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthConfig());
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete prescription",
      );
    }
  },
);

export const fetchPrescriptionStats = createAsyncThunk(
  "prescriptions/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/stats`, getAuthConfig());
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

export const exportPrescriptions = createAsyncThunk(
  "prescriptions/export",
  async (_, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const response = await axios.get(`${API_URL}/export`, {
        ...config,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescriptions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to export",
      );
    }
  },
);

// --- Slice ---

const prescriptionSlice = createSlice({
  name: "prescriptions",
  initialState,
  reducers: {
    clearSelectedPrescription: (state) => {
      state.selectedPrescription = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPrescriptionById.fulfilled, (state, action) => {
        state.selectedPrescription = action.payload;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
        state.isLoading = false;
      })
      .addCase(createPrescription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePrescription.fulfilled, (state, action) => {
        const index = state.data.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.isLoading = false;
      })
      .addCase(deletePrescription.fulfilled, (state, action) => {
        state.data = state.data.filter((p) => p._id !== action.payload);
      })
      .addCase(fetchPrescriptionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearSelectedPrescription } = prescriptionSlice.actions;

export const selectPrescriptions = (state: RootState) =>
  state.prescriptions.data;
export const selectPrescriptionStats = (state: RootState) =>
  state.prescriptions.stats;
export const selectPrescriptionLoading = (state: RootState) =>
  state.prescriptions.isLoading;
export const selectPrescriptionPagination = (state: RootState) =>
  state.prescriptions.pagination;
export const selectSelectedPrescription = (state: RootState) =>
  state.prescriptions.selectedPrescription;

export default prescriptionSlice.reducer;
