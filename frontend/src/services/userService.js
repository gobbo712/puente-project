import axiosInstance from './axiosConfig';

const getAllUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

const getUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

const toggleAdminRole = async (userId) => {
  const response = await axiosInstance.put(`/users/${userId}/toggle-admin`);
  return response.data;
};

const userService = {
  getAllUsers,
  getUserById,
  toggleAdminRole
};

export default userService; 