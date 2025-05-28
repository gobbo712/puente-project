import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import favoriteService from '../services/favoriteService';

// Fetch user favorites
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await favoriteService.getFavorites();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add to favorites
export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (instrumentId, { rejectWithValue }) => {
    try {
      const response = await favoriteService.addFavorite(instrumentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Remove from favorites
export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (instrumentId, { rejectWithValue }) => {
    try {
      await favoriteService.removeFavorite(instrumentId);
      return instrumentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  favorites: [],
  isLoading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites cases
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add to favorites cases
      .addCase(addToFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites.push(action.payload);
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Remove from favorites cases
      .addCase(removeFromFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        // Filter out the favorite with the matching instrument ID
        state.favorites = state.favorites.filter(
          (favorite) => favorite.id !== action.payload
        );
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetError } = favoritesSlice.actions;
export default favoritesSlice.reducer; 