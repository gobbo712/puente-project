import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import marketService from '../services/marketService';

// Fetch all instruments
export const fetchInstruments = createAsyncThunk(
  'market/fetchInstruments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketService.getAllInstruments();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch instrument by symbol
export const fetchInstrumentBySymbol = createAsyncThunk(
  'market/fetchInstrumentBySymbol',
  async (symbol, { rejectWithValue }) => {
    try {
      const response = await marketService.getInstrumentBySymbol(symbol);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  instruments: [],
  currentInstrument: null,
  isLoading: false,
  error: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetCurrentInstrument: (state) => {
      state.currentInstrument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all instruments cases
      .addCase(fetchInstruments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstruments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instruments = action.payload;
      })
      .addCase(fetchInstruments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch instrument by symbol cases
      .addCase(fetchInstrumentBySymbol.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstrumentBySymbol.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInstrument = action.payload;
      })
      .addCase(fetchInstrumentBySymbol.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetError, resetCurrentInstrument } = marketSlice.actions;
export default marketSlice.reducer; 