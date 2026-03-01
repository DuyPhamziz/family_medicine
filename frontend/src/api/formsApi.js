import api from "../service/api";
import publicApi from "../service/publicApi";

export const fetchForms = async () => {
  const response = await api.get("/api/forms");
  return response.data;
};

export const fetchFormById = async (formId) => {
  const response = await api.get(`/api/forms/${formId}`);
  return response.data;
};

// ===== NEW: PUBLIC FORM API =====

/**
 * Public form API - no authentication required
 * Uses separate publicApi instance to avoid auth redirects
 */
export const publicFormApi = {
  getPublicForms: async () => {
    const response = await publicApi.get('/form/public/list');
    return response.data;
  },

  /**
   * Get public form without authentication
   * GET /api/public/forms/{token}
   */
  getPublicForm: async (token) => {
    try {
      const response = await publicApi.get(`/api/public/forms/${token}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to load form');
    }
  },
  
  /**
   * Submit public form without authentication
   * POST /api/public/forms/{token}/submit
   */
  submitPublicForm: async (token, payload) => {
    try {
      const response = await publicApi.post(`/api/public/forms/${token}/submit`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit form');
    }
  }
};

export const scoringApi = {
  compute: async (payload) => {
    try {
      const response = await publicApi.post('/api/public/scoring/compute', payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tính điểm');
    }
  }
};

export const doctorSubmissionApi = {
  getSubmissions: async (status) => {
    const query = status ? `?status=${status}` : '';
    const response = await api.get(`/api/doctor/submissions${query}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/doctor/submissions/stats');
    return response.data;
  },

  getSubmissionDetail: async (id) => {
    const response = await api.get(`/api/doctor/submissions/${id}`);
    return response.data;
  },

  respondSubmission: async (id, payload) => {
    const response = await api.post(`/api/doctor/submissions/${id}/respond`, payload);
    return response.data;
  }
};

// ===== CONDITIONAL LOGIC API =====

/**
 * Conditional logic evaluation API
 */

