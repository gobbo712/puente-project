import axiosInstance from './axiosConfig';

const getFavorites = async () => {
  try {
    const response = await axiosInstance.get('/favorites');
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error.message);
    throw error;
  }
};

const addFavorite = async (instrumentId) => {
  try {
    const response = await axiosInstance.post('/favorites', { instrumentId });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error.message);
    throw error;
  }
};

const removeFavorite = async (instrumentId) => {
  try {
    const response = await axiosInstance.delete(`/favorites/${instrumentId}`);
    return instrumentId; // Return the ID to properly update state
  } catch (error) {
    console.error('Error removing favorite:', error.message);
    throw error;
  }
};

const favoriteService = {
  getFavorites,
  addFavorite,
  removeFavorite,
};

export default favoriteService; 