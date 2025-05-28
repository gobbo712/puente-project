import axiosInstance from './axiosConfig';

const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// Refresh token by logging in again with stored credentials
const refreshToken = async () => {
  const storedCredentials = localStorage.getItem('credentials');
  
  if (!storedCredentials) {
    throw new Error('No stored credentials found');
  }
  
  const credentials = JSON.parse(storedCredentials);
  const response = await login(credentials);
  return response;
};

const authService = {
  login,
  register,
  refreshToken
};

export default authService;