import { useCallback, useEffect, useState } from "react";
import { fetchForms } from "../../api/formsApi";

const AUTH_ERROR_MESSAGE = "Phiên đăng nhập hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.";
let formsBlockedByAuth = false;

export const useForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadForms = useCallback(async (force = false) => {
    if (formsBlockedByAuth && !force) {
      setLoading(false);
      setError(AUTH_ERROR_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchForms();
      setForms(data);
      setError(null);
      formsBlockedByAuth = false;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        formsBlockedByAuth = true;
        setForms([]);
        setError(AUTH_ERROR_MESSAGE);
        return;
      }

      console.error("Error loading forms:", err);
      const message = err.response?.data?.message || err.message || "Failed to load forms";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms(false);
  }, [loadForms]);

  return {
    forms,
    loading,
    error,
    reload: () => loadForms(true),
  };
};
