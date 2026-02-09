import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../service/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Kiểm tra authentication khi app khởi động
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        // Verify token với backend (optional - có thể skip nếu muốn)
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          setIsAuthenticated(true);
        } catch (error) {
          // Invalid stored data, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrCode, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login(emailOrCode, password);
      
      const { token: authToken, user: userData } = response;
      
      // Lưu vào localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', userData.role);
      
      // Update state
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more descriptive error messages
      let errorMessage = 'Đăng nhập thất bại';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = error.response.data?.message || 'Email hoặc mật khẩu không đúng';
        } else if (error.response.status === 403) {
          errorMessage = 'Tài khoản bị khóa hoặc không có quyền truy cập';
        } else if (error.response.status >= 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
        } else {
          errorMessage = error.response.data?.message || error.message;
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối Internet';
      } else {
        errorMessage = error.message || 'Có lỗi xảy ra';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Gọi API logout nếu cần (Spring Boot có thể invalidate token)
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Clear state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      const { token: newToken } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.role) {
      localStorage.setItem('role', userData.role);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
