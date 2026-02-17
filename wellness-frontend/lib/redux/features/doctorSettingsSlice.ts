import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";
import { RootState } from "../store";

interface ProfileSettings {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  qualifications: string;
  license: string;
  hospital: string;
  location: string;
  bio: string;
  avatar: string;
  languages: string[];
  consultationFee: number;
  emergencyFee: number;
  gender: string;
  dateOfBirth: string;
}

interface OperatingHours {
  [key: string]: { start: string; end: string; closed: boolean };
}

interface BusinessSettings {
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  website: string;
  taxId: string;
  businessType: string;
  operatingHours: OperatingHours;
  appointmentDuration: number;
  maxPatientsPerDay: number;
  emergencyAvailability: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  ipWhitelist: string[];
  auditLogs: boolean;
  dataEncryption: boolean;
  backupFrequency: string;
}

interface DoctorSettingsData {
  profile: ProfileSettings;
  business: BusinessSettings;
  security: SecuritySettings;
}

interface DoctorSettingsState {
  data: DoctorSettingsData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: DoctorSettingsState = {
  data: null,
  isLoading: false,
  isSaving: false,
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

const API_URL = `${getApiV1BaseUrl()}/doctor-settings`;

// Thunks
export const fetchDoctorSettings = createAsyncThunk(
  "doctorSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthConfig());
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch settings",
      );
    }
  },
);

export const updateProfileSettings = createAsyncThunk(
  "doctorSettings/updateProfile",
  async (profileData: Partial<ProfileSettings>, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/profile`,
        profileData,
        getAuthConfig(),
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

export const updateBusinessSettings = createAsyncThunk(
  "doctorSettings/updateBusiness",
  async (businessData: Partial<BusinessSettings>, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/business`,
        businessData,
        getAuthConfig(),
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update business settings",
      );
    }
  },
);

export const updateSecuritySettings = createAsyncThunk(
  "doctorSettings/updateSecurity",
  async (securityData: Partial<SecuritySettings>, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/security`,
        securityData,
        getAuthConfig(),
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update security settings",
      );
    }
  },
);

// Slice
const doctorSettingsSlice = createSlice({
  name: "doctorSettings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Settings
    builder
      .addCase(fetchDoctorSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchDoctorSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile Settings
    builder
      .addCase(updateProfileSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateProfileSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.data) {
          state.data.profile = action.payload.profile || state.data.profile;
        }
      })
      .addCase(updateProfileSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update Business Settings
    builder
      .addCase(updateBusinessSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateBusinessSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.data) {
          state.data.business = action.payload.business || state.data.business;
        }
      })
      .addCase(updateBusinessSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update Security Settings
    builder
      .addCase(updateSecuritySettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.data) {
          state.data.security = action.payload.security || state.data.security;
        }
      })
      .addCase(updateSecuritySettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectDoctorSettings = (state: RootState) =>
  state.doctorSettings.data;
export const selectDoctorSettingsLoading = (state: RootState) =>
  state.doctorSettings.isLoading;
export const selectDoctorSettingsSaving = (state: RootState) =>
  state.doctorSettings.isSaving;
export const selectDoctorSettingsError = (state: RootState) =>
  state.doctorSettings.error;

export default doctorSettingsSlice.reducer;
