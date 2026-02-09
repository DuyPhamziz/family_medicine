import api from "./api";

export const getPatients = () => api.get("/patients");
export const getPatientById = (id) => api.get(`/patients/${id}`);
