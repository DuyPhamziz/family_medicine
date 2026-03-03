/**
 * useAnalytics.js
 * Hook to fetch and manage analytics data for admin dashboard
 */

import { useState, useEffect } from 'react';
import api from '../../service/api';

export const useAnalytics = () => {
  // Disease statistics
  const [diseaseStats, setDiseaseStats] = useState([]);
  const [diseaseLoading, setDiseaseLoading] = useState(false);

  // Form completion rate
  const [completionStats, setCompletionStats] = useState(null);
  const [completionLoading, setCompletionLoading] = useState(false);

  // Patient metrics
  const [patientMetrics, setPatientMetrics] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);

  // Time range filter
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'quarter', 'year'

  // Get disease statistics
  const fetchDiseaseStats = async (from, to) => {
    setDiseaseLoading(true);
    try {
      const response = await api.get('/api/analytics/disease-statistics', {
        params: { from, to }
      });
      // Sort by count descending and take top 10
      const sorted = Object.entries(response.data || {})
        .map(([disease, count]) => ({ disease, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setDiseaseStats(sorted);
    } catch (error) {
      console.error('Error fetching disease statistics:', error);
      setDiseaseStats([]);
    } finally {
      setDiseaseLoading(false);
    }
  };

  // Get form completion stats
  const fetchCompletionStats = async (from, to) => {
    setCompletionLoading(true);
    try {
      const response = await api.get('/api/analytics/form-completion', {
        params: { from, to }
      });
      setCompletionStats(response.data || {
        averageCompletion: 0,
        totalSubmissions: 0,
        completedSubmissions: 0,
        incompleteSubmissions: 0
      });
    } catch (error) {
      console.error('Error fetching completion statistics:', error);
      setCompletionStats({
        averageCompletion: 0,
        totalSubmissions: 0,
        completedSubmissions: 0,
        incompleteSubmissions: 0
      });
    } finally {
      setCompletionLoading(false);
    }
  };

  // Get patient metrics
  const fetchPatientMetrics = async (from, to) => {
    setPatientLoading(true);
    try {
      const response = await api.get('/api/analytics/patient-metrics', {
        params: { from, to }
      });
      setPatientMetrics(response.data || {
        totalPatients: 0,
        newPatients: 0,
        returningPatients: 0,
        averageAge: 0,
        genderDistribution: {}
      });
    } catch (error) {
      console.error('Error fetching patient metrics:', error);
      setPatientMetrics({
        totalPatients: 0,
        newPatients: 0,
        returningPatients: 0,
        averageAge: 0,
        genderDistribution: {}
      });
    } finally {
      setPatientLoading(false);
    }
  };

  // Fetch all analytics on mount or when timeRange changes
  useEffect(() => {
    const today = new Date();
    let from;

    switch (timeRange) {
      case 'week': {
        from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      }
      case 'month': {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      }
      case 'quarter': {
        const quarter = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), quarter * 3, 1);
        break;
      }
      case 'year': {
        from = new Date(today.getFullYear(), 0, 1);
        break;
      }
      default: {
        from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    const fromDate = from.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    Promise.all([
      fetchDiseaseStats(fromDate, toDate),
      fetchCompletionStats(fromDate, toDate),
      fetchPatientMetrics(fromDate, toDate)
    ]);
  }, [timeRange]);

  return {
    // Disease stats
    diseaseStats,
    diseaseLoading,

    // Completion stats
    completionStats,
    completionLoading,

    // Patient metrics
    patientMetrics,
    patientLoading,

    // Controls
    timeRange,
    setTimeRange,

    // Status
    isLoading: diseaseLoading || completionLoading || patientLoading
  };
};

export default useAnalytics;
