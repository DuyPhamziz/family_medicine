import api from "../service/api";

export const fetchForms = async () => {
  const response = await api.get("/api/forms");
  return response.data;
};

export const fetchFormById = async (formId) => {
  const response = await api.get(`/api/forms/${formId}`);
  return response.data;
};
