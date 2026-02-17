import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { clearAuthData } from "../../utils/auth";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = getApiV1BaseUrl();

// User interface based on the provided Mongoose schema
export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role:
    | "admin"
    | "super_admin"
    | "Admin"
    | "Doctor"
    | "Influencer"
    | "Customer";
  status: "Active" | "Inactive";
  dateOfBirth?: string;
  verified: boolean;
  address?: string;
  bio?: string;
  hospital?: string;
  experience?: number;
  consultationFee?: number;
  specialization?: string;
  location?: string;
  qualifications?: string;
  platform?: string;
  followers?: number;
  category?: string;
  socialMediaLinks?: string;
  commissionRate?: number;
  availability?: string;
  note?: string;
  customerType?: string;
  isActive: boolean;
  language?: string[];
  occupation?: string;
  bloodeGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  age?: number;
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
  twoFactorEnabled: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  verificationStatus: {
    emailSent: boolean;
    verified: boolean;
    loading: boolean;
    error: string | null;
  };
  passwordReset: {
    emailSent: boolean;
    loading: boolean;
    error: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  verificationStatus: {
    emailSent: false,
    verified: false,
    loading: false,
    error: null,
  },
  passwordReset: {
    emailSent: false,
    loading: false,
    error: null,
  },
};

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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },
    setAuthLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setVerificationStatus: (
      state,
      action: PayloadAction<Partial<AuthState["verificationStatus"]>>,
    ) => {
      state.verificationStatus = {
        ...state.verificationStatus,
        ...action.payload,
      };
    },
    setPasswordResetStatus: (
      state,
      action: PayloadAction<Partial<AuthState["passwordReset"]>>,
    ) => {
      state.passwordReset = { ...state.passwordReset, ...action.payload };
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.verificationStatus = initialState.verificationStatus;
      state.passwordReset = initialState.passwordReset;
    },
  },
});

export const {
  setUser,
  setAuthLoading,
  setAuthError,
  setVerificationStatus,
  setPasswordResetStatus,
  clearAuthError,
  logout,
} = authSlice.actions;

// Login user
// Login user
export const loginUser =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    dispatch(setAuthLoading());
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (
        response.data?.success ||
        (response.data?.message === "login successful" &&
          response.data?.session)
      ) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setAuthError(errorMessage));
      return { message: errorMessage, session: null, success: false };
    }
  };

// Register user
export const registerUser =
  (userData: any) => async (dispatch: AppDispatch) => {
    dispatch(setAuthLoading());
    try {
      console.log("Sending registration data:", userData);

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      console.log("Registration response:", response.data);

      if (response.data?.success) {
        dispatch(setUser(response.data.user));
        return response.data; // Return full data including session
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
      }
      const errorMessage = handleApiError(error);
      dispatch(setAuthError(errorMessage));
      return false;
    }
  };

// Send verification email
export const sendVerificationEmail =
  (email: string) => async (dispatch: AppDispatch) => {
    dispatch(setVerificationStatus({ loading: true, error: null }));
    try {
      throw new Error("Email verification is not supported by the backend");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setVerificationStatus({ loading: false, error: errorMessage }));
      return false;
    }
  };

// Verify email
export const verifyEmail = (token: string) => async (dispatch: AppDispatch) => {
  dispatch(setVerificationStatus({ loading: true, error: null }));
  try {
    throw new Error("Email verification is not supported by the backend");
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setVerificationStatus({ loading: false, error: errorMessage }));
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail =
  (email: string) => async (dispatch: AppDispatch) => {
    dispatch(setPasswordResetStatus({ loading: true, error: null }));
    try {
      throw new Error("Password reset email is not supported by the backend");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setPasswordResetStatus({ loading: false, error: errorMessage }));
      return false;
    }
  };

// Reset password
export const resetPassword =
  (oldPassword: string, newPassword: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(setPasswordResetStatus({ loading: true, error: null }));
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/resetpassword`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      // According to the prompt, the response will be: { "message": "Password Reset Successfully" }
      if (response.data?.message === "Password Reset Successfully") {
        dispatch(setPasswordResetStatus({ loading: false }));
        return true;
      } else {
        throw new Error(response.data?.message || "Password reset failed");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setPasswordResetStatus({ loading: false, error: errorMessage }));
      return false;
    }
  };

// Update profile
export const updateProfile =
  (userId: string, profileData: Partial<User>) =>
  async (dispatch: AppDispatch) => {
    dispatch(setAuthLoading());
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}`,
        profileData,
      );

      if (response.data?.success) {
        dispatch(setUser(response.data.user));
        return true;
      } else {
        throw new Error(response.data?.message || "Profile update failed");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setAuthError(errorMessage));
      return false;
    }
  };
// Update profile image
export const updateProfileImage =
  (userId: string, imageFile: FormData) => async (dispatch: AppDispatch) => {
    dispatch(setAuthLoading());
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}`,
        imageFile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data?.success) {
        dispatch(setUser(response.data.user));
        return true;
      } else {
        throw new Error(
          response.data?.message || "Profile image update failed",
        );
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setAuthError(errorMessage));
      return false;
    }
  };

// Toggle 2FA
export const toggle2FA =
  (userId: string, enable: boolean) => async (dispatch: AppDispatch) => {
    dispatch(setAuthLoading());
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, {
        twoFactorEnabled: enable,
      });

      if (response.data?.success) {
        dispatch(setUser(response.data.user));
        return true;
      } else {
        throw new Error(response.data?.message || "2FA toggle failed");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setAuthError(errorMessage));
      return false;
    }
  };

// Logout user
export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    await axios.post(`${API_BASE_URL}/auth/logout`);
    dispatch(logout());
    clearAuthData(); // Clear local storage and cookies
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setAuthError(errorMessage));
    clearAuthData(); // Clear local storage even if API call fails
    return false;
  }
};

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectVerificationStatus = (state: { auth: AuthState }) =>
  state.auth.verificationStatus;
export const selectPasswordResetStatus = (state: { auth: AuthState }) =>
  state.auth.passwordReset;

export default authSlice.reducer;
