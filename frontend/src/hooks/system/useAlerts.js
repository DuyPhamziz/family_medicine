import { useState } from 'react';
import { alertAPI } from '../service/api-extended';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async (patientId) => {
    setLoading(true);
    try {
      const response = await alertAPI.getAlertsByPatient(patientId);
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData) => {
    try {
      const response = await alertAPI.createAlert(alertData);
      setAlerts([...alerts, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await alertAPI.resolveAlert(alertId);
      setAlerts(alerts.map(a => a.alertId === alertId ? { ...a, resolved: true } : a));
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  };

  return { alerts, loading, fetchAlerts, createAlert, resolveAlert };
};
