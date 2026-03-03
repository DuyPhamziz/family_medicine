// service/publicApi.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Separate API instance for public endpoints
 * No authentication required, no automatic token handling
 */
const publicApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple error handling for public API
publicApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 404) {
      throw new Error('Form not found');
    }
    if (error.response?.status === 410) {
      throw new Error('Form has expired');
    }
    throw error;
  }
);

/**
 * Check submission result by phone and submission ID
 * @param {string} phone - Patient phone number
 * @param {string} submissionId - Submission ID
 * @returns {Promise} API response with submission details
 */
export const checkSubmissionResult = async (phone, submissionId) => {
  try {
    const response = await publicApi.get('/api/public/check-result', {
      params: {
        phone,
        submissionId,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || 'Không tìm thấy kết quả');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Không thể kết nối đến máy chủ');
    } else {
      // Other errors
      throw new Error('Đã xảy ra lỗi khi tra cứu');
    }
  }
};

export default publicApi;
