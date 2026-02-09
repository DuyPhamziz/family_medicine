import React, { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../service/api";

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("DiagnosticForm Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-700 mb-4">⚠️ Lỗi tải biểu mẫu</h2>
            <p className="text-red-600 mb-6">{this.state.error?.message || "Có lỗi xảy ra khi tải biểu mẫu"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load result component
const RiskResultCard = lazy(() => import("./RiskResultCard"));
const QuestionCard = lazy(() => import("./QuestionCard"));

// Loading skeleton component
const QuestionSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-gray-300"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const DiagnosticForm = () => {
  const { patientId, formId } = useParams();
  const navigate = useNavigate();

  // State management
  const [form, setForm] = useState(null);
  const [patient, setPatient] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);

  // Load form and patient data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [formRes, patientRes] = await Promise.all([
          api.get(`/api/forms/${formId}`),
          api.get(`/api/patients/${patientId}`),
        ]);

        setForm(formRes.data);
        setPatient(patientRes.data);

        // Initialize answers
        const initialAnswers = {};
        formRes.data.questions?.forEach((q) => {
          initialAnswers[`question_${q.questionId}`] = "";
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error loading form:", error);
        alert("Lỗi khi tải biểu mẫu");
      } finally {
        setLoading(false);
      }
    };

    if (patientId && formId) {
      loadData();
    }
  }, [patientId, formId]);

  // Update progress
  useEffect(() => {
    if (form) {
      const totalQuestions = form.questions?.length || 0;
      const answeredQuestions = Object.values(answers).filter(
        (a) => a !== ""
      ).length;
      const progressPercent = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
      setProgress(progressPercent);
    }
  }, [answers, form]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`question_${questionId}`]: value,
    }));

    // Clear error for this question
    setErrors((prev) => ({
      ...prev,
      [`question_${questionId}`]: null,
    }));
  };

  const validateAnswers = () => {
    const newErrors = {};
    form.questions.forEach((question) => {
      if (question.required && !answers[`question_${question.questionId}`]) {
        newErrors[`question_${question.questionId}`] =
          "Vui lòng trả lời câu hỏi này";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAnswers()) {
      alert("Vui lòng điền đầy đủ các câu hỏi bắt buộc");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        patientId: patientId,
        formId: formId,
        submissionData: JSON.stringify(answers),
        notes: notes,
      };

      const response = await api.post("/api/forms/submit", submitData);
      setResult(response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Lỗi khi gửi biểu mẫu");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          </div>
          <p className="text-gray-600 font-medium">Đang tải biểu mẫu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!form || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">❌ Không thể tải biểu mẫu</h2>
          <p className="text-red-600 mb-4 text-sm">
            {!form ? "Biểu mẫu không tìm thấy" : "Thông tin bệnh nhân không tìm thấy"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const visibleQuestions = form.questions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1 font-medium transition-colors"
          >
            ← Quay lại
          </button>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {form.formName}
            </h1>
            <p className="text-gray-600 mb-4">{form.description}</p>

            <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Bệnh nhân: <span className="font-bold text-gray-800">{patient.fullName}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Tuổi: {patient.age} | {patient.gender === "M" ? "Nam" : "Nữ"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tiến độ</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-lg shadow p-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Questions Container with Lazy Loading */}
          <Suspense fallback={<QuestionSkeleton />}>
            {visibleQuestions.map((question, index) => (
              <QuestionCard
                key={question.questionId}
                question={question}
                index={index}
                value={answers[`question_${question.questionId}`] || ""}
                onChange={(value) => handleAnswerChange(question.questionId, value)}
                error={errors[`question_${question.questionId}`]}
              />
            ))}
          </Suspense>

          {/* Notes section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block font-semibold text-gray-800 mb-2">
              Ghi chú bổ sung (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú nếu cần thiết..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-end sticky bottom-0 bg-white rounded-lg shadow-lg p-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || progress < 100}
              className={`px-8 py-3 rounded-lg text-white font-medium transition-all flex items-center gap-2 ${
                submitting || progress < 100
                  ? "bg-gray-400 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang gửi...
                </>
              ) : (
                <>
                  ✓ Gửi biểu mẫu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagnosticForm;
