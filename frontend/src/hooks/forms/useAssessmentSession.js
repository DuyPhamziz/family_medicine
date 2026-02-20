import { useEffect, useMemo, useState } from "react";
import { fetchFormById } from "../../api/formsApi";
import { fetchPatientById } from "../../api/patientsApi";
import {
  completeAssessmentSession,
  getAssessmentSession,
  startAssessmentSession,
  submitAssessmentAnswer,
} from "../../api/assessmentsApi";
import api from "../../service/api";

const buildStorageKey = (patientId, formId) => `assessment_session_${patientId}_${formId}`;

export const useAssessmentSession = ({ patientId, formId }) => {
  const [form, setForm] = useState(null);
  const [patient, setPatient] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState("IN_PROGRESS");
  const [completed, setCompleted] = useState(false);
  const [submissionSaved, setSubmissionSaved] = useState(false);

  const parseAnswerValue = (answer) => {
    if (!answer) return "";
    switch (answer.answerType) {
      case "NUMBER":
        return answer.answerValue === null || answer.answerValue === "" ? "" : Number(answer.answerValue);
      case "BOOLEAN":
        return answer.answerValue === "true";
      case "MULTIPLE_CHOICE":
        try {
          return answer.answerValue ? JSON.parse(answer.answerValue) : [];
        } catch {
          return answer.answerValue ? [answer.answerValue] : [];
        }
      default:
        return answer.answerValue ?? "";
    }
  };

  const normalizeInitialAnswers = (formData, sessionAnswers) => {
    const initial = {};
    formData.sections?.forEach((section) => {
      section.questions?.forEach((question) => {
        const key = `question_${question.questionId}`;
        initial[key] = question.questionType === "MULTIPLE_CHOICE" ? [] : "";
      });
    });

    sessionAnswers?.forEach((answer) => {
      const key = `question_${answer.questionId}`;
      initial[key] = parseAnswerValue(answer);
    });

    return initial;
  };

  const startOrResumeSession = async (formData) => {
    const storageKey = buildStorageKey(patientId, formId);
    const cachedSessionId = localStorage.getItem(storageKey);

    if (cachedSessionId) {
      try {
        const sessionRes = await getAssessmentSession(cachedSessionId);
        const status = sessionRes.session?.status || "IN_PROGRESS";
        if (status === "COMPLETED") {
          localStorage.removeItem(storageKey);
        } else {
          setSessionId(cachedSessionId);
          setSessionStatus(status);
          setNotes(sessionRes.session?.notes || "");
          setAnswers(normalizeInitialAnswers(formData, sessionRes.answers));
          return;
        }
      } catch (err) {
        console.warn("Failed to resume session, creating new", err);
        localStorage.removeItem(storageKey);
      }
    }

    const startRes = await startAssessmentSession({ patientId, formId });
    const newSessionId = startRes.sessionId;
    localStorage.setItem(storageKey, newSessionId);
    setSessionId(newSessionId);
    setSessionStatus(startRes.status || "IN_PROGRESS");
    setNotes(startRes.notes || "");
    setAnswers(normalizeInitialAnswers(formData, []));
  };

  useEffect(() => {
    const loadData = async () => {
      if (!patientId || !formId) return;
      setLoading(true);
      try {
        const [formRes, patientRes] = await Promise.all([
          fetchFormById(formId),
          fetchPatientById(patientId),
        ]);

        setForm(formRes);
        setPatient(patientRes);
        await startOrResumeSession(formRes);
        setError(null);
      } catch (err) {
        console.error("Error loading form:", err);
        const message = err.response?.data?.message || err.message || "Failed to load form";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId, formId]);

  const allQuestions = useMemo(() => {
    if (!form?.sections) return [];
    return form.sections.flatMap((section) => section.questions || []);
  }, [form]);

  const questionIndex = useMemo(() => {
    const byId = new Map();
    const byCode = new Map();
    allQuestions.forEach((question) => {
      byId.set(question.questionId, question);
      if (question.questionCode) {
        byCode.set(question.questionCode, question);
      }
    });
    return { byId, byCode };
  }, [allQuestions]);

  const parseCondition = (conditionValue) => {
    if (!conditionValue) return null;
    try {
      return JSON.parse(conditionValue);
    } catch {
      return null;
    }
  };

  const isEmptyAnswer = (value, questionType) => {
    if (questionType === "MULTIPLE_CHOICE") {
      return !Array.isArray(value) || value.length === 0;
    }
    if (questionType === "BOOLEAN") {
      return value !== true && value !== false;
    }
    return value === "" || value === null || value === undefined;
  };

  const normalizeExpectedValue = (actual, expected) => {
    if (typeof actual === "boolean" && typeof expected === "string") {
      return expected === "true";
    }
    if (typeof actual === "number" && typeof expected === "string" && expected !== "") {
      const numberValue = Number(expected);
      return Number.isNaN(numberValue) ? expected : numberValue;
    }
    return expected;
  };

  const compareValues = (actual, expected, operator) => {
    const normalizedExpected = normalizeExpectedValue(actual, expected);
    switch (operator) {
      case "notEquals":
        return actual !== normalizedExpected;
      case "in":
        return Array.isArray(normalizedExpected) && normalizedExpected.includes(actual);
      case "contains":
        return Array.isArray(actual) ? actual.includes(normalizedExpected) : false;
      case "greaterThan":
        return Number(actual) > Number(normalizedExpected);
      case "lessThan":
        return Number(actual) < Number(normalizedExpected);
      case "exists":
        return Boolean(actual) === Boolean(normalizedExpected);
      default:
        return actual === normalizedExpected;
    }
  };

  const isQuestionVisible = (question) => {
    const condition = parseCondition(question.displayCondition);
    if (!condition) return true;

    const dependsOn = condition.dependsOn || condition.questionId || condition.questionCode;
    if (!dependsOn) return true;

    const targetQuestion = questionIndex.byId.get(dependsOn) || questionIndex.byCode.get(dependsOn);
    if (!targetQuestion) return true;

    const targetValue = answers[`question_${targetQuestion.questionId}`];
    const operator =
      condition.operator ||
      (condition.equals !== undefined ? "equals" : null) ||
      (condition.notEquals !== undefined ? "notEquals" : null) ||
      (condition.in !== undefined || condition.anyOf !== undefined ? "in" : null) ||
      (condition.contains !== undefined ? "contains" : null) ||
      (condition.greaterThan !== undefined ? "greaterThan" : null) ||
      (condition.lessThan !== undefined ? "lessThan" : null) ||
      (condition.exists !== undefined ? "exists" : "equals");

    const expected =
      condition.value ??
      condition.equals ??
      condition.notEquals ??
      condition.in ??
      condition.anyOf ??
      condition.contains ??
      condition.greaterThan ??
      condition.lessThan ??
      condition.exists ??
      true;

    return compareValues(targetValue, expected, operator);
  };

  const sortedSections = useMemo(() => {
    if (!form?.sections) return [];
    return [...form.sections].sort((a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0));
  }, [form]);

  const visibleSections = useMemo(() => {
    return sortedSections.map((section) => {
      const sortedQuestions = [...(section.questions || [])].sort(
        (a, b) => (a.questionOrder || 0) - (b.questionOrder || 0)
      );
      const visibleQuestions = sortedQuestions.filter(isQuestionVisible);
      return { ...section, questions: visibleQuestions };
    });
  }, [sortedSections, answers, questionIndex]);

  useEffect(() => {
    const visibleQuestions = visibleSections.flatMap((section) => section.questions || []);
    if (visibleQuestions.length > 0) {
      const totalQuestions = visibleQuestions.length;
      const answeredQuestions = visibleQuestions.filter((question) => {
        const value = answers[`question_${question.questionId}`];
        return !isEmptyAnswer(value, question.questionType);
      }).length;
      const progressPercent = (answeredQuestions / totalQuestions) * 100;
      setProgress(progressPercent);
    }
  }, [answers, visibleSections]);

  const validateAnswers = () => {
    const newErrors = {};
    const visibleQuestions = visibleSections.flatMap((section) => section.questions || []);
    visibleQuestions.forEach((question) => {
      const value = answers[`question_${question.questionId}`];
      if (question.required && isEmptyAnswer(value, question.questionType)) {
        newErrors[`question_${question.questionId}`] = "Please answer this question";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildSubmissionPayload = () => {
    const answersPayload = allQuestions
      .map((question) => {
        const key = `question_${question.questionId}`;
        const value = answers[key];
        if (isEmptyAnswer(value, question.questionType)) {
          return null;
        }

        return {
          questionId: question.questionId,
          questionCode: question.questionCode || null,
          questionText: question.questionText || null,
          questionType: question.questionType,
          answerValue:
            question.questionType === "MULTIPLE_CHOICE"
              ? value
              : question.questionType === "BOOLEAN"
              ? Boolean(value)
              : value,
        };
      })
      .filter(Boolean);

    return {
      patientId,
      formId,
      submissionData: JSON.stringify({
        sessionId,
        answers: answersPayload,
      }),
      notes: notes || "",
    };
  };

  const submitPatientForm = async () => {
    if (submissionSaved) return;
    const payload = buildSubmissionPayload();
    await api.post("/api/submissions", payload);
    setSubmissionSaved(true);
  };

  const submitAnswer = async (question, value) => {
    if (!sessionId) return;
    if (isEmptyAnswer(value, question.questionType)) return;

    const answerValue =
      question.questionType === "MULTIPLE_CHOICE"
        ? JSON.stringify(value)
        : question.questionType === "BOOLEAN"
        ? String(value)
        : value === null || value === undefined
        ? ""
        : String(value);

    await submitAssessmentAnswer({
      sessionId,
      questionId: question.questionId,
      answerType: question.questionType,
      answerValue,
    });
  };

  const handleAnswerChange = async (question, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`question_${question.questionId}`]: value,
    }));

    try {
      await submitAnswer(question, value);
    } catch (err) {
      console.error("Error saving answer:", err);
    }
  };

  const handleSaveProgress = async (silent = false) => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const visibleQuestions = visibleSections.flatMap((section) => section.questions || []);
      const tasks = visibleQuestions
        .map((question) => ({
          question,
          value: answers[`question_${question.questionId}`],
        }))
        .filter(({ value, question }) => !isEmptyAnswer(value, question.questionType))
        .map(({ question, value }) => submitAnswer(question, value));
      await Promise.all(tasks);
      if (!silent) {
        alert("Progress saved");
      }
    } catch (err) {
      console.error("Error saving progress:", err);
      if (!silent) {
        alert("Failed to save progress");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) return;

    setSubmitting(true);
    try {
      await handleSaveProgress(true);
      await completeAssessmentSession({ sessionId, notes });
      await submitPatientForm();
      setCompleted(true);
      setSessionStatus("COMPLETED");
      localStorage.removeItem(buildStorageKey(patientId, formId));
    } catch (err) {
      console.error("Error completing assessment:", err);
      alert("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    patient,
    answers,
    loading,
    error,
    submitting,
    saving,
    notes,
    setNotes,
    errors,
    progress,
    sessionId,
    sessionStatus,
    completed,
    visibleSections,
    handleAnswerChange,
    handleSaveProgress,
    handleSubmit,
  };
};
