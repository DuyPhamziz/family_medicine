import api from '../core/api';

export const getPatients = () => api.get('/api/patients/doctor/list');
export const getPatientById = (id) => api.get(`/api/patients/${id}`);