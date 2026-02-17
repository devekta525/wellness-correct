import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppDispatch, RootState } from "../store";
import { getApiV1BaseUrl } from "../../utils/api";

export interface Patient {
  _id: string;
  patientId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  age?: number;
  bloodGroup?: string;
  location?: string;
  status?: string;
  patientType?: string;
  emergencyContact?: string | { name: string; phone: string };
  insuranceProvider?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  tags?: string[];
  note?: string;
  avatar?: string;
  lastVisit?: string;
  totalVisits?: number;
  totalFees?: number;
  createdAt: string;
  updatedAt: string;
}

interface PatientStats {
  totalPatients: number;
  activePatients: number;
  vipPatients: number;
  newPatients: number;
}

interface PatientState {
  data: Patient[];
  stats: PatientStats | null;
  isLoading: boolean;
  isStatsLoading: boolean;
  error: string | null;
  statsError: string | null;
  selectedPatient: Patient | null;
}

const initialState: PatientState = {
  data: [],
  stats: null,
  isLoading: false,
  isStatsLoading: false,
  error: null,
  statsError: null,
  selectedPatient: null,
};

const API_BASE_URL = `${getApiV1BaseUrl()}/patients`;

// Helper to get auth token from cookies
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }
  return null;
};

// Helper to create axios config with auth token
const getAuthConfig = () => {
  const token = getAuthToken();
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setPatients: (state, action: PayloadAction<Patient[]>) => {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setPatientsLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setPatientsError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedPatient: (state, action: PayloadAction<Patient | null>) => {
      state.selectedPatient = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setStatsLoading: (state) => {
      state.isStatsLoading = true;
      state.statsError = null;
    },
    setPatientStats: (state, action: PayloadAction<PatientStats>) => {
      state.stats = action.payload;
      state.isStatsLoading = false;
      state.statsError = null;
    },
    setStatsError: (state, action: PayloadAction<string>) => {
      state.isStatsLoading = false;
      state.statsError = action.payload;
    },
  },
});

export const {
  setPatients,
  setPatientsLoading,
  setPatientsError,
  setSelectedPatient,
  setStatsLoading,
  setPatientStats,
  setStatsError,
} = patientSlice.actions;

const mapApiPatientToPatient = (apiPatient: any): Patient => ({
  _id: apiPatient._id,
  patientId: apiPatient.patientId,
  firstName: apiPatient.firstName || "",
  lastName: apiPatient.lastName || "",
  email: apiPatient.email || "",
  phone: apiPatient.phone || "",
  gender: apiPatient.gender,
  dateOfBirth: apiPatient.dateOfBirth,
  age: apiPatient.age,
  bloodGroup: apiPatient.bloodGroup,
  location: apiPatient.location,
  status: apiPatient.status,
  patientType: apiPatient.patientType,
  emergencyContact: apiPatient.emergencyContact,
  insuranceProvider: apiPatient.insuranceProvider,
  medicalHistory: apiPatient.medicalHistory || [],
  currentMedications: apiPatient.currentMedications || [],
  allergies: apiPatient.allergies || [],
  tags: apiPatient.tags || [],
  note: apiPatient.note,
  avatar: apiPatient.avatar || apiPatient.imageUrl,
  lastVisit: apiPatient.lastVisit,
  totalVisits: apiPatient.totalVisits,
  totalFees: apiPatient.totalFees,
  createdAt: apiPatient.createdAt,
  updatedAt: apiPatient.updatedAt,
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

export const fetchPatients =
  () =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setPatientsLoading());
    try {
      const response = await axios.get(API_BASE_URL, getAuthConfig());
      if (response.data?.success && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map(mapApiPatientToPatient);
        dispatch(setPatients(mapped));
        return true;
      }
      throw new Error(response.data?.message || "Failed to fetch patients");
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch(setPatientsError(errorMessage));
      return false;
    }
  };

export const fetchPatientStats =
  () =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setStatsLoading());
    try {
      const response = await axios.get(
        `${API_BASE_URL}/stats`,
        getAuthConfig(),
      );
      if (response.data?.success && response.data.data) {
        dispatch(
          setPatientStats({
            totalPatients: response.data.data.totalPatients ?? 0,
            activePatients: response.data.data.activePatients ?? 0,
            vipPatients: response.data.data.vipPatients ?? 0,
            newPatients: response.data.data.newPatients ?? 0,
          }),
        );
        return true;
      }
      throw new Error(response.data?.message || "Failed to fetch stats");
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch(setStatsError(errorMessage));
      return false;
    }
  };

export const fetchPatientById =
  (patientId: string) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setPatientsLoading());
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${patientId}`,
        getAuthConfig(),
      );
      if (response.data?.success && response.data.data) {
        dispatch(
          setSelectedPatient(mapApiPatientToPatient(response.data.data)),
        );
        return true;
      }
      throw new Error(response.data?.message || "Failed to fetch patient");
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch(setPatientsError(errorMessage));
      return false;
    }
  };

export const createPatient =
  (payload: Partial<Patient>) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    try {
      const response = await axios.post(API_BASE_URL, payload, getAuthConfig());
      if (response.data?.success) {
        await dispatch(fetchPatients());
        return true;
      }
      const errorMessage = response.data?.message || "Failed to create patient";
      dispatch(setPatientsError(errorMessage));
      return false;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch(setPatientsError(errorMessage));
      return false;
    }
  };

export const updatePatientRecord =
  (patientId: string, payload: Partial<Patient>) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${patientId}`,
        payload,
        getAuthConfig(),
      );
      if (response.data?.success) {
        await dispatch(fetchPatients());
        return true;
      }
      throw new Error(response.data?.message || "Failed to update patient");
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch(setPatientsError(errorMessage));
      return false;
    }
  };

export const deletePatientRecord =
  (patientId: string) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/${patientId}`,
        getAuthConfig(),
      );
      if (response.data?.success) {
        await dispatch(fetchPatients());
        return true;
      }
      throw new Error(response.data?.message || "Failed to delete patient");
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch(setPatientsError(errorMessage));
      return false;
    }
  };

export const exportPatientsList = async (): Promise<Blob | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/export`, {
      responseType: "blob",
      ...getAuthConfig(),
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const selectPatientsData = (state: RootState) => state.patients.data;
export const selectPatientsLoading = (state: RootState) =>
  state.patients.isLoading;
export const selectPatientsError = (state: RootState) => state.patients.error;
export const selectPatientStats = (state: RootState) => state.patients.stats;

export default patientSlice.reducer;
