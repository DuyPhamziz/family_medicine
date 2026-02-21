import apiClient from './axiosConfig';

export const assessmentAPI = {
  getAssessmentById: (id) => apiClient.get(`/assessments/${id}`),
  getAssessmentsByPatient: (patientId) => apiClient.get(`/assessments/patient/${patientId}`),
  getAssessmentsByDoctor: (doctorId) => apiClient.get(`/assessments/doctor/${doctorId}`),
  updateStatus: (id, status) => apiClient.put(`/assessments/${id}/status?status=${status}`),
  deleteAssessment: (id) => apiClient.delete(`/assessments/${id}`),
};

export const formAPI = {
  createForm: (data) => apiClient.post('/forms', data),
  getFormById: (id) => apiClient.get(`/forms/${id}`),
  getAllForms: () => apiClient.get('/forms'),
  updateForm: (id, data) => apiClient.put(`/forms/${id}`, data),
  deleteForm: (id) => apiClient.delete(`/forms/${id}`),
};

export const indicatorAPI = {
  createIndicator: (data) => apiClient.post('/indicators', data),
  getIndicatorById: (id) => apiClient.get(`/indicators/${id}`),
  getAllIndicators: () => apiClient.get('/indicators'),
  getInputIndicators: () => apiClient.get('/indicators/input'),
  getDerivedIndicators: () => apiClient.get('/indicators/derived'),
  updateIndicator: (id, data) => apiClient.put(`/indicators/${id}`, data),
  deleteIndicator: (id) => apiClient.delete(`/indicators/${id}`),
};

export const riskAPI = {
  getAllRiskLevels: () => apiClient.get('/risk/levels'),
  getRiskLevelById: (id) => apiClient.get(`/risk/levels/${id}`),
  getRiskLevelByCode: (code) => apiClient.get(`/risk/levels/code/${code}`),
  createRiskLevel: (data) => apiClient.post('/risk/levels', data),
  getAllRiskRules: () => apiClient.get('/risk/rules'),
  getRiskRuleById: (id) => apiClient.get(`/risk/rules/${id}`),
  createRiskRule: (data) => apiClient.post('/risk/rules', data),
};

export const alertAPI = {
  createAlert: (data) => apiClient.post('/alerts', data),
  getAlertById: (id) => apiClient.get(`/alerts/${id}`),
  getAlertsByPatient: (patientId) => apiClient.get(`/alerts/patient/${patientId}`),
  getUnresolvedAlerts: () => apiClient.get('/alerts/unresolved'),
  resolveAlert: (id) => apiClient.put(`/alerts/${id}/resolve`),
  deleteAlert: (id) => apiClient.delete(`/alerts/${id}`),
  getAllRecommendations: () => apiClient.get('/alerts/recommendations'),
  createRecommendation: (data) => apiClient.post('/alerts/recommendations', data),
};

export const logicAPI = {
  createVariable: (data) => apiClient.post('/logic/variables', data),
  getVariableById: (id) => apiClient.get(`/logic/variables/${id}`),
  getAllVariables: () => apiClient.get('/logic/variables'),
  updateVariable: (id, data) => apiClient.put(`/logic/variables/${id}`, data),
  deleteVariable: (id) => apiClient.delete(`/logic/variables/${id}`),
  
  createFormula: (data) => apiClient.post('/logic/formulas', data),
  getFormulaById: (id) => apiClient.get(`/logic/formulas/${id}`),
  getAllFormulas: () => apiClient.get('/logic/formulas'),
  updateFormula: (id, data) => apiClient.put(`/logic/formulas/${id}`, data),
  deleteFormula: (id) => apiClient.delete(`/logic/formulas/${id}`),
};
