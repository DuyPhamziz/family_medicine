// service/publicApi.js
import axios from 'axios';

/**
 * Separate API instance for public endpoints
 * No authentication required, no automatic token handling
 */
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
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

export default publicApi;
