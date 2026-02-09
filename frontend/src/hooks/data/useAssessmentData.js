import { useState, useEffect } from 'react';
import { assessmentAPI } from '../service/api-extended';

export const useAssessments = (patientId) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    
    const fetchAssessments = async () => {
      setLoading(true);
      try {
        const response = await assessmentAPI.getAssessmentsByPatient(patientId);
        setAssessments(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [patientId]);

  return { assessments, loading, error };
};

export const useFormList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      try {
        const response = await assessmentAPI.formAPI.getAllForms();
        setForms(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  return { forms, loading, error };
};

export const useIndicators = () => {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      setLoading(true);
      try {
        const response = await assessmentAPI.indicatorAPI.getAllIndicators();
        setIndicators(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, []);

  return { indicators, loading, error };
};
