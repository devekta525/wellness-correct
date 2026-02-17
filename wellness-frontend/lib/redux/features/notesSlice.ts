import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";
import { getApiV1BaseUrl } from "../../utils/api";

const API_BASE_URL = getApiV1BaseUrl();
export interface Note {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isPrivate: boolean;
  priority: "low" | "medium" | "high";
  status: "draft" | "published" | "archived";
}

interface ApiNote {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author:
    | {
        _id: string;
        firstName: string;
        lastName: string;
      }
    | string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isPrivate: boolean;
  priority: "low" | "medium" | "high";
  status: "draft" | "published" | "archived";
}

interface NoteStats {
  totalNotes?: number;
  publishedNotes?: number;
  draftNotes?: number;
  favoriteNotes?: number;
  total?: number;
  published?: number;
  draft?: number;
  archived?: number;
  favorites?: number;
}

interface NoteState {
  data: Note[];
  isLoading: boolean;
  error: string | null;
  selectedNote: Note | null;
  stats: NoteStats | null;
  filters: {
    category: string;
    status: string;
    priority: string;
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: NoteState = {
  data: [],
  isLoading: false,
  error: null,
  selectedNote: null,
  stats: null,
  filters: {
    category: "all",
    status: "all",
    priority: "all",
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNoteData: (
      state,
      action: PayloadAction<{ data: Note[]; total: number }>,
    ) => {
      state.data = action.payload.data;
      state.pagination.total = action.payload.total;
      state.isLoading = false;
      state.error = null;
    },
    setNoteLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setNoteError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedNote: (state, action: PayloadAction<Note>) => {
      state.selectedNote = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setNoteStats: (state, action: PayloadAction<NoteStats>) => {
      state.stats = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<NoteState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<NoteState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedNote: (state) => {
      state.selectedNote = null;
    },
    updateNoteInList: (state, action: PayloadAction<Note>) => {
      const index = state.data.findIndex(
        (note) => note._id === action.payload._id,
      );
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    removeNoteFromList: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((note) => note._id !== action.payload);
      state.pagination.total = state.pagination.total - 1;
    },
  },
});

export const {
  setNoteData,
  setNoteLoading,
  setNoteError,
  setSelectedNote,
  setNoteStats,
  setFilters,
  setPagination,
  clearSelectedNote,
  updateNoteInList,
  removeNoteFromList,
} = noteSlice.actions;

const mapApiNoteToNote = (apiNote: ApiNote): Note => ({
  _id: apiNote._id,
  title: apiNote.title,
  content: apiNote.content,
  category: apiNote.category,
  tags: apiNote.tags,
  author:
    typeof apiNote.author === "string"
      ? apiNote.author
      : apiNote.author?._id || "",
  authorName:
    typeof apiNote.author === "string"
      ? "Unknown"
      : apiNote.author
        ? `${apiNote.author.firstName} ${apiNote.author.lastName}`
        : "Unknown",
  createdAt: apiNote.createdAt,
  updatedAt: apiNote.updatedAt,
  isFavorite: apiNote.isFavorite,
  isPrivate: apiNote.isPrivate,
  priority: apiNote.priority,
  status: apiNote.status,
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

// --- NEW HELPER FUNCTION ---
// This grabs the token from Local Storage (authToken) to send in the header
const getAuthConfig = () => {
  const token = localStorage.getItem("authToken");

  return {
    withCredentials: true, // Keep cookies enabled just in case
    headers: {
      // Only add header if token exists
      ...(token && { Authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    },
  };
};

// Fetch all notes
export const fetchNotes =
  () => async (dispatch: AppDispatch, getState: () => { notes: NoteState }) => {
    dispatch(setNoteLoading());
    try {
      const { filters, pagination } = getState().notes;
      const queryParams = new URLSearchParams();

      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      if (filters.category && filters.category !== "all") {
        queryParams.append("category", filters.category);
      }
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.priority && filters.priority !== "all") {
        queryParams.append("priority", filters.priority);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      const response = await axios.get(
        `${API_BASE_URL}/notes?${queryParams}`,
        getAuthConfig(), // <--- UPDATED
      );

      if (response.data?.success) {
        const mappedNotes = response.data.data.map((note: ApiNote) =>
          mapApiNoteToNote(note),
        );

        dispatch(
          setNoteData({
            data: mappedNotes,
            total: response.data.pagination?.total || mappedNotes.length,
          }),
        );
      } else {
        throw new Error(response.data?.message || "Failed to fetch notes");
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setNoteError(errorMessage));
      return false;
    }
  };

// Fetch note by ID
export const fetchNoteById =
  (noteId: string) => async (dispatch: AppDispatch) => {
    dispatch(setNoteLoading());
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notes/${noteId}`,
        getAuthConfig(), // <--- UPDATED
      );

      if (response.data?.success) {
        const mappedNote = mapApiNoteToNote(response.data.data);
        dispatch(setSelectedNote(mappedNote));
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to fetch note");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setNoteError(errorMessage));
      return false;
    }
  };

// Fetch note stats
export const fetchNoteStats = () => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/notes/stats`,
      getAuthConfig(), // <--- UPDATED
    );

    if (response.data?.success) {
      // Map backend response format to frontend stats format
      const statsData = response.data.data;
      const mappedStats: NoteStats = {
        totalNotes: statsData.totalNotes || 0,
        publishedNotes: statsData.publishedNotes || 0,
        draftNotes: statsData.draftNotes || 0,
        favoriteNotes: statsData.favoriteNotes || 0,
      };
      dispatch(setNoteStats(mappedStats));
    }
    return true;
  } catch (error: unknown) {
    console.error("Failed to fetch note stats:", error);
    return false;
  }
};

// Create new note
export const createNote =
  (newNote: Partial<Note>) => async (dispatch: AppDispatch) => {
    dispatch(setNoteLoading());
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notes`,
        newNote,
        getAuthConfig(), // <--- UPDATED
      );

      if (response.data?.success) {
        return true;
      } else {
        const errorMessage = response.data?.message || "Failed to create note";
        dispatch(setNoteError(errorMessage));
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setNoteError(errorMessage));
      return false;
    }
  };

// Update note
export const updateNote =
  (noteId: string, updatedData: Partial<Note>) =>
  async (dispatch: AppDispatch) => {
    dispatch(setNoteLoading());
    try {
      const response = await axios.put(
        `${API_BASE_URL}/notes/${noteId}`,
        updatedData,
        getAuthConfig(), // <--- UPDATED
      );

      if (response.data?.success) {
        if (response.data.data) {
          const mappedNote = mapApiNoteToNote(response.data.data);
          dispatch(updateNoteInList(mappedNote));
        }
        return true;
      } else {
        throw new Error(response.data?.message || "Failed to update note");
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      dispatch(setNoteError(errorMessage));
      return false;
    }
  };

// Delete note
export const deleteNote = (noteId: string) => async (dispatch: AppDispatch) => {
  dispatch(setNoteLoading());
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/notes/${noteId}`,
      getAuthConfig(), // <--- UPDATED
    );

    if (response.data?.success) {
      dispatch(removeNoteFromList(noteId));
      return true;
    } else {
      throw new Error(response.data?.message || "Failed to delete note");
    }
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    dispatch(setNoteError(errorMessage));
    return false;
  }
};

// Toggle favorite
export const toggleFavorite =
  (noteId: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notes/${noteId}/favorite`,
        {},
        getAuthConfig(), // <--- UPDATED
      );

      if (response.data?.success && response.data.data) {
        const mappedNote = mapApiNoteToNote(response.data.data);
        dispatch(updateNoteInList(mappedNote));
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error("Failed to toggle favorite:", error);
      return false;
    }
  };

// Export notes
export const exportNotes = () => async () => {
  try {
    const config = getAuthConfig(); // Get config
    const exportConfig = {
      ...config,
      responseType: "blob" as const,
    };

    const response = await axios.get(
      `${API_BASE_URL}/notes/export`,
      exportConfig,
    );

    // Create blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    // File should be CSV based on backend
    link.setAttribute("download", `notes-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error: unknown) {
    console.error("Failed to export notes:", error);
    return false;
  }
};
export const selectNotesData = (state: { notes: NoteState }) =>
  state.notes.data;
export const selectNotesLoading = (state: { notes: NoteState }) =>
  state.notes.isLoading;
export const selectNotesError = (state: { notes: NoteState }) =>
  state.notes.error;
export const selectSelectedNote = (state: { notes: NoteState }) =>
  state.notes.selectedNote;
export const selectNoteStats = (state: { notes: NoteState }) =>
  state.notes.stats;
export const selectNotesFilters = (state: { notes: NoteState }) =>
  state.notes.filters;
export const selectNotesPagination = (state: { notes: NoteState }) =>
  state.notes.pagination;

export default noteSlice.reducer;
