import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import favoriteService from '../services/favoriteService';

// Fetch user favorites
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await favoriteService.getFavorites();
      console.log('API response for favorites:', response);
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
    resetFavorites: (state) => {
      state.favorites = [];
      state.isLoading = false;
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
        
        console.log('Remove from favorites fulfilled with ID:', action.payload);
        console.log('Current favorites before filtering:', state.favorites);
        
        // The backend returns InstrumentResponse objects with an id field
        // Filter out the instrument with matching ID
        state.favorites = state.favorites.filter(item => {
          // The payload is the instrumentId we're removing
          // For each favorite item, we need to compare the instrument id with the payload
          
          if (item.id && item.id === action.payload) {
            // If the item has a direct id that matches
            console.log('Removing item with id:', item.id);
            return false;
          }
          
          if (item.instrumentId && String(item.instrumentId) === String(action.payload)) {
            // If the item has an instrumentId property
            console.log('Removing item with instrumentId:', item.instrumentId);
            return false;
          }
          
          // For items with an instrument object that contains the id
          if (item.instrument && item.instrument.id && 
              String(item.instrument.id) === String(action.payload)) {
            console.log('Removing item with instrument.id:', item.instrument.id);
            return false;
          }
          
          return true;
        });
        
        console.log('Favorites after filtering:', state.favorites);
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetError, resetFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer; 