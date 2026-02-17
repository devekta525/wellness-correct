import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface ApiAppointment {
  _id: string;
  patient: User | string;
  patientName: string;
  doctor: User | string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: "consultation" | "follow-up" | "emergency" | "checkup";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason: string;
  notes?: string;
  location?: string;
  fee: number;
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAvatar: string;
  date: string;
  time: string;
  duration: number;
  type: "consultation" | "follow-up" | "emergency" | "checkup" | string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string;
  reason: string;
  notes: string;
  doctor: string;
  location: string;
  fee: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentStats {
  todaysAppointments: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  totalCompleted: number;
  confirmedToday: number;
}

interface AppointmentState {
  data: Appointment[];
  stats: AppointmentStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: AppointmentState = {
  data: [],
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const API_BASE_URL = `${getApiV1BaseUrl()}/appointments`;

// --- Helper for Auth Headers ---
const getAuthConfig = () => {
  // Added window check for Next.js SSR safety
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");
    if (token) token = token.replace(/^"|"$/g, "");
  }

  return {
    withCredentials: true,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    },
  };
};

// --- Helper to map API response to UI format ---
const mapApiToUI = (apiAppt: ApiAppointment): Appointment => {
  const patientObj =
    typeof apiAppt.patient === "object" ? apiAppt.patient : null;
  const doctorObj = typeof apiAppt.doctor === "object" ? apiAppt.doctor : null;

  return {
    id: apiAppt._id,
    patientId: patientObj ? patientObj._id : (apiAppt.patient as string),
    patientName:
      apiAppt.patientName ||
      (patientObj
        ? `${patientObj.firstName}${patientObj.lastName ? " " + patientObj.lastName : ""}`.trim()
        : "Unknown"),
    patientEmail: patientObj ? patientObj.email : "",
    patientPhone: patientObj?.phone || "",
    patientAvatar: patientObj?.avatar || "",
    date: new Date(apiAppt.appointmentDate).toISOString().split("T")[0],
    time: apiAppt.appointmentTime,
    duration: apiAppt.duration,
    type: apiAppt.type,
    status: apiAppt.status,
    reason: apiAppt.reason,
    notes: apiAppt.notes || "",
    doctor: doctorObj
      ? `${doctorObj.firstName} ${doctorObj.lastName}`
      : "Unknown Doctor",
    location: apiAppt.location || "Online",
    fee: apiAppt.fee,
    paymentStatus: apiAppt.paymentStatus,
    createdAt: apiAppt.createdAt,
    updatedAt: apiAppt.updatedAt,
  };
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setAppointments: (
      state,
      action: PayloadAction<{ data: Appointment[]; total: number }>,
    ) => {
      state.data = action.payload.data;
      state.pagination.total = action.payload.total;
      state.isLoading = false;
    },
    addAppointmentToList: (state, action: PayloadAction<Appointment>) => {
      state.data.unshift(action.payload);
      state.pagination.total += 1;
      state.isLoading = false;
    },
    updateAppointmentInList: (state, action: PayloadAction<Appointment>) => {
      const index = state.data.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) state.data[index] = action.payload;
      state.isLoading = false;
    },
    removeAppointmentFromList: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((a) => a.id !== action.payload);
      state.pagination.total -= 1;
      state.isLoading = false;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setStats: (state, action: PayloadAction<AppointmentStats>) => {
      state.stats = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setAppointments,
  addAppointmentToList,
  updateAppointmentInList,
  removeAppointmentFromList,
  setPage,
  setStats,
} = appointmentSlice.actions;

// --- Async Thunks ---

export const fetchAppointments =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading());
    try {
      const { page, limit } = getState().appointments.pagination;
      const url = `${API_BASE_URL}?page=${page}&limit=${limit}`;
      const response = await axios.get(url, getAuthConfig());

      if (response.data.success) {
        const uiData = response.data.data.map((item: ApiAppointment) =>
          mapApiToUI(item),
        );
        dispatch(
          setAppointments({
            data: uiData,
            total: response.data.pagination?.total || uiData.length,
          }),
        );
      } else {
        dispatch(
          setError(response.data.message || "Failed to fetch appointments"),
        );
      }
    } catch (error: any) {
      console.error("Fetch appointments error:", error);
      console.error("Error response:", error.response?.data);
      dispatch(
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch appointments",
        ),
      );
    }
  };

export const createAppointment =
  (formData: any) => async (dispatch: AppDispatch) => {
    dispatch(setLoading());
    try {
      const response = await axios.post(
        `${API_BASE_URL}`,
        formData,
        getAuthConfig(),
      );

      if (response.data.success) {
        dispatch(addAppointmentToList(mapApiToUI(response.data.data)));
        return true;
      }
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to create appointment",
        ),
      );
      return false;
    }
  };

export const updateAppointment =
  (id: string, formData: any) => async (dispatch: AppDispatch) => {
    dispatch(setLoading());
    try {
      const payload = {
        ...formData,
        ...(formData.date && { appointmentDate: formData.date }),
        ...(formData.time && { appointmentTime: formData.time }),
      };

      const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        payload,
        getAuthConfig(),
      );

      if (response.data.success) {
        dispatch(updateAppointmentInList(mapApiToUI(response.data.data)));
        return true;
      }
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to update appointment",
        ),
      );
      return false;
    }
  };

export const deleteAppointment =
  (id: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading());
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/${id}`,
        getAuthConfig(),
      );

      if (response.data.success) {
        dispatch(removeAppointmentFromList(id));
        return true;
      }
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to delete appointment",
        ),
      );
      return false;
    }
  };

export const fetchAppointmentStats = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`, getAuthConfig());

    if (response.data.success) {
      dispatch(setStats(response.data.data));
    }
  } catch (error: any) {
    console.error(
      "Failed to fetch appointment stats:",
      error.response?.data?.message || error.message,
    );
  }
};

export const exportAppointments = async (
  filters?: Record<string, any>,
): Promise<Blob | null> => {
  try {
    const queryParams = new URLSearchParams(filters || {}).toString();
    const response = await axios.get(
      `${API_BASE_URL}/export${queryParams ? `?${queryParams}` : ""}`,
      {
        ...getAuthConfig(),
        responseType: "blob",
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to export appointments:",
      error.response?.data?.message || error.message,
    );
    return null;
  }
};

// --- Selectors ---
// Using RootState ensures TypeScript knows 'appointments' exists in the store
export const selectAppointments = (state: RootState) => state.appointments.data;
export const selectApptLoading = (state: RootState) =>
  state.appointments.isLoading;
export const selectApptError = (state: RootState) => state.appointments.error;
export const selectApptPagination = (state: RootState) =>
  state.appointments.pagination;
export const selectApptStats = (state: RootState) => state.appointments.stats;

export default appointmentSlice.reducer;
