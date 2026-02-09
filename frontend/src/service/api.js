import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Tự động đính kèm JWT vào header nếu có
api.interceptors.request.use(
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

// Response interceptor - Xử lý lỗi authentication và authorization
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi 401 Unauthorized - Token hết hạn hoặc không hợp lệ
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth data và redirect về login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Redirect về login page (chỉ khi không phải đang ở login page)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Xử lý lỗi 403 Forbidden - Không có quyền truy cập
    if (error.response?.status === 403) {
      // Có thể hiển thị thông báo hoặc redirect
      console.error('Access forbidden:', error.response.data);
      // Redirect về dashboard hoặc trang không có quyền
      if (window.location.pathname !== '/') {
        // window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;