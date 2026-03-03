import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
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
let refreshPromise = null;
let tokenRefreshTimer = null;

// Function to schedule proactive token refresh (refresh 5 minutes before expiration)
const scheduleTokenRefresh = (token) => {
  try {
    if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
    
    // Decode JWT payload to get expiration time
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    
    // Refresh 5 minutes before actual expiration
    const refreshIn = Math.max(expiresIn - 5 * 60 * 1000, 60000); // min 1 minute
    
    console.debug(`Token scheduled for refresh in ${Math.round(refreshIn / 1000 / 60)} minutes`);
    
    tokenRefreshTimer = setTimeout(async () => {
      try {
        console.debug('Proactively refreshing token...');
        const res = await api.post('/api/auth/refresh', {}, { 
          withCredentials: true,
          _skipRefreshInterceptor: true 
        });
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          scheduleTokenRefresh(res.data.token); // Schedule next refresh
        }
      } catch (err) {
        console.warn('Proactive token refresh failed:', err.message);
      }
    }, refreshIn);
  } catch (err) {
    console.warn('Failed to schedule token refresh:', err);
  }
};

// Schedule refresh when token is set
const token = localStorage.getItem('token');
if (token) {
  scheduleTokenRefresh(token);
}

api.interceptors.response.use(
  (response) => {
    // Schedule refresh for newly obtained tokens
    if (response.data?.token) {
      scheduleTokenRefresh(response.data.token);
    }
    return response;
  },
  async (error) => {
    // Skip infinite loop on refresh endpoint
    if (error.config?._skipRefreshInterceptor) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Xử lý lỗi 401 Unauthorized - Token hết hạn hoặc không hợp lệ
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Nếu đang có một yêu cầu refresh khác, đợi nó
      if (!refreshPromise) {
        refreshPromise = api.post('/api/auth/refresh', {}, { 
          withCredentials: true,
          _skipRefreshInterceptor: true 
        })
          .then(res => {
            const token = res.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            scheduleTokenRefresh(token); // Schedule next proactive refresh
            return token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth data và redirect về login
        if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Xử lý lỗi 403 Forbidden - Không có quyền truy cập
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;