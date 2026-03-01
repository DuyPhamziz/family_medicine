import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    
    // Handle 403 for admin endpoints - token có thể có role cũ
    if (error.response?.status === 403 && error.config?.url?.includes('/admin/')) {
      console.warn('Access forbidden: Role không hợp lệ. Vui lòng đăng nhập lại.');
      // Tự động logout nếu 403 từ admin endpoint
      if (confirm('Phiên đăng nhập không hợp lệ. Bạn cần đăng nhập lại để tiếp tục. Đăng nhập lại ngay?')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
