import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";
import { RootState } from "../store";

// --- Interfaces ---
// Define shapes based on what your UI expects
interface ReportState {
  overview: { data: any; isLoading: boolean; error: string | null };
  appointments: { data: any[]; isLoading: boolean; error: string | null };
  patients: { data: any[]; isLoading: boolean; error: string | null };
  prescriptions: { data: any[]; isLoading: boolean; error: string | null };
  export: { isLoading: boolean; error: string | null };
}

const initialState: ReportState = {
  overview: { data: null, isLoading: false, error: null },
  appointments: { data: [], isLoading: false, error: null },
  patients: { data: [], isLoading: false, error: null },
  prescriptions: { data: [], isLoading: false, error: null },
  export: { isLoading: false, error: null },
};

// Helper for Auth Headers
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

const API_URL = `${getApiV1BaseUrl()}/reports`;

// --- Thunks ---

// 1. Overview Report
export const fetchOverviewReport = createAsyncThunk(
  "reports/fetchOverview",
  async (params: { from?: string; to?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const response = await axios.get(
        `${API_URL}/overview?${query}`,
        getAuthConfig(),
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch overview",
      );
    }
  },
);

// 2. Appointment Report
export const fetchAppointmentReport = createAsyncThunk(
  "reports/fetchAppointments",
  async (params: { from?: string; to?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const response = await axios.get(
        `${API_URL}/appointments?${query}`,
        getAuthConfig(),
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch appointment stats",
      );
    }
  },
);

// 3. Patient Report
export const fetchPatientReport = createAsyncThunk(
  "reports/fetchPatients",
  async (params: { from?: string; to?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const response = await axios.get(
        `${API_URL}/patients?${query}`,
        getAuthConfig(),
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch patient stats",
      );
    }
  },
);

// 4. Prescription Report
export const fetchPrescriptionReport = createAsyncThunk(
  "reports/fetchPrescriptions",
  async (params: { from?: string; to?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const response = await axios.get(
        `${API_URL}/prescriptions?${query}`,
        getAuthConfig(),
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch prescription stats",
      );
    }
  },
);

// 5. Export Report
export const exportReportData = createAsyncThunk(
  "reports/export",
  async (
    params: { type: string; from?: string; to?: string; format?: string },
    { rejectWithValue },
  ) => {
    try {
      const config = getAuthConfig();
      const query = new URLSearchParams(params as any).toString();

      const response = await axios.get(`${API_URL}/export?${query}`, {
        ...config,
        responseType: "blob", // Important for file download
      });

      // Trigger Download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Use .txt extension for PDF format since backend doesn't generate real PDFs yet
      const fileExtension =
        params.format === "pdf" ? "txt" : params.format || "csv";
      link.setAttribute(
        "download",
        `report-${params.type}-${Date.now()}.${fileExtension}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to export report",
      );
    }
  },
);

// --- Slice ---

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Overview
    builder.addCase(fetchOverviewReport.pending, (state) => {
      state.overview.isLoading = true;
    });
    builder.addCase(fetchOverviewReport.fulfilled, (state, action) => {
      state.overview.isLoading = false;
      state.overview.data = action.payload;
    });
    builder.addCase(fetchOverviewReport.rejected, (state, action) => {
      state.overview.isLoading = false;
      state.overview.error = action.payload as string;
    });

    // Appointments
    builder.addCase(fetchAppointmentReport.pending, (state) => {
      state.appointments.isLoading = true;
    });
    builder.addCase(fetchAppointmentReport.fulfilled, (state, action) => {
      state.appointments.isLoading = false;
      state.appointments.data = action.payload;
    });
    builder.addCase(fetchAppointmentReport.rejected, (state, action) => {
      state.appointments.isLoading = false;
      state.appointments.error = action.payload as string;
    });

    // Patients
    builder.addCase(fetchPatientReport.pending, (state) => {
      state.patients.isLoading = true;
    });
    builder.addCase(fetchPatientReport.fulfilled, (state, action) => {
      state.patients.isLoading = false;
      state.patients.data = action.payload;
    });
    builder.addCase(fetchPatientReport.rejected, (state, action) => {
      state.patients.isLoading = false;
      state.patients.error = action.payload as string;
    });

    // Prescriptions
    builder.addCase(fetchPrescriptionReport.pending, (state) => {
      state.prescriptions.isLoading = true;
    });
    builder.addCase(fetchPrescriptionReport.fulfilled, (state, action) => {
      state.prescriptions.isLoading = false;
      state.prescriptions.data = action.payload;
    });
    builder.addCase(fetchPrescriptionReport.rejected, (state, action) => {
      state.prescriptions.isLoading = false;
      state.prescriptions.error = action.payload as string;
    });

    // Export
    builder.addCase(exportReportData.pending, (state) => {
      state.export.isLoading = true;
    });
    builder.addCase(exportReportData.fulfilled, (state) => {
      state.export.isLoading = false;
    });
    builder.addCase(exportReportData.rejected, (state, action) => {
      state.export.isLoading = false;
      state.export.error = action.payload as string;
    });
  },
});

// Selectors
export const selectOverviewReport = (state: RootState) =>
  state.reports.overview;
export const selectAppointmentReport = (state: RootState) =>
  state.reports.appointments;
export const selectPatientReport = (state: RootState) => state.reports.patients;
export const selectPrescriptionReport = (state: RootState) =>
  state.reports.prescriptions;
export const selectExportStatus = (state: RootState) => state.reports.export;

export default reportSlice.reducer;
