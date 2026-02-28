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
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  // --- HÀM BỔ TRỢ ---
const calculateAge = (dob) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  
  // Công thức này sẽ ra 26 tuổi (giống Header của bạn)
  return today.getFullYear() - birthDate.getFullYear();
};

  const isEmpty = (val) => val === "" || val === null || val === undefined || (Array.isArray(val) && val.length === 0);

  const parseValue = (val, type) => {
    if (isEmpty(val)) return type === "MULTIPLE_CHOICE" ? [] : "";
    if (type === "NUMBER") return isNaN(Number(val)) ? "" : Number(val);
    if (type === "MULTIPLE_CHOICE") {
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return [val]; }
    }
    return String(val);
  };

  // --- LOGIC ẨN HIỆN ---
  const isQuestionVisible = (question, currentAnswers, allQuestions) => {
    if (!question.displayCondition || question.displayCondition === "null" || question.displayCondition === "") return true;
    if (!currentAnswers) return true;

    try {
      const conditions = JSON.parse(question.displayCondition);
      const conditionList = Array.isArray(conditions) ? conditions : [conditions];

      return conditionList.some(cond => {
        const targetQ = allQuestions.find(q => 
          (cond.questionCode && q.questionCode === cond.questionCode) || 
          (cond.questionId && q.questionId === cond.questionId)
        );
        
        if (!targetQ) return false;
        const targetValue = currentAnswers[`question_${targetQ.questionId}`];
        if (isEmpty(targetValue)) return false;

        const normalize = (v) => {
          const s = String(v).trim().toUpperCase();
          if (s === "ĐÃ TIÊM" || s === "CÓ" || s === "YES" || s === "TRUE") return "YES";
          if (s === "CHƯA TIÊM" || s === "KHÔNG" || s === "NO" || s === "FALSE") return "NO";
          return s;
        };

        const valStr = normalize(targetValue);
        const condVal = normalize(cond.value);

        if (targetQ.questionType === "NUMBER") {
          const valNum = parseFloat(targetValue);
          const condNum = parseFloat(cond.value);
          switch (cond.operator) {
            case "lessThan": return valNum < condNum;
            case "greaterThan": return valNum > condNum;
            case "greaterThanOrEqual": return valNum >= condNum;
            default: return valNum === condNum;
          }
        }

        if (cond.operator === "in") {
          const condArray = Array.isArray(cond.value) ? cond.value.map(normalize) : [condVal];
          return condArray.includes(valStr);
        }

        return valStr === condVal;
      });
    } catch (e) { return true; }
  };

  // --- HÀM LƯU DỮ LIỆU CỐ ĐỊNH XUỐNG DB ---
  const forceSaveDemographics = async (sid, formData, initialAnswers) => {
    const questions = formData.sections?.flatMap(s => s.questions) || [];
    for (const q of questions) {
        const code = q.questionCode?.trim().toUpperCase();
        if (code === "V3" || code === "V4") {
            const val = initialAnswers[`question_${q.questionId}`];
            if (!isEmpty(val)) {
                try {
                    await submitAssessmentAnswer({
                        sessionId: sid,
                        questionId: q.questionId,
                        answerType: q.questionType,
                        answerValue: String(val)
                    });
                    console.log(`Auto-saved fixed field: ${code} = ${val}`);
                } catch (e) { console.error("Force save demographics failed", e); }
            }
        }
    }
  };

  const normalizeInitialAnswers = (formData, currentSessionAnswers, patientProfile, history) => {
    const initial = {};
    const historyMap = {};
    if (history) { Object.keys(history).forEach(key => { historyMap[key.trim().toUpperCase()] = history[key]; }); }
    
    formData?.sections?.forEach((section) => {
      section.questions?.forEach((q) => {
        const key = `question_${q.questionId}`;
        const code = q.questionCode?.trim().toUpperCase();

        initial[key] = q.questionType === "MULTIPLE_CHOICE" ? [] : "";

        if (code === "V3" && patientProfile?.dateOfBirth) {
            initial[key] = calculateAge(patientProfile.dateOfBirth);
        } else if (code === "V4") {
            initial[key] = patientProfile?.gender === "MALE" ? "Nam" : "Nữ"; 
        } else if (code && historyMap[code]) {
          initial[key] = parseValue(historyMap[code], q.questionType);
        }
      });
    });

    currentSessionAnswers?.forEach((ans) => {
      if (ans && ans.questionId) initial[`question_${ans.questionId}`] = parseValue(ans.answerValue, ans.answerType);
    });    
    return initial;
  };

  // --- QUẢN LÝ PHIÊN ---
  const startOrResumeSession = async (formData, patientProfile, history) => {
    const storageKey = buildStorageKey(patientId, formId);
    const cachedSessionId = localStorage.getItem(storageKey);

    if (cachedSessionId) {
      try {
        const res = await getAssessmentSession(cachedSessionId);
        if (res.session?.status === "IN_PROGRESS") {
          setSessionId(cachedSessionId);
          setNotes(res.session?.notes || "");
          setAnswers(normalizeInitialAnswers(formData, res.answers, patientProfile, history));
          return;
        }
      } catch { localStorage.removeItem(storageKey); }
    }

    const startRes = await startAssessmentSession({ patientId, formId });
    const sid = startRes.sessionId;
    setSessionId(sid);
    localStorage.setItem(storageKey, sid);
    const initialData = normalizeInitialAnswers(formData, [], patientProfile, history);
    setAnswers(initialData);
    
    // TỰ ĐỘNG LƯU TUỔI, GIỚI TÍNH VÀO DATABASE
    await forceSaveDemographics(sid, formData, initialData);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!patientId || !formId) return;
      setLoading(true);
      try {
        const [formRes, patientRes, historyRes] = await Promise.all([
          fetchFormById(formId),
          fetchPatientById(patientId),
          api.get(`/api/forms/latest-data/${patientId}`).catch(() => ({ data: {} }))
        ]);
        setForm(formRes);
        setPatient(patientRes);
        // GỌI HÀM WRAPPER ĐỂ KÍCH HOẠT AUTO-SAVE
        await startOrResumeSession(formRes, patientRes, historyRes.data);
        setError(null);
      } catch (err) { setError("Lỗi tải biểu mẫu"); } 
      finally { setLoading(false); }
    };
    loadData();
  }, [patientId, formId]);

  const allQuestions = useMemo(() => form?.sections?.flatMap(s => s.questions) || [], [form]);

  const visibleSections = useMemo(() => {
    if (!form?.sections || !answers) return [];
    return [...form.sections].sort((a, b) => a.sectionOrder - b.sectionOrder).map(s => ({
      ...s,
      questions: (s.questions || []).sort((a, b) => a.questionOrder - b.questionOrder)
        .filter(q => isQuestionVisible(q, answers, allQuestions))
    }));
  }, [form, answers, allQuestions]);

  useEffect(() => {
    const allVisible = visibleSections.flatMap(s => s.questions);
    if (allVisible.length > 0) {
      const answered = allVisible.filter(q => !isEmpty(answers[`question_${q.questionId}`])).length;
      setProgress((answered / allVisible.length) * 100);
    }
  }, [answers, visibleSections]);

  const handleAnswerChange = async (question, value) => {
    setAnswers(prev => ({ ...prev, [`question_${question.questionId}`]: value }));
    if (sessionId) {
      const valStr = question.questionType === "MULTIPLE_CHOICE" ? JSON.stringify(value) : String(value);
      try {
        await submitAssessmentAnswer({ sessionId, questionId: question.questionId, answerType: question.questionType, answerValue: valStr });
      } catch (err) { console.error("Lưu tự động lỗi"); }
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await completeAssessmentSession({ sessionId, notes });
      const payload = {
        patientId, formId,
        submissionData: JSON.stringify({
          sessionId,
          answers: allQuestions.filter(q => !isEmpty(answers[`question_${q.questionId}`])).map(q => ({
            questionId: q.questionId, questionCode: q.questionCode,
            answerValue: q.questionType === "MULTIPLE_CHOICE" ? JSON.stringify(answers[`question_${q.questionId}`]) : String(answers[`question_${q.questionId}`])
          }))
        }),
        notes: notes || ""
      };
      await api.post("/api/submissions", payload);
      setCompleted(true);
      localStorage.removeItem(buildStorageKey(patientId, formId));
    } catch (err) { alert("Lỗi khi gửi biểu mẫu"); } 
    finally { setSubmitting(false); }
  };

  return { form, patient, answers, loading, error, submitting, progress, completed, visibleSections, handleAnswerChange, handleSubmit, notes, setNotes, errors };
};