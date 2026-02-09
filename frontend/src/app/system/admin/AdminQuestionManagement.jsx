import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../service/api";

const AdminQuestionManagement = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionData, setQuestionData] = useState({
    questionText: "",
    questionType: "TEXT",
    points: 0,
    unit: "",
    minValue: null,
    maxValue: null,
    options: "",
    required: true,
    questionOrder: 1,
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const response = await api.get(`/api/forms/${formId}`);
        setForm(response.data);
        setQuestions(response.data.questions || []);
      } catch (error) {
        console.error("Error loading form:", error);
        alert("Lỗi khi tải biểu mẫu");
      } finally {
        setLoading(false);
      }
    };
    
    loadFormData();
  }, [formId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questionData.questionText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    try {
      if (editingQuestion) {
        // Update API endpoint sẽ được thêm
        alert("Chức năng cập nhật câu hỏi đang được phát triển");
      } else {
        // Create API endpoint sẽ được thêm
        alert("Chức năng tạo câu hỏi đang được phát triển");
      }
      setQuestionData({
        questionText: "",
        questionType: "TEXT",
        points: 0,
        unit: "",
        minValue: null,
        maxValue: null,
        options: "",
        required: true,
        questionOrder: 1,
      });
      setEditingQuestion(null);
      setShowForm(false);
      // Reload form data
      const response = await api.get(`/api/forms/${formId}`);
      setForm(response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Lỗi khi lưu câu hỏi");
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setQuestionData({
      questionText: question.questionText,
      questionType: question.questionType,
      points: question.points || 0,
      unit: question.unit || "",
      minValue: question.minValue || null,
      maxValue: question.maxValue || null,
      options: question.options ? JSON.stringify(question.options) : "",
      required: question.required !== false,
      questionOrder: question.questionOrder || 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      return;
    }

    try {
      // Delete API: DELETE /api/forms/{formId}/questions/{questionId}
      // TODO: Thêm API endpoint sau khi kết nối database
      console.log(`Deleting question ${questionId} from form ${formId}`);
      alert("Chức năng xóa câu hỏi đang được phát triển");
      // Reload form data
      const response = await api.get(`/api/forms/${formId}`);
      setForm(response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Lỗi khi xóa câu hỏi");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setQuestionData({
      questionText: "",
      questionType: "TEXT",
      points: 0,
      unit: "",
      minValue: null,
      maxValue: null,
      options: "",
      required: true,
      questionOrder: 1,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/system/admin/forms")}
          className="text-blue-600 hover:text-blue-800 font-medium text-lg"
        >
          ← Quay lại
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{form?.formName}</h1>
          <p className="text-gray-600">{form?.description}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          ➕ Thêm Câu hỏi
        </button>
        <button
          onClick={() => navigate("/system/admin/forms")}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
        >
          ❌ Đóng
        </button>
      </div>

      {/* Question Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingQuestion ? "✏️ Chỉnh sửa Câu hỏi" : "➕ Thêm Câu hỏi"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung Câu hỏi *
                </label>
                <textarea
                  name="questionText"
                  value={questionData.questionText}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại Câu hỏi *
                  </label>
                  <select
                    name="questionType"
                    value={questionData.questionType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TEXT">Văn bản</option>
                    <option value="NUMBER">Số</option>
                    <option value="DATE">Ngày</option>
                    <option value="SINGLE_CHOICE">Một lựa chọn</option>
                    <option value="MULTIPLE_CHOICE">Nhiều lựa chọn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm số
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={questionData.points}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {questionData.questionType === "NUMBER" && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={questionData.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="kg, cm, mmHg..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị Min
                    </label>
                    <input
                      type="number"
                      name="minValue"
                      value={questionData.minValue || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị Max
                    </label>
                    <input
                      type="number"
                      name="maxValue"
                      value={questionData.maxValue || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {(questionData.questionType === "SINGLE_CHOICE" ||
                questionData.questionType === "MULTIPLE_CHOICE") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lựa chọn (mỗi dòng một lựa chọn)
                  </label>
                  <textarea
                    name="options"
                    value={questionData.options}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Có&#10;Không&#10;Có thể"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  name="required"
                  checked={questionData.required}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700">
                  Câu hỏi bắt buộc
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingQuestion ? "💾 Cập nhật" : "💾 Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-blue-600">
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {question.questionText}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Loại: <span className="font-medium">{question.questionType}</span>
                    {question.unit && ` • Đơn vị: ${question.unit}`}
                    {question.points > 0 && ` • Điểm: ${question.points}`}
                  </p>
                </div>
              </div>

              {question.options && (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Lựa chọn:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(question.options) &&
                      question.options.map((opt, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {opt}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleEdit(question)}
                  className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">
              ❓ Biểu mẫu này chưa có câu hỏi nào
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              ➕ Thêm câu hỏi đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionManagement;
