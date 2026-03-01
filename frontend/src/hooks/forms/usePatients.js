import { useCallback, useEffect, useState } from "react";
import { fetchDoctorPatients } from "../../api/patientsApi";

const AUTH_ERROR_MESSAGE = "Phiên đăng nhập hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.";
let patientsBlockedByAuth = false;

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatients = useCallback(async (force = false) => {
    if (patientsBlockedByAuth && !force) {
      setLoading(false);
      setError(AUTH_ERROR_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchDoctorPatients();
      setPatients(data);
      setError(null);
      patientsBlockedByAuth = false;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        patientsBlockedByAuth = true;
        setPatients([]);
        setError(AUTH_ERROR_MESSAGE);
        return;
      }

      console.error("Error loading patients:", err);
      const message = err.response?.data?.message || err.message || "Failed to load patients";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients(false);
  }, [loadPatients]);

  return {
    patients,
    loading,
    error,
    reload: () => loadPatients(true),
  };
};
