import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../service/api";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import MessageDialog from "../../../components/common/MessageDialog";

const AdminQuestionManagement = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: null,
  });
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    title: "",
    description: "",
  });

  const [sectionData, setSectionData] = useState({
    sectionName: "",
    sectionOrder: 1,
  });

  const [questionData, setQuestionData] = useState({
    questionCode: "",
    questionText: "",
    questionType: "TEXT",
    points: 0,
    unit: "",
    minValue: "",
    maxValue: "",
    options: "",
    required: true,
    questionOrder: 1,
    helpText: "",
    displayCondition: "",
  });

  const loadFormData = async () => {
    try {
      const response = await api.get(`/api/forms/admin/${formId}`);
      setForm(response.data);
      setSections(response.data.sections || []);
    } catch (error) {
      console.error("Error loading form:", error);
      setMessageDialog({
        open: true,
        title: "Không thể tải",
        description: "Lỗi khi tải biểu mẫu.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, [formId]);

  const questionCount = useMemo(() => {
    return sections.reduce(
      (total, section) => total + (section.questions?.length || 0),
      0
    );
  }, [sections]);

  const handleSectionChange = (e) => {
    const { name, value } = e.target;
    setSectionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildOptionPayload = () => {
    const lines = questionData.options
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.map((text, index) => ({
      optionText: text,
      optionValue: text,
      optionOrder: index + 1,
    }));
  };

  const resetQuestionForm = () => {
    setQuestionData({
      questionCode: "",
      questionText: "",
      questionType: "TEXT",
      points: 0,
      unit: "",
      minValue: "",
      maxValue: "",
      options: "",
      required: true,
      questionOrder: 1,
      helpText: "",
      displayCondition: "",
    });
    setEditingQuestion(null);
  };

  const resetSectionForm = () => {
    setSectionData({
      sectionName: "",
      sectionOrder: 1,
    });
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();

    if (!sectionData.sectionName.trim()) {
      setMessageDialog({
        open: true,
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên nhóm.",
      });
      return;
    }

    try {
      await api.post(`/api/forms/admin/${formId}/sections`, {
        sectionName: sectionData.sectionName,
        sectionOrder: Number(sectionData.sectionOrder) || 1,
      });
      resetSectionForm();
      setShowSectionForm(false);
      await loadFormData();
    } catch (error) {
      console.error("Error creating section:", error);
      setMessageDialog({
        open: true,
        title: "Không thể tạo",
        description: "Lỗi khi tạo nhóm câu hỏi.",
      });
    }
  };

  const handleDeleteSection = async (sectionId) => {
    setConfirmDialog({
      open: true,
      title: "Xóa nhóm câu hỏi?",
      description: "Bạn có chắc muốn xóa nhóm này?",
      onConfirm: async () => {
        try {
          await api.delete(`/api/forms/admin/sections/${sectionId}`);
          setConfirmDialog({ open: false, title: "", description: "", onConfirm: null });
          await loadFormData();
        } catch (error) {
          console.error("Error deleting section:", error);
          setConfirmDialog({ open: false, title: "", description: "", onConfirm: null });
          setMessageDialog({
            open: true,
            title: "Không thể xóa",
            description: "Lỗi khi xóa nhóm câu hỏi.",
          });
        }
      },
    });
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();

    if (!questionData.questionText.trim()) {
      setMessageDialog({
        open: true,
        title: "Thiếu thông tin",
        description: "Vui lòng nhập nội dung câu hỏi.",
      });
      return;
    }

    if (!activeSectionId) {
      setMessageDialog({
        open: true,
        title: "Thiếu thông tin",
        description: "Vui lòng chọn nhóm câu hỏi.",
      });
      return;
    }

    const payload = {
      questionCode: questionData.questionCode || undefined,
      questionOrder: Number(questionData.questionOrder) || 1,
      questionText: questionData.questionText,
      questionType: questionData.questionType,
      unit: questionData.unit || null,
      minValue: questionData.minValue === "" ? null : Number(questionData.minValue),
      maxValue: questionData.maxValue === "" ? null : Number(questionData.maxValue),
      points: Number(questionData.points) || 0,
      required: questionData.required,
      helpText: questionData.helpText || null,
      displayCondition: questionData.displayCondition || null,
      options:
        questionData.questionType === "SINGLE_CHOICE" ||
        questionData.questionType === "MULTIPLE_CHOICE"
          ? buildOptionPayload()
          : [],
    };

    try {
      if (editingQuestion) {
        await api.put(`/api/forms/admin/questions/${editingQuestion.questionId}`, payload);
      } else {
        await api.post(`/api/forms/admin/sections/${activeSectionId}/questions`, payload);
      }

      resetQuestionForm();
      setShowQuestionForm(false);
      await loadFormData();
    } catch (error) {
      console.error("Error saving question:", error);
      setMessageDialog({
        open: true,
        title: "Không thể lưu",
        description: "Lỗi khi lưu câu hỏi.",
      });
    }
  };

  const handleEditQuestion = (sectionId, question) => {
    setEditingQuestion(question);
    setActiveSectionId(sectionId);
    setQuestionData({
      questionCode: question.questionCode || "",
      questionText: question.questionText,
      questionType: question.questionType,
      points: question.points || 0,
      unit: question.unit || "",
      minValue: question.minValue ?? "",
      maxValue: question.maxValue ?? "",
      options: (question.optionItems || [])
        .map((option) => option.optionText)
        .join("\n"),
      required: question.required !== false,
      questionOrder: question.questionOrder || 1,
      helpText: question.helpText || "",
      displayCondition: question.displayCondition || "",
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    setConfirmDialog({
      open: true,
      title: "Xóa câu hỏi?",
      description: "Bạn có chắc muốn xóa câu hỏi này?",
      onConfirm: async () => {
        try {
          await api.delete(`/api/forms/admin/questions/${questionId}`);
          setConfirmDialog({ open: false, title: "", description: "", onConfirm: null });
          await loadFormData();
        } catch (error) {
          console.error("Error deleting question:", error);
          setConfirmDialog({ open: false, title: "", description: "", onConfirm: null });
          setMessageDialog({
            open: true,
            title: "Không thể xóa",
            description: "Lỗi khi xóa câu hỏi.",
          });
        }
      },
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
          <p className="text-sm text-gray-500 mt-1">
            {questionCount} câu hỏi • v{form?.version || 1}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setShowSectionForm(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
        >
          ➕ Thêm nhóm câu hỏi
        </button>
        <button
          onClick={() => {
            setActiveSectionId("");
            resetQuestionForm();
            setShowQuestionForm(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          ➕ Thêm câu hỏi
        </button>
        <button
          onClick={() => navigate("/system/admin/forms")}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
        >
          ❌ Đóng
        </button>
      </div>

      {showSectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">➕ Thêm nhóm câu hỏi</h2>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nhóm *
                </label>
                <input
                  type="text"
                  name="sectionName"
                  value={sectionData.sectionName}
                  onChange={handleSectionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự
                </label>
                <input
                  type="number"
                  name="sectionOrder"
                  value={sectionData.sectionOrder}
                  onChange={handleSectionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetSectionForm();
                    setShowSectionForm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  💾 Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingQuestion ? "✏️ Chỉnh sửa Câu hỏi" : "➕ Thêm Câu hỏi"}
            </h2>

            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhóm câu hỏi *
                </label>
                <select
                  value={activeSectionId}
                  onChange={(e) => setActiveSectionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn nhóm</option>
                  {sections.map((section) => (
                    <option key={section.sectionId} value={section.sectionId}>
                      {section.sectionName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã câu hỏi
                  </label>
                  <input
                    type="text"
                    name="questionCode"
                    value={questionData.questionCode}
                    onChange={handleQuestionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="V1, Q-AGE..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    name="questionOrder"
                    value={questionData.questionOrder}
                    onChange={handleQuestionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung Câu hỏi *
                </label>
                <textarea
                  name="questionText"
                  value={questionData.questionText}
                  onChange={handleQuestionChange}
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
                    onChange={handleQuestionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TEXT">Văn bản</option>
                    <option value="NUMBER">Số</option>
                    <option value="BOOLEAN">Có / Không</option>
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
                    onChange={handleQuestionChange}
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
                      onChange={handleQuestionChange}
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
                      value={questionData.minValue}
                      onChange={handleQuestionChange}
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
                      value={questionData.maxValue}
                      onChange={handleQuestionChange}
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
                    onChange={handleQuestionChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Có\nKhông\nCó thể"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gợi ý / hướng dẫn
                </label>
                <input
                  type="text"
                  name="helpText"
                  value={questionData.helpText}
                  onChange={handleQuestionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: đo vào buổi sáng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điều kiện hiển thị (JSON)
                </label>
                <textarea
                  name="displayCondition"
                  value={questionData.displayCondition}
                  onChange={handleQuestionChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='{"dependsOn":"Q1","equals":"yes"}'
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  name="required"
                  checked={questionData.required}
                  onChange={handleQuestionChange}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700">
                  Câu hỏi bắt buộc
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetQuestionForm();
                    setShowQuestionForm(false);
                  }}
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

      <div className="space-y-6">
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.sectionId} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{section.sectionName}</h3>
                  <p className="text-sm text-gray-500">Thứ tự: {section.sectionOrder}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveSectionId(section.sectionId);
                      resetQuestionForm();
                      setShowQuestionForm(true);
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    ➕ Thêm câu hỏi
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.sectionId)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    🗑️ Xóa nhóm
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {section.questions?.length ? (
                  section.questions.map((question, index) => (
                    <div
                      key={question.questionId}
                      className="border border-slate-100 rounded-lg p-4 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            #{index + 1}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {question.questionType}
                          </span>
                          {question.required && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                              Bắt buộc
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {question.questionText}
                        </h4>
                        {question.helpText && (
                          <p className="text-sm text-gray-500 mt-1">💡 {question.helpText}</p>
                        )}
                        {(question.questionType === "SINGLE_CHOICE" ||
                          question.questionType === "MULTIPLE_CHOICE") && (
                          <p className="text-sm text-gray-600 mt-2">
                            📝 {(question.optionItems || [])
                              .map((option) => option.optionText)
                              .join(", ")}
                          </p>
                        )}
                        {question.questionType === "NUMBER" && (
                          <p className="text-sm text-gray-600 mt-2">
                            📏 {question.minValue ?? "?"} - {question.maxValue ?? "?"} {question.unit || ""}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditQuestion(section.sectionId, question)}
                          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.questionId)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Chưa có câu hỏi nào.</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">📭 Chưa có nhóm câu hỏi nào</p>
            <button
              onClick={() => setShowSectionForm(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              ➕ Thêm nhóm đầu tiên
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ open: false, title: "", description: "", onConfirm: null })}
      />

      <MessageDialog
        open={messageDialog.open}
        title={messageDialog.title}
        description={messageDialog.description}
        onClose={() => setMessageDialog({ open: false, title: "", description: "" })}
        actionLabel="Đóng"
      />
    </div>
  );
};

export default AdminQuestionManagement;
