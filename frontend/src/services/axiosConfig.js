import axios from 'axios';

const API_URL = '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create a flag to track if refresh is in progress
let isRefreshing = false;
let failedQueue = [];

// Process the queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor for handling token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token (401) and we haven't tried to refresh yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Get store dynamically to avoid circular dependency
        const { store } = await import('../store');
        // Access auth actions dynamically
        const auth = store.getState().auth;
        
        // Try to refresh the token
        const storedCredentials = localStorage.getItem('credentials');
        if (!storedCredentials) {
          throw new Error('No stored credentials found');
        }
        
        const credentials = JSON.parse(storedCredentials);
        // Use the auth service directly instead of through the store
        const authService = (await import('../services/authService')).default;
        const result = await authService.login(credentials);
        const newToken = result.token;
        
        // Process any queued requests with the new token
        processQueue(null, newToken);
        
        // Update the failed request with the new token and retry
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, process queue with error
        processQueue(refreshError, null);
        
        // Logout the user by clearing localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
        localStorage.removeItem('credentials');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 