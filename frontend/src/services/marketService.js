import axiosInstance from './axiosConfig';

const getAllInstruments = async () => {
  const response = await axiosInstance.get('/market/instruments');
  return response.data;
};

const getInstrumentBySymbol = async (symbol) => {
  const response = await axiosInstance.get(`/market/instruments/${symbol}`);
  return response.data;
};

const marketService = {
  getAllInstruments,
  getInstrumentBySymbol,
};

export default marketService; 