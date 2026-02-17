import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = getApiV1BaseUrl();

// Define the Setting type based on MongoDB schema
export interface Setting {
  _id?: string;
  seoSetting: {
    basicSetting: {
      siteTitle: string;
      metaDescription?: string;
      keywords?: string[];
      twitterHandle?: string;
      googleAnalyticsId?: string;
    };
    thirdPartySetting: {
      googleTagManagerId?: string;
      hotjarId?: string;
      intercomAppId?: string;
      zendeskWidgetKey?: string;
      customScripts?: string;
    };
    metaSetting: {
      author?: string;
      robots?: string;
      viewport?: string;
      themeColor?: string;
      customMetaTags?: string;
    };
  };
  businessSetting: {
    businessInformation: {
      businessName: string;
      businessEmail: string;
      businessPhone: string;
      website?: string;
      businessAddress: string;
      gstNumber?: string;
      panNumber?: string;
      businessType?: string;
      foundedYear?: number;
    };
    socialMediaSetting: {
      socialMedia: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
      };
    };
  };
  shippingSetting: {
    defaultShippingRate: number;
    freeShippingThreshold: number;
    shippingZones: {
      zoneName: string;
      shippingRate: number;
      freeShippingThreshold?: number;
    }[];
    deliveryTimeframes: {
      standard?: string;
      express?: string;
      overnight?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Define the API Setting type (from backend)
interface ApiSetting {
  _id: string;
  seoSetting: Setting["seoSetting"][];
  businessSetting: Setting["businessSetting"][];
  shippingSetting: Setting["shippingSetting"][];
  createdAt: string;
  updatedAt: string;
}

// Define the state structure
interface SettingState {
  data: Setting | null;
  isLoading: boolean;
  error: string | null;
  selectedSetting: Setting | null;
}

// Initial state
const initialState: SettingState = {
  data: null,
  isLoading: false,
  error: null,
  selectedSetting: null,
};

// Create the slice
const settingSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettingData: (state, action: PayloadAction<Setting>) => {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSettingLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setSettingError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedSetting: (state, action: PayloadAction<Setting>) => {
      state.selectedSetting = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearSelectedSetting: (state) => {
      state.selectedSetting = null;
    },
    updateSettingField: (
      state,
      action: PayloadAction<{ path: string; value: unknown }>,
    ) => {
      if (state.data) {
        const { path, value } = action.payload;
        const keys = path.split(".");
        let current: Record<string, unknown> = state.data;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]] as Record<string, unknown>;
        }

        current[keys[keys.length - 1]] = value;
      }
    },
  },
});

// Export actions
export const {
  setSettingData,
  setSettingLoading,
  setSettingError,
  setSelectedSetting,
  clearSelectedSetting,
  updateSettingField,
} = settingSlice.actions;

// Helper function to map API setting to our Setting interface
const mapApiSettingToSetting = (apiSetting: ApiSetting): Setting => ({
  _id: apiSetting._id,
  seoSetting: apiSetting.seoSetting[0] || {
    basicSetting: {
      siteTitle: "",
      metaDescription: "",
      keywords: [],
      twitterHandle: "",
      googleAnalyticsId: "",
    },
    thirdPartySetting: {
      googleTagManagerId: "",
      hotjarId: "",
      intercomAppId: "",
      zendeskWidgetKey: "",
      customScripts: "",
    },
    metaSetting: {
      author: "",
      robots: "index, follow",
      viewport: "width=device-width, initial-scale=1",
      themeColor: "",
      customMetaTags: "",
    },
  },
  businessSetting: apiSetting.businessSetting[0] || {
    businessInformation: {
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      website: "",
      businessAddress: "",
      gstNumber: "",
      panNumber: "",
      businessType: "Private Limited",
      foundedYear: new Date().getFullYear(),
    },
    socialMediaSetting: {
      socialMedia: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
      },
    },
  },
  shippingSetting: apiSetting.shippingSetting[0] || {
    defaultShippingRate: 50,
    freeShippingThreshold: 1000,
    shippingZones: [],
    deliveryTimeframes: {
      standard: "3-6 business days",
      express: "1-2 business days",
      overnight: "Next day delivery",
    },
  },
  createdAt: apiSetting.createdAt,
  updatedAt: apiSetting.updatedAt,
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

// Fetch settings
export const fetchSettingsData = () => async (dispatch: AppDispatch) => {
  dispatch(setSettingLoading());
  try {
    const response = await axios.get(`${API_BASE_URL}/settings`);

    if (response.data?.success) {
      const mappedSetting = mapApiSettingToSetting(response.data.data);
      dispatch(setSettingData(mappedSetting));
    } else {
      throw new Error(response.data?.message || "Failed to fetch settings");
    }
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setSettingError(errorMessage));
    return false;
  }
};

