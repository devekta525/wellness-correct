import { getApiV1Url } from "./api";

// Get dashboard URL for user role
export const getDashboardForRole = (role: string): string => {
  switch (role.toLowerCase()) {
    case "admin":
    case "super_admin":
      return "/dashboard";
    case "doctor":
      return "/doctors";
    case "influencer":
      return "/influencers";
    case "user":
    case "customer":
      return "/profile";
    case "moderator":
      return "/dashboard";
    default:
      return "/profile";
  }
};

// Authentication utility functions

export interface SessionData {
  user: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  isActive: boolean;
  deviceInfo: {
    ua: string;
    browser: {
      name: string;
      version: string;
      major: string;
    };
    cpu: Record<string, unknown>;
    device: {
      type: string;
      model: string;
      vendor: string;
    };
    engine: {
      name: string;
      version: string;
    };
    os: {
      name: string;
      version: string;
    };
  };
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LoginResponse {
  message: string;
  session: SessionData;
}

// Store authentication data
export const storeAuthData = (session: SessionData) => {
  // Store in localStorage for persistence
  localStorage.setItem("authToken", session.token);
  localStorage.setItem("userId", session.user);
  localStorage.setItem("sessionData", JSON.stringify(session));

  // Store in cookies for server-side access
  // Store user ID as a simple object for middleware compatibility
  const userData = { id: session.user, role: "user" }; // Default role, update based on your API
  document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
  document.cookie = `token=${session.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
};

// Clear authentication data
export const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("sessionData");

  // Clear cookies
  document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    return false;
  }

  // Check if token is expired
  try {
    const sessionData = localStorage.getItem("sessionData");
    if (sessionData) {
      const session: SessionData = JSON.parse(sessionData);
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();

      if (now > expiresAt) {
        clearAuthData();
        return false;
      }
    }
  } catch (error) {
    console.error("Error checking token expiration:", error);
    clearAuthData();
    return false;
  }

  return true;
};

// Get current user ID
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem("userId");
};

// Get current auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Get session data
export const getSessionData = (): SessionData | null => {
  try {
    const sessionData = localStorage.getItem("sessionData");
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error("Error parsing session data:", error);
    return null;
  }
};

// Get user role from session data
export const getUserRole = (): string | null => {
  try {
    const sessionData = localStorage.getItem("sessionData");
    if (sessionData) {
      const session: SessionData & { userRole?: string } =
        JSON.parse(sessionData);
      // Return the stored userRole if available, otherwise default to 'user'
      return session.userRole || "user";
    }
  } catch (error) {
    console.error("Error getting user role:", error);
  }
  return null;
};

// User details interface
interface UserDetails {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: "Admin" | "Doctor" | "Influencer" | "Customer";
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
  imageUrl?: string;
  language?: string[];
  twoFactorEnabled: boolean;
  isActive: boolean;
  [key: string]: unknown;
}

// Fetch user details including role from API
export const fetchUserDetails = async (
  userId: string,
  token: string,
): Promise<UserDetails | null> => {
  try {
    const checkResponse = await fetch(getApiV1Url("/auth/check"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      if (checkData?.user) {
        return checkData.user;
      }
    }

    const response = await fetch(getApiV1Url(`/users/${userId}`), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const userData = await response.json();

    // Handle the response structure: { success: true, user: {...} }
    if (userData.success && userData.user) {
      return userData.user;
    }

    throw new Error("Invalid response structure");
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

// Update user role in cookies and localStorage
export const updateUserRole = (role: string) => {
  try {
    const sessionData = getSessionData();
    if (sessionData) {
      // Update localStorage
      const updatedSession = { ...sessionData, userRole: role };
      localStorage.setItem("sessionData", JSON.stringify(updatedSession));

      // Update cookies
      const userData = { id: sessionData.user, role: role };
      document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    }
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};
