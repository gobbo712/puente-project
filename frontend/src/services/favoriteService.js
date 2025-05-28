import axiosInstance from './axiosConfig';

const getFavorites = async () => {
  const response = await axiosInstance.get('/favorites');
  console.log('Raw favorites API response:', response.data);
  return response.data;
};

const addFavorite = async (instrumentId) => {
  const response = await axiosInstance.post('/favorites', { instrumentId });
  return response.data;
};

const removeFavorite = async (instrumentId) => {
  try {
    console.log(`Removing favorite with instrumentId: ${instrumentId}`);
    const response = await axiosInstance.delete(`/favorites/${instrumentId}`);
    console.log('Remove favorite response:', response.data);
    return instrumentId; // Return the ID to properly update state
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error; // Re-throw to let the thunk handle it
  }
};

const favoriteService = {
  getFavorites,
  addFavorite,
  removeFavorite,
};

export default favoriteService; 