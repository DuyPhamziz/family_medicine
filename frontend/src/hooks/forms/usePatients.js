import { useCallback, useEffect, useState } from "react";
import { fetchDoctorPatients } from "../../api/patientsApi";

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Loading patients...");
      const data = await fetchDoctorPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error("Error loading patients:", err);
      const message = err.response?.data?.message || err.message || "Failed to load patients";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    loading,
    error,
    reload: loadPatients,
  };
};
