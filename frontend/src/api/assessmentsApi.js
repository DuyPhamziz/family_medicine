import api from "../service/api";

export const startAssessmentSession = async ({ patientId, formId }) => {
  const response = await api.post("/api/assessments/start", {
    patientId,
    formId,
  });
  return response.data;
};

export const getAssessmentSession = async (sessionId) => {
  const response = await api.get(`/api/assessments/${sessionId}`);
  return response.data;
};

export const submitAssessmentAnswer = async ({ sessionId, questionId, answerType, answerValue }) => {
  const response = await api.post(`/api/assessments/${sessionId}/answers`, {
    questionId,
    answerType,
    answerValue,
  });
  return response.data;
};

export const completeAssessmentSession = async ({ sessionId, notes }) => {
  const response = await api.post(`/api/assessments/${sessionId}/complete`, { notes });
  return response.data;
};
