import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8088',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const response = await axios.post('http://localhost:8088/auth/refresh', {
          refreshToken: refreshToken
        });

        const { accessToken } = response.data;
        
        localStorage.setItem('token', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);

      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;