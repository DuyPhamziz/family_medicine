import { useCallback, useEffect, useState } from "react";
import {
  createAdminForm,
  createAdminFormVersion,
  deleteAdminForm,
  getAdminForms,
  updateAdminForm,
} from "../../api/adminFormsApi";

export const useAdminForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminForms();
      setForms(data);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to load forms";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const saveForm = async (payload, formId) => {
    if (formId) {
      return updateAdminForm(formId, payload);
    }
    return createAdminForm(payload);
  };

  const removeForm = async (formId) => {
    await deleteAdminForm(formId);
  };

  const createVersion = async (formId, payload) => {
    return createAdminFormVersion(formId, payload);
  };

  return {
    forms,
    loading,
    error,
    reload: loadForms,
    saveForm,
    removeForm,
    createVersion,
  };
};
