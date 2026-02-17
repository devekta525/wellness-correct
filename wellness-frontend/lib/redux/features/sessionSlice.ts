import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = getApiV1BaseUrl();

// Define the Session type
export interface Session {
  _id?: string;
  user: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  isActive: boolean;
  deviceInfo: {
    browser: string;
    device: string;
    os: string;
  };
  createdAt: string;
}

// Define the state structure
interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
};

// Create the slice
const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSessionsData: (state, action: PayloadAction<Session[]>) => {
      state.sessions = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentSession: (state, action: PayloadAction<Session>) => {
      state.currentSession = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addSession: (state, action: PayloadAction<Session>) => {
      state.sessions.push(action.payload);
      state.currentSession = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    removeSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(
        (session) => session._id !== action.payload,
      );
      if (state.currentSession?._id === action.payload) {
        state.currentSession = null;
      }
    },
    setSessionLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setSessionError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearSessions: (state) => {
      state.sessions = [];
      state.currentSession = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

// Export actions
export const {
  setSessionsData,
  setCurrentSession,
  addSession,
  removeSession,
  setSessionLoading,
  setSessionError,
  clearSessions,
} = sessionSlice.actions;

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

// Fetch user's sessions
export const fetchUserSessions =
  (_userId: string) => async (dispatch: AppDispatch) => {
    dispatch(setSessionLoading());
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/user/`);
      if (response.data?.success) {
        dispatch(setSessionsData(response.data.data));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch sessions");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setSessionError(errorMessage));
      return false;
    }
  };

// End session
export const endSession =
  (sessionId: string) => async (dispatch: AppDispatch) => {
    dispatch(setSessionLoading());
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/sessions/user/session/${sessionId}`,
      );
      if (response.data?.success) {
        dispatch(removeSession(sessionId));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to end session");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setSessionError(errorMessage));
      return false;
    }
  };

// End all sessions except current
export const endAllOtherSessions =
  (userId: string, currentSessionId: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(setSessionLoading());
    try {
      const response = await axios.delete(`${API_BASE_URL}/sessions/user/`);
      if (response.data?.success) {
        dispatch(clearSessions());
        return true;
      } else {
        throw new Error(
          response.data?.message || "Failed to end other sessions",
        );
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setSessionError(errorMessage));
      return false;
    }
  };

// Verify session
export const verifySession =
  (sessionId: string, token: string) => async (dispatch: AppDispatch) => {
    dispatch(setSessionLoading());
    try {
      throw new Error("Session verification is not supported by the backend");
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setSessionError(errorMessage));
      return false;
    }
  };

// Selectors
export const selectSessions = (state: { session: SessionState }) =>
  state.session.sessions;
export const selectCurrentSession = (state: { session: SessionState }) =>
  state.session.currentSession;
export const selectSessionLoading = (state: { session: SessionState }) =>
  state.session.isLoading;
export const selectSessionError = (state: { session: SessionState }) =>
  state.session.error;
export const selectActiveSessions = (state: { session: SessionState }) =>
  state.session.sessions.filter((session) => session.isActive);

// Export the reducer
export default sessionSlice.reducer;
