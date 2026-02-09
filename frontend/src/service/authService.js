import api from './api';

const authService = {
  /**
   * Đăng nhập với email/mã nhân viên và mật khẩu
   * @param {string} emailOrCode - Email hoặc mã nhân viên
   * @param {string} password - Mật khẩu
   * @returns {Promise} Response từ API với token và user info
   */
  async login(emailOrCode, password) {
    const response = await api.post('/api/auth/login', {
      emailOrCode,
      password,
    });
    return response.data;
  },

  /**
   * Đăng xuất - invalidate token trên server
   * @returns {Promise}
   */
  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Nếu API không có endpoint logout, vẫn clear local storage
      console.warn('Logout API call failed:', error);
    }
  },

  /**
   * Refresh token để lấy token mới
   * @returns {Promise} New token
   */
  async refreshToken() {
    const response = await api.post('/api/auth/refresh', {
      refreshToken: localStorage.getItem('refreshToken'),
    });
    return response.data;
  },

  /**
   * Lấy thông tin user hiện tại từ token
   * @returns {Promise} User info
   */
  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Đổi mật khẩu
   * @param {string} oldPassword - Mật khẩu cũ
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise}
   */
  async changePassword(oldPassword, newPassword) {
    const response = await api.post('/api/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Quên mật khẩu - gửi email reset
   * @param {string} email - Email của user
   * @returns {Promise}
   */
  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  /**
   * Reset mật khẩu với token từ email
   * @param {string} token - Reset token
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise}
   */
  async resetPassword(token, newPassword) {
    const response = await api.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};

export { authService };
