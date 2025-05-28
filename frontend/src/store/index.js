import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import marketReducer from './marketSlice';
import favoritesReducer from './favoritesSlice';
import usersReducer from './userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    market: marketReducer,
    favorites: favoritesReducer,
    users: usersReducer,
  },
}); 