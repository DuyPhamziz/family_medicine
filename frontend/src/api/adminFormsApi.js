import api from "../service/api";

export const getAdminForms = async () => {
  const response = await api.get("/api/forms/admin/all");
  return response.data;
};

export const getAdminForm = async (formId) => {
  const response = await api.get(`/api/forms/admin/${formId}`);
  return response.data;
};

export const createAdminForm = async (payload) => {
  const response = await api.post("/api/forms/admin/create", payload);
  return response.data;
};

export const updateAdminForm = async (formId, payload) => {
  const response = await api.put(`/api/forms/admin/${formId}`, payload);
  return response.data;
};

export const deleteAdminForm = async (formId) => {
  await api.delete(`/api/forms/admin/${formId}`);
};

export const createAdminFormVersion = async (formId, payload) => {
  const response = await api.post(`/api/forms/admin/${formId}/versions`, payload);
  return response.data;
};

export const createSection = async (formId, payload) => {
  const response = await api.post(`/api/forms/admin/${formId}/sections`, payload);
  return response.data;
};

export const updateSection = async (sectionId, payload) => {
  const response = await api.put(`/api/forms/admin/sections/${sectionId}`, payload);
  return response.data;
};

export const deleteSection = async (sectionId) => {
  await api.delete(`/api/forms/admin/sections/${sectionId}`);
};

export const createQuestion = async (sectionId, payload) => {
  const response = await api.post(`/api/forms/admin/sections/${sectionId}/questions`, payload);
  return response.data;
};

export const updateQuestion = async (questionId, payload) => {
  const response = await api.put(`/api/forms/admin/questions/${questionId}`, payload);
  return response.data;
};

export const deleteQuestion = async (questionId) => {
  await api.delete(`/api/forms/admin/questions/${questionId}`);
};

export const createOption = async (questionId, payload) => {
  const response = await api.post(`/api/forms/admin/questions/${questionId}/options`, payload);
  return response.data;
};

export const updateOption = async (optionId, payload) => {
  const response = await api.put(`/api/forms/admin/options/${optionId}`, payload);
  return response.data;
};

export const deleteOption = async (optionId) => {
  await api.delete(`/api/forms/admin/options/${optionId}`);
};
