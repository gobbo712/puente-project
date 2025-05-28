import axiosInstance from './axiosConfig';

const getAllUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

const getUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

const userService = {
  getAllUsers,
  getUserById
};

export default userService; 