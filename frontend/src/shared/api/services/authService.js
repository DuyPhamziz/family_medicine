import api from '../core/api';

const authService = {
  async login(emailOrCode, password) {
    const response = await api.post(
      '/api/auth/login',
      { emailOrCode, password },
      { withCredentials: true }
    );
    return response.data;
  },

  async logout() {
    try {
      await api.post('/api/auth/logout', null, { withCredentials: true });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  },

  async refreshToken() {
    const response = await api.post('/api/auth/refresh', null, { withCredentials: true });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async changePassword(oldPassword, newPassword) {
    const response = await api.post('/api/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};

export { authService };