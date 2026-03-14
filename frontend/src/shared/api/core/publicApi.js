import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const publicApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

publicApi.interceptors.response.use(
  (response) => response,
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
      throw new Error(error.response.data.message || 'Không tìm thấy kết quả');
    }
    if (error.request) {
      throw new Error('Không thể kết nối đến máy chủ');
    }
    throw new Error('Đã xảy ra lỗi khi tra cứu');
  }
};

export default publicApi;