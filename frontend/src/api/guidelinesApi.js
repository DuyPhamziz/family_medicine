import api from '../service/api';

export const guidelinesApi = {
  // Get all guidelines
  getAll: async () => {
    const response = await api.get('/api/guidelines');
    return response.data;
  },

  // Get guideline by form ID
  getByFormId: async (formId) => {
    const response = await api.get(`/api/guidelines/form/${formId}`);
    return response.data;
  },

  // Create new guideline
  create: async (payload) => {
    const response = await api.post('/api/guidelines', payload);
    return response.data;
  },

  // Update guideline
  update: async (id, payload) => {
    const response = await api.put(`/api/guidelines/${id}`, payload);
    return response.data;
  },

  // Delete guideline
  delete: async (id) => {
    const response = await api.delete(`/api/guidelines/${id}`);
    return response.data;
  },
};
