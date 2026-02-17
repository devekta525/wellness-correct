import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { getApiV1BaseUrl } from "../../utils/api";

interface Appointment {
  time: string;
  patient: string;
  type: string;
  status: string;
  specialization: string;
}

interface Prescription {
  patient: string;
  medication: string;
  dosage: string;
  date: string;
  status: string;
}

interface DashboardData {
  stats: {
    todayAppointments: number;
    totalPatients: number;
    prescriptionsCount: number;
    consultationFee: number;
    rating: number;
    experience: string;
  };
  todaysAppointments: Appointment[];
  recentPrescriptions: Prescription[];
  doctorName?: string;
}

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  isLoading: false,
  error: null,
};

interface TodaysAppointmentCount {
  totalToday: number;
  date: string;
}

interface AppointmentCountState {
  count: TodaysAppointmentCount | null;
  isLoading: boolean;
  error: string | null;
}

const appointmentCountInitialState: AppointmentCountState = {
  count: null,
  isLoading: false,
  error: null,
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

const API_URL = `${getApiV1BaseUrl()}/dashboard/doctor`;
const APPOINTMENT_COUNT_URL = `${getApiV1BaseUrl()}/appointments/today/count`;

// --- Thunk ---
export const fetchDoctorDashboard = createAsyncThunk(
  "dashboard/fetchDoctor",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthConfig());
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard data",
      );
    }
  },
);

// Fetch today's appointments count
export const fetchTodaysAppointmentCount = createAsyncThunk(
  "dashboard/fetchTodaysCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(APPOINTMENT_COUNT_URL, getAuthConfig());
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch today's appointments count",
      );
    }
  },
);

// --- Slice ---
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchDoctorDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Appointment Count Slice
const appointmentCountSlice = createSlice({
  name: "appointmentCount",
  initialState: appointmentCountInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodaysAppointmentCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodaysAppointmentCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.count = action.payload;
      })
      .addCase(fetchTodaysAppointmentCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// --- Selectors ---
export const selectDashboardData = (state: RootState) => state.dashboard.data;
export const selectDashboardLoading = (state: RootState) =>
  state.dashboard.isLoading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;

export const selectTodaysAppointmentCount = (state: RootState) =>
  state.appointmentCount?.count?.totalToday ?? null;
export const selectTodaysAppointmentCountLoading = (state: RootState) =>
  state.appointmentCount?.isLoading ?? false;
export const selectTodaysAppointmentCountError = (state: RootState) =>
  state.appointmentCount?.error ?? null;

export default dashboardSlice.reducer;
export const appointmentCountReducer = appointmentCountSlice.reducer;