// Fetch seo settings
export const fetchSeoSettings = () => async (dispatch: AppDispatch) => {
  dispatch(setSettingLoading());
  try {
    const response = await axios.get(`${API_BASE_URL}/settings/seo`);
    if (response.data?.success) {
      const mappedSetting = mapApiSettingToSetting(response.data.data);
      dispatch(setSettingData(mappedSetting));
      return true;
    } else {
      throw new Error(response.data?.message || "Failed to fetch seo settings");
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setSettingError(errorMessage));
    return false;
  }
};

// Fetch business settings
export const fetchBusinessSettings = () => async (dispatch: AppDispatch) => {
  dispatch(setSettingLoading());
  try {
    const response = await axios.get(`${API_BASE_URL}/settings/business`);
    if (response.data?.success) {
      const mappedSetting = mapApiSettingToSetting(response.data.data);
      dispatch(setSettingData(mappedSetting));
      return true;
    } else {
      throw new Error(
        response.data?.message || "Failed to fetch business settings",
      );
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setSettingError(errorMessage));
    return false;
  }
};

// Fetch shipping settings
export const fetchShippingSettings = () => async (dispatch: AppDispatch) => {
  dispatch(setSettingLoading());
  try {
    const response = await axios.get(`${API_BASE_URL}/settings/shipping`);
    if (response.data?.success) {
      const mappedSetting = mapApiSettingToSetting(response.data.data);
      dispatch(setSettingData(mappedSetting));
      return true;
    } else {
      throw new Error(
        response.data?.message || "Failed to fetch shipping settings",
      );
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setSettingError(errorMessage));
    return false;
  }
};

// Update settings
export const updateSettings =
  (updatedData: Partial<Setting>) => async (dispatch: AppDispatch) => {
    dispatch(setSettingLoading());
    try {
      // Convert object structure back to array structure for API
      const apiData: Record<string, unknown> = {};

      if (updatedData.seoSetting) {
        apiData.seoSetting = [updatedData.seoSetting];
      }
      if (updatedData.businessSetting) {
        apiData.businessSetting = [updatedData.businessSetting];
      }
      if (updatedData.shippingSetting) {
        apiData.shippingSetting = [updatedData.shippingSetting];
      }

      const response = await axios.put(`${API_BASE_URL}/settings`, apiData);

      if (response.data?.success) {
        const mappedSetting = mapApiSettingToSetting(response.data.data);
        dispatch(setSettingData(mappedSetting));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update settings");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setSettingError(errorMessage));
      return false;
    }
  };

// Selectors
export const selectSettingsData = (state: { settings: SettingState }) =>
  state.settings.data;
export const selectSettingsLoading = (state: { settings: SettingState }) =>
  state.settings.isLoading;
export const selectSettingsError = (state: { settings: SettingState }) =>
  state.settings.error;
export const selectSelectedSetting = (state: { settings: SettingState }) =>
  state.settings.selectedSetting;

// Export the reducer
export default settingSlice.reducer;
