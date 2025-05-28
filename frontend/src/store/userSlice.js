import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../services/userService';

// Fetch all users (admin only)
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAllUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch user by ID (admin only)
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUserById(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Toggle admin role for a user
export const toggleAdminRole = createAsyncThunk(
  'users/toggleAdminRole',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await userService.toggleAdminRole(userId);
      // Refresh the user list after toggling role
      dispatch(fetchAllUsers());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  toggleLoading: false,
  toggleSuccess: false,
  toggleMessage: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetSelectedUser: (state) => {
      state.selectedUser = null;
    },
    resetToggleStatus: (state) => {
      state.toggleSuccess = false;
      state.toggleMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users cases
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user by ID cases
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Toggle admin role cases
      .addCase(toggleAdminRole.pending, (state) => {
        state.toggleLoading = true;
        state.toggleSuccess = false;
        state.toggleMessage = null;
      })
      .addCase(toggleAdminRole.fulfilled, (state, action) => {
        state.toggleLoading = false;
        state.toggleSuccess = true;
        state.toggleMessage = action.payload.message;
      })
      .addCase(toggleAdminRole.rejected, (state, action) => {
        state.toggleLoading = false;
        state.toggleSuccess = false;
        state.error = action.payload;
      });
  },
});

export const { resetError, resetSelectedUser, resetToggleStatus } = userSlice.actions;
export default userSlice.reducer; 