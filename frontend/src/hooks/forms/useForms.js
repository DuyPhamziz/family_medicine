import { useCallback, useEffect, useState } from "react";
import { fetchForms } from "../../api/formsApi";

export const useForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Loading forms...");
      const data = await fetchForms();
      setForms(data);
      setError(null);
    } catch (err) {
      console.error("Error loading forms:", err);
      const message = err.response?.data?.message || err.message || "Failed to load forms";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  return {
    forms,
    loading,
    error,
    reload: loadForms,
  };
};
