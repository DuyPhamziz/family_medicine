import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;
let tokenRefreshTimer = null;

const scheduleTokenRefresh = (token) => {
  try {
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    const refreshIn = Math.max(expiresIn - 5 * 60 * 1000, 60000);

    console.debug(`Token scheduled for refresh in ${Math.round(refreshIn / 1000 / 60)} minutes`);

    tokenRefreshTimer = setTimeout(async () => {
      try {
        console.debug('Proactively refreshing token...');
        const response = await api.post('/api/auth/refresh', {}, {
          withCredentials: true,
          _skipRefreshInterceptor: true,
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          scheduleTokenRefresh(response.data.token);
        }
      } catch (error) {
        console.warn('Proactive token refresh failed:', error.message);
      }
    }, refreshIn);
  } catch (error) {
    console.warn('Failed to schedule token refresh:', error);
  }
};

const existingToken = localStorage.getItem('token');
if (existingToken) {
  scheduleTokenRefresh(existingToken);
}

api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      scheduleTokenRefresh(response.data.token);
    }
    return response;
  },
  async (error) => {
    if (error.config?._skipRefreshInterceptor) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = api.post('/api/auth/refresh', {}, {
          withCredentials: true,
          _skipRefreshInterceptor: true,
        })
          .then((response) => {
            const token = response.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            scheduleTokenRefresh(token);
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
        if (tokenRefreshTimer) {
          clearTimeout(tokenRefreshTimer);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;