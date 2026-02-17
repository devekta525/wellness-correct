import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = getApiV1BaseUrl();

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  emergencyContact: string;
  gender: "Male" | "Female" | "Other";
  role: "Admin" | "Doctor" | "Influencer" | "Customer";
  status: "Active" | "Inactive";
  dateOfBirth?: string;
  verified: boolean;
  address?: string;
  bio?: string;
  imageUrl?: string;
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
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  age?: number;
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  emergencyContact: string;
  role: "Admin" | "Doctor" | "Influencer" | "Customer";
  status: "Active" | "Inactive";
  dateOfBirth?: string;
  verified: boolean;
  address?: string;
  bio?: string;
  imageUrl?: string;
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
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  age?: number;
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  data: User[];
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
  filters: {
    status: string;
    role: string;
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: UserState = {
  data: [],
  isLoading: false,
  error: null,
  selectedUser: null,
  filters: {
    status: "",
    role: "",
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUserData: (
      state,
      action: PayloadAction<{ data: User[]; total: number }>,
    ) => {
      state.data = action.payload.data;
      state.pagination.total = action.payload.total;
      state.isLoading = false;
      state.error = null;
    },
    setUserLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<UserState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<UserState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.data.findIndex(
        (user) => user._id === action.payload._id,
      );
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((user) => user._id !== action.payload);
      state.pagination.total = state.pagination.total - 1;
    },
  },
});

export const {
  setUserData,
  setUserLoading,
  setUserError,
  setSelectedUser,
  setFilters,
  setPagination,
  clearSelectedUser,
  updateUserInList,
  removeUserFromList,
} = userSlice.actions;

