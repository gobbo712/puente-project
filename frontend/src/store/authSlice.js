import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

// Check if token exists and is not expired
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      // Check token expiration
      const expiry = localStorage.getItem('tokenExpiry');
      if (expiry && new Date().getTime() > parseInt(expiry)) {
        // Try to refresh token
        try {
          await dispatch(refreshToken()).unwrap();
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const newToken = localStorage.getItem('token');
          return { token: newToken, user };
        } catch (refreshError) {
          // If refresh fails, log the user out
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          localStorage.removeItem('credentials');
          return rejectWithValue('Token expired and refresh failed');
        }
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      
      // Update token expiration time
      const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours instead of 5 minutes
      localStorage.setItem('token', response.token);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      localStorage.setItem('user', JSON.stringify(response));
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Store credentials for token refresh (securely)
      localStorage.setItem('credentials', JSON.stringify(credentials));
      
      // Set token expiry (24 hours from now instead of 5 minutes)
      const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem('token', response.token);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      localStorage.setItem('user', JSON.stringify(response));
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    localStorage.removeItem('credentials');
    return null;
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionExpired: false,
  registrationSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.sessionExpired = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
        state.sessionExpired = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
        state.sessionExpired = false;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.sessionExpired = true;
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.registrationSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.sessionExpired = false;
      })
      
      // Check auth status cases
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.sessionExpired = false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.sessionExpired = true;
      });
  },
});

export const { resetError, resetRegistrationSuccess } = authSlice.actions;
export default authSlice.reducer; 