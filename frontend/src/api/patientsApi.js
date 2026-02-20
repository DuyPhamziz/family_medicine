import api from "../service/api";

export const fetchDoctorPatients = async () => {
  const response = await api.get("/api/patients/doctor/list");
  return response.data;
};

export const fetchPatientById = async (patientId) => {
  const response = await api.get(`/api/patients/${patientId}`);
  return response.data;
};
