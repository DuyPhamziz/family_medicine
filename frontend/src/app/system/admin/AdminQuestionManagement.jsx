import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../service/api";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import MessageDialog from "../../../components/common/MessageDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Modal Overlay Component - Cải thiện UX
const ModalOverlay = ({ isOpen, onClose, children, editingMode = false }) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingMode ? "✏️ Chỉnh sửa câu hỏi" : "➕ Thêm câu hỏi mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            title="Đóng (Esc)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Section Modal
const SectionModalOverlay = ({ isOpen, onClose, children, editingMode = false }) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingMode ? "✏️ Chỉnh sửa nhóm" : "➕ Thêm nhóm câu hỏi"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            title="Đóng (Esc)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Sortable Section Component - Cải tiến
const SortableSection = ({ section, children, onDeleteSection, onAddQuestion }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: section.sectionId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 p-6 ${
        isOver ? "border-teal-400 bg-teal-50" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-400 hover:text-teal-600 text-2xl transition-colors p-2 hover:bg-slate-50 rounded-lg"
            title="Kéo để sắp xếp"
          >
            ⋮⋮
          </button>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900">{section.sectionName}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 text-slate-600 text-xs font-bold rounded">
                {section.questions?.length || 0}
              </span>
              câu hỏi
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onAddQuestion}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <span className="text-lg">➕</span> Thêm
          </button>
          <button
            onClick={onDeleteSection}
            className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
            title="Xóa nhóm"
          >
            🗑️
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

// Sortable Question Component - Cải tiến drag-and-drop
const SortableQuestion = ({ question, index, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: question.questionId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 rounded-xl p-4 transition-all duration-200 ${
        isDragging ? "bg-slate-50 border-slate-300 shadow-lg" : isOver ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-400 hover:text-teal-600 text-xl p-2 hover:bg-slate-50 rounded-lg transition-colors mt-1"
            title="Kéo để sắp xếp"
          >
            ⋮⋮
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                <span>Q{index + 1}</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                {question.questionType}
              </span>
              {question.required && (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                  ⚠️ Bắt buộc
                </span>
              )}
            </div>
            <h4 className="text-base font-semibold text-slate-900 leading-snug mb-2">{question.questionText}</h4>
            {question.helpText && (
              <p className="text-sm text-slate-500 mb-2 italic">💡 {question.helpText}</p>
            )}
            {(question.questionType === "SINGLE_CHOICE" ||
              question.questionType === "MULTIPLE_CHOICE") && (
              <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg mt-2">
                📝 {(question.optionItems || []).map((option) => option.optionText).join(", ")}
              </p>
            )}
            {question.questionType === "NUMBER" && (
              <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg mt-2">
                📏 {question.minValue ?? "?"} - {question.maxValue ?? "?"} {question.unit || ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors"
            title="Chỉnh sửa"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
            title="Xóa"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadFormData = useCallback(async () => {
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
  }, [formId]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

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
    setActiveSectionId("");
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
      setMessageDialog({
        open: true,
        title: "Thành công",
        description: "Nhóm câu hỏi đã được tạo.",
      });
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
      description: "Bạn có chắc muốn xóa nhóm này? Tất cả câu hỏi trong nhóm cũng sẽ bị xóa.",
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
        questionData.questionType === "MULTIPLE_CHOICE" ||
        questionData.questionType === "SELECT_DROPDOWN"
          ? buildOptionPayload()
          : [],
    };

    try {
      if (editingQuestion) {
        await api.put(`/api/forms/admin/questions/${editingQuestion.questionId}`, payload);
        setMessageDialog({
          open: true,
          title: "Cập nhật thành công",
          description: "Câu hỏi đã được cập nhật.",
        });
      } else {
        await api.post(`/api/forms/admin/sections/${activeSectionId}/questions`, payload);
        setMessageDialog({
          open: true,
          title: "Tạo thành công",
          description: "Câu hỏi mới đã được tạo.",
        });
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
      description: "Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác.",
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

  const handleQuestionDragEnd = async (event, sectionId) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const section = sections.find((s) => s.sectionId === sectionId);
    if (!section || !section.questions) return;

    const oldIndex = section.questions.findIndex((q) => q.questionId === active.id);
    const newIndex = section.questions.findIndex((q) => q.questionId === over.id);

    if (oldIndex === newIndex) return;

    const reorderedQuestions = arrayMove(section.questions, oldIndex, newIndex);

    setSections((prev) =>
      prev.map((s) =>
        s.sectionId === sectionId ? { ...s, questions: reorderedQuestions } : s
      )
    );

    try {
      const questionOrders = reorderedQuestions.map((q, index) => ({
        questionId: q.questionId,
        newOrder: index + 1,
      }));

      await api.put("/api/forms/admin/questions/reorder", {
        sectionId,
        questionOrders,
      });
    } catch (error) {
      console.error("Error reordering questions:", error);
      await loadFormData();
      setMessageDialog({
        open: true,
        title: "Lỗi sắp xếp",
        description: "Không thể lưu thứ tự câu hỏi.",
      });
    }
  };

  const handleSectionDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.sectionId === active.id);
    const newIndex = sections.findIndex((s) => s.sectionId === over.id);

    if (oldIndex === newIndex) return;

    const reorderedSections = arrayMove(sections, oldIndex, newIndex);

    setSections(reorderedSections);

    try {
      const sectionOrders = reorderedSections.map((s, index) => ({
        sectionId: s.sectionId,
        newOrder: index + 1,
      }));

      await api.put("/api/forms/admin/sections/reorder", {
        formId,
        sectionOrders,
      });
    } catch (error) {
      console.error("Error reordering sections:", error);
      await loadFormData();
      setMessageDialog({
        open: true,
        title: "Lỗi sắp xếp",
        description: "Không thể lưu thứ tự nhóm.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải biểu mẫu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 bg-gradient-to-r from-slate-50 to-teal-50 border border-slate-200 rounded-2xl p-8">
        <div className="flex-1">
          <button
            onClick={() => navigate("/system/admin/forms")}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold mb-3 transition-colors"
          >
            <span>←</span> Quay lại
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{form?.formName}</h1>
          <p className="text-slate-600 mb-3">{form?.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full">
              <span className="text-lg">❓</span> {questionCount} câu hỏi
            </span>
            <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full">
              <span className="text-lg">📦</span> {sections.length} nhóm
            </span>
            <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full">
              <span className="text-lg">📌</span> v{form?.version || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            resetSectionForm();
            setShowSectionForm(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <span className="text-xl">➕</span> Thêm nhóm
        </button>
        <button
          onClick={() => {
            setActiveSectionId("");
            resetQuestionForm();
            setShowQuestionForm(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <span className="text-xl">➕</span> Thêm câu hỏi
        </button>
        <button
          onClick={() => navigate("/system/admin/forms")}
          className="ml-auto inline-flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold transition-colors"
        >
          <span>❌</span> Thoát
        </button>
      </div>

      {/* Questions List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sections.map((s) => s.sectionId)} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {sections.length > 0 ? (
              sections.map((section) => (
                <SortableSection
                  key={section.sectionId}
                  section={section}
                  onDeleteSection={() => handleDeleteSection(section.sectionId)}
                  onAddQuestion={() => {
                    setActiveSectionId(section.sectionId);
                    resetQuestionForm();
                    setShowQuestionForm(true);
                  }}
                >
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleQuestionDragEnd(event, section.sectionId)}
                  >
                    <SortableContext
                      items={section.questions?.map((q) => q.questionId) || []}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {section.questions?.length ? (
                          section.questions.map((question, index) => (
                            <SortableQuestion
                              key={question.questionId}
                              question={question}
                              index={index}
                              onEdit={() => handleEditQuestion(section.sectionId, question)}
                              onDelete={() => handleDeleteQuestion(question.questionId)}
                            />
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <p className="text-lg">Chưa có câu hỏi nào</p>
                            <p className="text-sm mt-1">Nhấn nút "Thêm" ở trên nhóm để thêm câu hỏi</p>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                </SortableSection>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl font-semibold text-slate-900 mb-2">Chưa có nhóm câu hỏi nào</p>
                <p className="text-slate-600 mb-6">Bắt đầu bằng cách tạo nhóm câu hỏi đầu tiên</p>
                <button
                  onClick={() => {
                    resetSectionForm();
                    setShowSectionForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-all"
                >
                  <span>➕</span> Tạo nhóm đầu tiên
                </button>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Section Form Modal */}
      {showSectionForm && (
        <SectionModalOverlay 
          isOpen={showSectionForm} 
          onClose={() => {
            resetSectionForm();
            setShowSectionForm(false);
          }}
          editingMode={false}
        >
          <form onSubmit={handleCreateSection} className="space-y-5">
            <div>
              <label htmlFor="sectionName" className="block text-sm font-semibold text-slate-700 mb-2">
                Tên nhóm câu hỏi *
              </label>
              <input
                id="sectionName"
                type="text"
                name="sectionName"
                value={sectionData.sectionName}
                onChange={handleSectionChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="ví dụ: Thông tin cơ bản, Lịch sử y tế..."
              />
            </div>

            <div>
              <label htmlFor="sectionOrder" className="block text-sm font-semibold text-slate-700 mb-2">
                Thứ tự hiển thị
              </label>
              <input
                id="sectionOrder"
                type="number"
                name="sectionOrder"
                value={sectionData.sectionOrder}
                onChange={handleSectionChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                min="1"
              />
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  resetSectionForm();
                  setShowSectionForm(false);
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-colors"
              >
                💾 Lưu nhóm
              </button>
            </div>
          </form>
        </SectionModalOverlay>
      )}

      {/* Question Form Modal */}
      {showQuestionForm && (
        <ModalOverlay 
          isOpen={showQuestionForm} 
          onClose={() => {
            resetQuestionForm();
            setShowQuestionForm(false);
          }}
          editingMode={!!editingQuestion}
        >
          <form onSubmit={handleSubmitQuestion} className="space-y-5">
            <div>
              <label htmlFor="activeSectionId" className="block text-sm font-semibold text-slate-700 mb-2">
                Nhóm câu hỏi *
              </label>
              <select
                id="activeSectionId"
                value={activeSectionId}
                onChange={(e) => setActiveSectionId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">Chọn nhóm câu hỏi</option>
                {sections.map((section) => (
                  <option key={section.sectionId} value={section.sectionId}>
                    {section.sectionName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="questionCode" className="block text-sm font-semibold text-slate-700 mb-2">
                  Mã câu hỏi
                </label>
                <input
                  id="questionCode"
                  type="text"
                  name="questionCode"
                  value={questionData.questionCode}
                  onChange={handleQuestionChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="V1, Q-AGE..."
                />
              </div>
              <div>
                <label htmlFor="questionOrder" className="block text-sm font-semibold text-slate-700 mb-2">
                  Thứ tự câu hỏi
                </label>
                <input
                  id="questionOrder"
                  type="number"
                  name="questionOrder"
                  value={questionData.questionOrder}
                  onChange={handleQuestionChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="questionText" className="block text-sm font-semibold text-slate-700 mb-2">
                Nội dung câu hỏi *
              </label>
              <textarea
                id="questionText"
                name="questionText"
                value={questionData.questionText}
                onChange={handleQuestionChange}
                rows="3"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="questionType" className="block text-sm font-semibold text-slate-700 mb-2">
                  Loại câu hỏi *
                </label>
                <select
                  id="questionType"
                  name="questionType"
                  value={questionData.questionType}
                  onChange={handleQuestionChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="TEXT">Văn bản</option>
                  <option value="NUMBER">Số</option>
                  <option value="SINGLE_CHOICE">Chọn 1</option>
                  <option value="MULTIPLE_CHOICE">Chọn nhiều</option>
                  <option value="SELECT_DROPDOWN">Dropdown</option>
                  <option value="DATE">Ngày tháng</option>
                  <option value="BOOLEAN">Có/Không</option>
                </select>
              </div>
              <div>
                <label htmlFor="points" className="block text-sm font-semibold text-slate-700 mb-2">
                  Điểm
                </label>
                <input
                  id="points"
                  type="number"
                  name="points"
                  value={questionData.points}
                  onChange={handleQuestionChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  min="0"
                />
              </div>
            </div>

            {questionData.questionType === "NUMBER" && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="minValue" className="block text-sm font-semibold text-slate-700 mb-2">
                    Giá trị min
                  </label>
                  <input
                    id="minValue"
                    type="number"
                    name="minValue"
                    value={questionData.minValue}
                    onChange={handleQuestionChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="maxValue" className="block text-sm font-semibold text-slate-700 mb-2">
                    Giá trị max
                  </label>
                  <input
                    id="maxValue"
                    type="number"
                    name="maxValue"
                    value={questionData.maxValue}
                    onChange={handleQuestionChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-semibold text-slate-700 mb-2">
                    Đơn vị
                  </label>
                  <input
                    id="unit"
                    type="text"
                    name="unit"
                    value={questionData.unit}
                    onChange={handleQuestionChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="kg, cm..."
                  />
                </div>
              </div>
            )}

            {(questionData.questionType === "SINGLE_CHOICE" ||
              questionData.questionType === "MULTIPLE_CHOICE" ||
              questionData.questionType === "SELECT_DROPDOWN") && (
              <div>
                <label htmlFor="options" className="block text-sm font-semibold text-slate-700 mb-2">
                  Các lựa chọn (mỗi dòng 1 lựa chọn)
                </label>
                <textarea
                  id="options"
                  name="options"
                  value={questionData.options}
                  onChange={handleQuestionChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                  placeholder="Lựa chọn A&#10;Lựa chọn B&#10;Lựa chọn C"
                />
              </div>
            )}

            <div>
              <label htmlFor="helpText" className="block text-sm font-semibold text-slate-700 mb-2">
                Gợi ý (tùy chọn)
              </label>
              <textarea
                id="helpText"
                name="helpText"
                value={questionData.helpText}
                onChange={handleQuestionChange}
                rows="2"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                placeholder="Văn bản hỗ trợ người dùng..."
              />
            </div>

            <div>
              <label htmlFor="displayCondition" className="block text-sm font-semibold text-slate-700 mb-2">
                Điều kiện hiển thị (tùy chọn)
              </label>
              <input
                id="displayCondition"
                type="text"
                name="displayCondition"
                value={questionData.displayCondition}
                onChange={handleQuestionChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Ví dụ: Q1 == 'Có'"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg">
              <input
                id="required"
                type="checkbox"
                name="required"
                checked={questionData.required}
                onChange={handleQuestionChange}
                className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
              />
              <label htmlFor="required" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                Câu hỏi bắt buộc
              </label>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  resetQuestionForm();
                  setShowQuestionForm(false);
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-colors"
              >
                {editingQuestion ? "💾 Cập nhật" : "✅ Tạo câu hỏi"}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

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
