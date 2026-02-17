import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = `${getApiV1BaseUrl()}/popups`;

export interface Field {
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
}

export interface Popup {
  _id: string;
  name: string;
  heading: string;
  subheading: string;
  delay: number;
  image: string;
  ctaButtonText: string;
  secondaryButtonText: string;
  buttonAction: string;
  badgeText: string;
  badgeVisible: boolean;
  showCloseIcon: boolean;
  fields: Field[];
  status: "active" | "inactive";
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderColor: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiPopup {
  _id: string;
  name: string;
  heading: string;
  subheading: string;
  delay: number;
  image: string;
  ctaButtonText: string;
  secondaryButtonText: string;
  buttonAction: string;
  badgeText: string;
  badgeVisible: boolean;
  showCloseIcon: boolean;
  fields: Field[];
  status: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderColor: string;
  createdAt: string;
  updatedAt: string;
}

interface PopupState {
  data: Popup[];
  isLoading: boolean;
  error: string | null;
  selectedPopup: Popup | null;
  filters: {
    status: string;
    name?: string;
  };
}

const initialState: PopupState = {
  data: [],
  isLoading: false,
  error: null,
  selectedPopup: null,
  filters: {
    status: "",
    name: "",
  },
};

const mapApiPopupToPopup = (apiPopup: ApiPopup): Popup => ({
  _id: apiPopup._id,
  name: apiPopup.name,
  heading: apiPopup.heading,
  subheading: apiPopup.subheading,
  delay: apiPopup.delay,
  image: apiPopup.image,
  ctaButtonText: apiPopup.ctaButtonText,
  secondaryButtonText: apiPopup.secondaryButtonText,
  buttonAction: apiPopup.buttonAction,
  badgeText: apiPopup.badgeText,
  badgeVisible: apiPopup.badgeVisible,
  showCloseIcon: apiPopup.showCloseIcon,
  fields: apiPopup.fields,
  status: apiPopup.status.toLowerCase() as "active" | "inactive",
  backgroundColor: apiPopup.backgroundColor,
  textColor: apiPopup.textColor,
  buttonColor: apiPopup.buttonColor,
  buttonTextColor: apiPopup.buttonTextColor,
  borderColor: apiPopup.borderColor,
  createdAt: apiPopup.createdAt,
  updatedAt: apiPopup.updatedAt,
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

const popupSlice = createSlice({
  name: "popups",
  initialState,
  reducers: {
    setPopupData: (state, action: PayloadAction<Popup[]>) => {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setPopupLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setPopupError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedPopup: (state, action: PayloadAction<Popup>) => {
      state.selectedPopup = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setPopupFilters: (
      state,
      action: PayloadAction<Partial<PopupState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedPopup: (state) => {
      state.selectedPopup = null;
    },
  },
});

export const {
  setPopupData,
  setPopupLoading,
  setPopupError,
  setSelectedPopup,
  setPopupFilters,
  clearSelectedPopup,
} = popupSlice.actions;

export const fetchPopupsData =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setPopupLoading());
    try {
      const { filters } = getState().popups;
      const params: Record<string, string> = {};

      if (filters.status && filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters.name) {
        params.name = filters.name;
      }

      const response = await axios.get(API_BASE_URL, { params });

      if (response.data?.success && Array.isArray(response.data.data)) {
        const mappedPopups = response.data.data.map((popup: ApiPopup) =>
          mapApiPopupToPopup(popup),
        );
        dispatch(setPopupData(mappedPopups));
      } else {
        throw new Error(response.data?.message || "Failed to fetch popups");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setPopupError(errorMessage));
      return false;
    }
  };

export const fetchActivePopups = () => async (dispatch: AppDispatch) => {
  dispatch(setPopupLoading());
  try {
    const response = await axios.get(API_BASE_URL, {
      params: { status: "Active" },
    });
    if (response.data?.success && Array.isArray(response.data.data)) {
      const mappedPopups = response.data.data.map((popup: ApiPopup) =>
        mapApiPopupToPopup(popup),
      );
      dispatch(setPopupData(mappedPopups));
    } else {
      throw new Error(response.data?.message || "Failed to fetch popups");
    }
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setPopupError(errorMessage));
    return false;
  }
};

export const fetchPopupById =
  (popupId: string) => async (dispatch: AppDispatch) => {
    dispatch(setPopupLoading());
    try {
      const response = await axios.get(`${API_BASE_URL}/${popupId}`);
      if (response.data?.success) {
        const popup = response.data.data;
        const mappedPopup = mapApiPopupToPopup(popup);
        dispatch(setSelectedPopup(mappedPopup));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch popup");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setPopupError(errorMessage));
      return false;
    }
  };

export const createPopup =
  (newPopup: FormData) => async (dispatch: AppDispatch) => {
    dispatch(setPopupLoading());
    try {
      const response = await axios.post(API_BASE_URL, newPopup, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data?.success) {
        dispatch(setPopupLoading());
        return true;
      } else {
        const errorMessage = response.data?.message || "Failed to create popup";
        dispatch(setPopupError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setPopupError(errorMessage));
      return false;
    }
  };

export const updatePopupStatus =
  (popupId: string) => async (dispatch: AppDispatch) => {
    dispatch(setPopupLoading());
    try {
      const response = await axios.patch(`${API_BASE_URL}/${popupId}/status`);
      if (response.data?.success) {
        dispatch(setPopupLoading());
      } else {
        throw new Error(
          response.data?.message || "Failed to update popup status",
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      dispatch(setPopupError(errorMessage));
    }
  };

export const updatePopup =
  (popupId: string, updatedData: FormData) => async (dispatch: AppDispatch) => {
    dispatch(setPopupLoading());
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${popupId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data?.success) {
        dispatch(setPopupLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update popup");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setPopupError(errorMessage));
      return false;
    }
  };

export const deletePopup =
  (popupId: string) => async (dispatch: AppDispatch) => {
    dispatch(setPopupLoading());
    try {
      const response = await axios.delete(`${API_BASE_URL}/${popupId}`);
      if (response.data?.success) {
        dispatch(setPopupLoading());
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to delete popup");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setPopupError(errorMessage));
      return false;
    }
  };

export const selectPopupsData = (state: RootState) => state.popups.data;
export const selectPopupsLoading = (state: RootState) => state.popups.isLoading;
export const selectPopupsError = (state: RootState) => state.popups.error;
export const selectSelectedPopup = (state: RootState) =>
  state.popups.selectedPopup;
export const selectPopupsFilters = (state: RootState) => state.popups.filters;

export default popupSlice.reducer;
