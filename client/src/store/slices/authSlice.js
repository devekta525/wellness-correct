import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const sendOtp = createAsyncThunk('auth/sendOtp', async (email, { rejectWithValue }) => {
  try {
    const res = await authAPI.sendOtp(email);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.verifyOtp(data);
    localStorage.setItem('Wellness_fuel_token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    localStorage.setItem('Wellness_fuel_token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const adminLogin = createAsyncThunk('auth/adminLogin', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.adminLogin(data);
    localStorage.setItem('Wellness_fuel_token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data);
    localStorage.setItem('Wellness_fuel_token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getMe();
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authAPI.logout().catch(() => { });
  localStorage.removeItem('Wellness_fuel_token');
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.updateProfile(data);
    toast.success('Profile updated!');
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async (productId, { rejectWithValue }) => {
  try {
    const res = await authAPI.toggleWishlist(productId);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const deleteAccount = createAsyncThunk('auth/deleteAccount', async (_, { rejectWithValue }) => {
  try {
    await authAPI.deleteAccount();
    localStorage.removeItem('Wellness_fuel_token');
    return {};
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('Wellness_fuel_token'),
    isAuthenticated: !!localStorage.getItem('Wellness_fuel_token'),
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(action.payload || 'Something went wrong');
    };

    builder
      .addCase(sendOtp.pending, handlePending)
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        toast.success('OTP sent to your email!');
      })
      .addCase(sendOtp.rejected, handleRejected)

      .addCase(verifyOtp.pending, handlePending)
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        toast.success(`Welcome, ${action.payload.user.name}!`);
      })
      .addCase(verifyOtp.rejected, handleRejected)

      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        toast.success(`Welcome back, ${action.payload.user.name}!`);
      })
      .addCase(login.rejected, handleRejected)

      .addCase(adminLogin.pending, handlePending)
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true;
        toast.success('Admin logged in!');
      })
      .addCase(adminLogin.rejected, handleRejected)

      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        toast.success(`Welcome to Wellness_fuel, ${action.payload.user.name}!`);
      })
      .addCase(register.rejected, handleRejected)

      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
        localStorage.removeItem('Wellness_fuel_token');
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        toast.success('Logged out successfully');
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })

      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (state.user && action.payload?.wishlist) state.user.wishlist = action.payload.wishlist;
      })

      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
