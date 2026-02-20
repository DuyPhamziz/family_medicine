import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAssessmentSession } from "../../hooks/forms/useAssessmentSession";
import QuestionCard from "../../app/system/form/QuestionCard";

const DiagnosticFormPage = () => {
  const navigate = useNavigate();
  const { patientId, formId } = useParams();
  const {
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
    completed,
    visibleSections,
    handleAnswerChange,
    handleSaveProgress,
    handleSubmit,
  } = useAssessmentSession({ patientId, formId });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Lỗi tải biểu mẫu</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1 font-medium transition-colors"
          >
            Back
          </button>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{form?.formName}</h1>
            <p className="text-gray-600 mb-4">{form?.description}</p>

            <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Bệnh nhân / Patient: <span className="font-bold text-gray-800">{patient?.fullName}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Tuổi / Age: {patient?.age} | {patient?.gender === "MALE" ? "Nam" : "Nữ"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tiến độ / Progress</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {completed ? (
          <div className="bg-white rounded-lg shadow-lg p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã gửi biểu mẫu</h2>
            <p className="text-gray-600 mb-6">Dữ liệu đã được lưu thành công.</p>
            <button
              onClick={() => navigate("/system/forms")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Quay lại biểu mẫu
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
            className="space-y-8"
          >
            {visibleSections.map((section) => (
              <div key={section.sectionId} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-blue-800">{section.sectionName}</h3>
                </div>
                <div className="p-6 space-y-6">
                  {section.questions && section.questions.length > 0 ? (
                    section.questions.map((question, qIndex) => (
                      <QuestionCard
                        key={question.questionId}
                        question={question}
                        index={qIndex}
                        value={answers[`question_${question.questionId}`]}
                        onChange={(value) => handleAnswerChange(question, value)}
                        error={errors[`question_${question.questionId}`]}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Không có câu hỏi trong mục này</p>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block font-semibold text-gray-800 mb-2">Ghi chú (tùy chọn)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thêm ghi chú..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
            </div>

            <div className="flex flex-wrap gap-4 justify-end sticky bottom-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-4 border border-gray-200 z-10">
              <button
                type="button"
                onClick={() => handleSaveProgress(false)}
                disabled={saving || submitting}
                className="px-6 py-3 border-2 border-emerald-500 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Đang lưu..." : "Lưu tạm / Save progress"}
              </button>
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
                disabled={submitting}
                className={`px-8 py-3 rounded-lg text-white font-medium transition-all flex items-center gap-2 ${
                  submitting
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
                  <>Gửi biểu mẫu</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DiagnosticFormPage;
