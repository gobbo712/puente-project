import axiosInstance from './axiosConfig';

const getFavorites = async () => {
  const response = await axiosInstance.get('/favorites');
  return response.data;
};

const addFavorite = async (instrumentId) => {
  const response = await axiosInstance.post('/favorites', { instrumentId });
  return response.data;
};

const removeFavorite = async (instrumentId) => {
  await axiosInstance.delete(`/favorites/${instrumentId}`);
  return instrumentId;
};

const favoriteService = {
  getFavorites,
  addFavorite,
  removeFavorite,
};

export default favoriteService; 