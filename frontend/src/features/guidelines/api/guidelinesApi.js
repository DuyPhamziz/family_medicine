import api from '../../../service/api';

export const guidelinesApi = {
  getAll: async () => {
    const response = await api.get('/api/guidelines');
    return response.data;
  },

  getByFormId: async (formId) => {
    const response = await api.get(`/api/guidelines/form/${formId}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post('/api/guidelines', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/api/guidelines/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/guidelines/${id}`);
    return response.data;
  },
};