const mapApiUserToUser = (apiUser: ApiUser): User => ({
  _id: apiUser._id,
  firstName: apiUser.firstName,
  lastName: apiUser.lastName,
  email: apiUser.email,
  password: apiUser.password,
  phone: apiUser.phone,
  gender: apiUser.gender,
  emergencyContact: apiUser.emergencyContact,
  role: apiUser.role,
  bloodGroup: apiUser.bloodGroup,
  status: apiUser.status,
  dateOfBirth: apiUser.dateOfBirth,
  verified: apiUser.verified,
  address: apiUser.address,
  bio: apiUser.bio,
  imageUrl: apiUser.imageUrl,
  hospital: apiUser.hospital,
  experience: apiUser.experience,
  consultationFee: apiUser.consultationFee,
  specialization: apiUser.specialization,
  location: apiUser.location,
  qualifications: apiUser.qualifications,
  platform: apiUser.platform,
  followers: apiUser.followers,
  category: apiUser.category,
  socialMediaLinks: apiUser.socialMediaLinks,
  commissionRate: apiUser.commissionRate,
  availability: apiUser.availability,
  note: apiUser.note,
  customerType: apiUser.customerType,
  isActive: apiUser.isActive,
  language: apiUser.language || [],
  occupation: apiUser.occupation,
  age: apiUser.age,
  maritalStatus: apiUser.maritalStatus,
  twoFactorEnabled: apiUser.twoFactorEnabled,
  createdAt: apiUser.createdAt,
  updatedAt: apiUser.updatedAt,
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

// ==========================================
// FIXED: Fetch Doctors Function
// ==========================================
export const fetchDoctors = () => async (dispatch: AppDispatch) => {
  dispatch(setUserLoading());
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/?role=Doctor&limit=50`,
    );

    if (response.data?.success) {
      const mappedUsers = response.data.data.map((user: ApiUser) =>
        mapApiUserToUser(user),
      );
      const total = response.data.pagination
        ? response.data.pagination.total
        : mappedUsers.length;

      dispatch(
        setUserData({
          data: mappedUsers,
          total: total,
        }),
      );
      return true;
    } else {
      throw new Error(response.data?.message || "Failed to fetch doctors");
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setUserError(errorMessage));
    return false;
  }
};

export const fetchUsersData =
  () => async (dispatch: AppDispatch, getState: () => { users: UserState }) => {
    dispatch(setUserLoading());
    try {
      const { filters, pagination } = getState().users;
      const queryParams = new URLSearchParams();

      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      if (filters.status && filters.status !== "All") {
        queryParams.append("status", filters.status);
      }
      if (filters.role && filters.role !== "All") {
        queryParams.append("role", filters.role);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      const response = await axios.get(`${API_BASE_URL}/users/?${queryParams}`);

      if (response.data?.success) {
        const mappedUsers = response.data.data.map((user: ApiUser) =>
          mapApiUserToUser(user),
        );

        dispatch(
          setUserData({
            data: mappedUsers,
            total: response.data.pagination.total,
          }),
        );
      } else {
        throw new Error(response.data?.message || "Failed to fetch users");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setUserError(errorMessage));
      return false;
    }
  };

export const fetchActiveUsers =
  () => async (dispatch: AppDispatch, getState: () => { users: UserState }) => {
    dispatch(setUserLoading());
    try {
      const { filters, pagination } = getState().users;
      const queryParams = new URLSearchParams();

      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      if (filters.status && filters.status !== "") {
        queryParams.append("status", filters.status);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      queryParams.append("status", "Active");
      const response = await axios.get(`${API_BASE_URL}/users?${queryParams}`);
      if (response.data?.success) {
        const mappedUsers = response.data.data.map((user: ApiUser) =>
          mapApiUserToUser(user),
        );

        dispatch(
          setUserData({
            data: mappedUsers,
            total: response.data.pagination.total,
          }),
        );
      } else {
        throw new Error(response.data?.message || "Failed to fetch users");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setUserError(errorMessage));
      return false;
    }
  };

export const fetchUserById =
  (userId: string) => async (dispatch: AppDispatch) => {
    dispatch(setUserLoading());
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      if (response.data?.success) {
        const user = response.data.data;
        const mappedUser = mapApiUserToUser(user);
        dispatch(setSelectedUser(mappedUser));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch user");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setUserError(errorMessage));
      return false;
    }
  };

export const createUser =
  (newUser: Partial<User>) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, newUser);
      if (response.data?.success) {
        dispatch(setUserLoading());
        return true;
      } else {
        const errorMessage = response.data?.message || "Failed to create user";
        dispatch(setUserError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setUserError(errorMessage));
      return false;
    }
  };

export const updateUserStatus =
  (userId: string, status: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, {
        status,
      });
      if (response.data?.success) {
        dispatch(setUserLoading());
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to update user status",
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setUserError(errorMessage));
    }
  };

export const updateUserRole =
  (userId: string, role: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, {
        role,
      });
      if (response.data?.success) {
        dispatch(setUserLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update user role");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setUserError(errorMessage));
    }
  };

export const updateUser =
  (userId: string, updatedData: Partial<User>) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}`,
        updatedData,
      );
      if (response.data?.success) {
        if (response.data.user) {
          const mappedUser = mapApiUserToUser(response.data.user);
          dispatch(updateUserInList(mappedUser));
        }
        dispatch(setUserLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update user");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setUserError(errorMessage));
      return false;
    }
  };

export const deleteUser = (userId: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
    if (response.data?.success) {
      dispatch(removeUserFromList(userId));
      return true;
    } else {
      throw new Error(response.data?.message || "Failed to delete user");
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setUserError(errorMessage));
    return false;
  }
};
export const selectUsersData = (state: { users: UserState }) =>
  state.users.data;
export const selectUsersLoading = (state: { users: UserState }) =>
  state.users.isLoading;
export const selectUsersError = (state: { users: UserState }) =>
  state.users.error;
export const selectSelectedUser = (state: { users: UserState }) =>
  state.users.selectedUser;
export const selectUsersFilters = (state: { users: UserState }) =>
  state.users.filters;
export const selectUsersPagination = (state: { users: UserState }) =>
  state.users.pagination;

export default userSlice.reducer;
