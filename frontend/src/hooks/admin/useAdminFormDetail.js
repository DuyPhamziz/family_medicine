import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createQuestion,
  createSection,
  deleteQuestion,
  deleteSection,
  getAdminForm,
  updateQuestion,
  updateSection,
} from "../../api/adminFormsApi";

export const useAdminFormDetail = (formId) => {
  const [form, setForm] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadForm = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const data = await getAdminForm(formId);
      setForm(data);
      setSections(data.sections || []);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to load form";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const addSection = async (payload) => {
    const section = await createSection(formId, payload);
    await loadForm();
    return section;
  };

  const editSection = async (sectionId, payload) => {
    const section = await updateSection(sectionId, payload);
    await loadForm();
    return section;
  };

  const removeSection = async (sectionId) => {
    await deleteSection(sectionId);
    await loadForm();
  };

  const addQuestion = async (sectionId, payload) => {
    const question = await createQuestion(sectionId, payload);
    await loadForm();
    return question;
  };

  const editQuestion = async (questionId, payload) => {
    const question = await updateQuestion(questionId, payload);
    await loadForm();
    return question;
  };

  const removeQuestion = async (questionId) => {
    await deleteQuestion(questionId);
    await loadForm();
  };

  const questionCount = useMemo(() => {
    return sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
  }, [sections]);

  return {
    form,
    sections,
    loading,
    error,
    questionCount,
    reload: loadForm,
    addSection,
    editSection,
    removeSection,
    addQuestion,
    editQuestion,
    removeQuestion,
  };
};
