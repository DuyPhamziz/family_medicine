import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../service/api";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import MessageDialog from "../../../components/common/MessageDialog";
import ConditionalRuleBuilder from "../../../components/form/ConditionalRuleBuilder";
import ScoringRulesEditor from "../../../components/form/ScoringRulesEditor";
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

const SUB_FIELDS_CONFIG_TEMPLATES = [
  {
    id: "vaccine-basic",
    label: "Mau vaccin co ban",
    description: "Nam tiem va ghi chu",
    config: [
      { key: "year", label: "Nam tiem", type: "NUMBER", placeholder: "Vi du: 2024" },
      { key: "notes", label: "Ghi chu", type: "TEXT", rows: 2, placeholder: "Neu can ghi them" },
    ],
  },
  {
    id: "vaccine-advanced",
    label: "Mau vaccin nang cao",
    description: "Nam, loai vaccin, tinh trang mui",
    config: [
      { key: "year", label: "Nam tiem", type: "NUMBER", placeholder: "Vi du: 2024" },
      {
        key: "vaccine_type",
        label: "Loai vaccin",
        type: "SELECT",
        options: [
          { value: "PCV13", label: "PCV13" },
          { value: "PPSV23", label: "PPSV23" },
          { value: "other", label: "Khac" },
        ],
      },
      {
        key: "dose_status",
        label: "Tinh trang mui tiem",
        type: "SELECT",
        options: [
          { value: "completed", label: "Da du mui" },
          { value: "incomplete", label: "Chua du mui" },
        ],
      },
      { key: "notes", label: "Ghi chu", type: "TEXT", rows: 2 },
    ],
  },
];

const SUB_FIELD_TYPE_OPTIONS = [
  { value: "TEXT", label: "Van ban" },
  { value: "TEXTAREA", label: "Van ban dai" },
  { value: "NUMBER", label: "So" },
  { value: "DATE", label: "Ngay" },
  { value: "SELECT", label: "Lua chon" },
  { value: "BOOLEAN", label: "Co/Khong" },
  { value: "SINGLE_CHOICE", label: "Chon 1" },
  { value: "MULTIPLE_CHOICE", label: "Chon nhieu" },
];

const SUB_FIELDS_QUESTION_TYPES = ["MULTIPLE_CHOICE_WITH_SUBFIELDS", "SINGLE_CHOICE_WITH_SUBFIELDS"];

const slugifySubFieldKey = (input) => {
  return (input || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
};

const parseSubFieldsConfig = (raw) => {
  if (!raw || !raw.trim()) {
    return [];
  }
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
};

const stringifySubFieldsConfig = (fields) => {
  return JSON.stringify(fields, null, 2);
};

const createSubFieldRow = (field = {}, index = 0) => {
  const fallbackIndex = index + 1;
  return {
    uiId: field.uiId || `sf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    key: field.key || `field_${fallbackIndex}`,
    label: field.label || `Truong ${fallbackIndex}`,
    type: field.type || "TEXT",
    placeholder: field.placeholder || "",
    rows: field.rows,
    options: Array.isArray(field.options) ? field.options : [],
  };
};

const sanitizeSubFieldRows = (rows) => {
  return (rows || []).map((field, index) => {
    const generatedKey = slugifySubFieldKey(field.key || field.label || `field_${index + 1}`) || `field_${index + 1}`;
    return {
      key: generatedKey,
      label: field.label || `Truong ${index + 1}`,
      type: field.type || "TEXT",
      placeholder: field.placeholder || "",
      rows: field.rows,
      options: Array.isArray(field.options) ? field.options : undefined,
    };
  });
};

const parseOptionLines = (rawOptions) => {
  return (rawOptions || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const stringifyOptionLines = (options) => {
  return (options || []).map((item) => `${item || ""}`.trim()).filter(Boolean).join("\n");
};

const sanitizeDisplayCondition = (raw) => {
  if (!raw || !raw.trim()) {
    return "";
  }

  const pruneRuleNode = (node) => {
    if (!node || typeof node !== "object") {
      return null;
    }

    if (Array.isArray(node.AND)) {
      const children = node.AND.map((child) => pruneRuleNode(child)).filter(Boolean);
      return children.length > 0 ? { AND: children } : null;
    }

    if (Array.isArray(node.OR)) {
      const children = node.OR.map((child) => pruneRuleNode(child)).filter(Boolean);
      return children.length > 0 ? { OR: children } : null;
    }

    const questionCode = typeof node.questionCode === "string" ? node.questionCode.trim() : "";
    const questionId = node.questionId || null;
    if (!questionCode && !questionId) {
      return null;
    }

    return {
      ...node,
      questionCode,
      questionId,
    };
  };

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return "";
    }

    const cleaned = parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }
        const rules = pruneRuleNode(entry.rules);
        if (!rules) {
          return null;
        }

        return {
          ...entry,
          rules,
        };
      })
      .filter(Boolean);

    return cleaned.length > 0 ? JSON.stringify(cleaned) : "";
  } catch {
    return "";
  }
};

const slugifyMatrixKey = (input) => {
  return (input || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
};

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
const SortableSection = ({ section, children, onDeleteSection, onAddQuestion, onEditSection }) => {
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
            onClick={onEditSection}
            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors"
            title="Chỉnh sửa nhóm"
          >
            ✏️
          </button>
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
const SortableQuestion = ({ question, index, onEdit, onDelete, selected, onToggleSelect, highlighted }) => {
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
      id={`question-${question.questionId}`}
      ref={setNodeRef}
      style={style}
      className={`border-2 rounded-xl p-4 transition-all duration-200 ${
        isDragging
          ? "bg-slate-50 border-slate-300 shadow-lg"
          : isOver
            ? "border-teal-400 bg-teal-50"
            : highlighted
              ? "border-amber-400 bg-amber-50"
              : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onToggleSelect(question.questionId, e.target.checked)}
            className="mt-3 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            title="Chọn câu hỏi để gán group hàng loạt"
          />
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
                {question.questionCode && (
                  <span className="font-extrabold">{question.questionCode}</span>
                )}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                {question.questionType}
              </span>
              {question.required && (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                  ⚠️ Bắt buộc
                </span>
              )}
              {question.allowAdditionalAnswers && (
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                  ➕ Trả lời thêm
                </span>
              )}
              {question.isRepeatableGroup && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                  🔁 Repeat group
                </span>
              )}
              {question.groupId && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                  {question.groupId}
                </span>
              )}
            </div>
            <h4 className="text-base font-semibold text-slate-900 leading-snug mb-2">{question.questionText}</h4>
            {question.helpText && (
              <p className="text-sm text-slate-500 mb-2 italic">💡 {question.helpText}</p>
            )}
            {(question.questionType === "SINGLE_CHOICE" ||
              question.questionType === "MULTIPLE_CHOICE" ||
              question.questionType === "SINGLE_CHOICE_WITH_SUBFIELDS" ||
              question.questionType === "MULTIPLE_CHOICE_WITH_SUBFIELDS") && (
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
  const location = useLocation();

  const [form, setForm] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
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
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [bulkGroupConfig, setBulkGroupConfig] = useState({
    groupId: "",
    maxRepeat: "",
    labelAddButton: "Thêm mục khác",
    rootQuestionId: "",
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
    subFieldsConfig: "",
    matrixRows: [],
    matrixColumns: [],
    matrixAllowAdditionalColumn: true,
    matrixAllowAdditionalRow: true,
    required: true,
    allowAdditionalAnswers: false,
    maxAdditionalAnswers: "",
    groupId: "",
    isRepeatableGroup: false,
    repeatGroupRoot: false,
    maxRepeat: "",
    labelAddButton: "",
    questionOrder: 1,
    helpText: "",
    displayCondition: "",
  });
  
  // State cho conditional rules (parsed từ displayCondition JSON)
  const [conditionalRules, setConditionalRules] = useState([]);
  
  // State cho scoring rules của question
  const [scoringRules, setScoringRules] = useState("");
  const [showAdvancedSubFieldsJson, setShowAdvancedSubFieldsJson] = useState(false);
  const [subFieldRows, setSubFieldRows] = useState([]);
  const [optionDraft, setOptionDraft] = useState("");
  const [highlightQuestionId, setHighlightQuestionId] = useState("");

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

  const allQuestions = useMemo(() => sections.flatMap((section) => section.questions || []), [sections]);

  const selectedQuestions = useMemo(
    () => allQuestions.filter((question) => selectedQuestionIds.includes(question.questionId)),
    [allQuestions, selectedQuestionIds]
  );

  const subFieldsConfigState = useMemo(() => {
    if (!SUB_FIELDS_QUESTION_TYPES.includes(questionData.questionType)) {
      return { valid: true, message: "", fields: [] };
    }

    const raw = questionData.subFieldsConfig?.trim();
    if (!raw) {
      return {
        valid: false,
        message: "Ban chua nhap Sub-fields config. Bam 'Dung mau' de tao nhanh.",
        fields: [],
      };
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return { valid: false, message: "JSON phai la mang [].", fields: [] };
      }

      const invalidField = parsed.find(
        (item) => !item || typeof item !== "object" || !item.key || !item.label || !item.type
      );

      if (invalidField) {
        return {
          valid: false,
          message: "Moi field can co du 3 thuoc tinh: key, label, type.",
          fields: [],
        };
      }

      return { valid: true, message: "JSON hop le", fields: parsed };
    } catch (error) {
      return {
        valid: false,
        message: "JSON khong hop le. Kiem tra dau phay, dau ngoac, dau nhay kep.",
        fields: [],
      };
    }
  }, [questionData.questionType, questionData.subFieldsConfig]);

  useEffect(() => {
    if (!SUB_FIELDS_QUESTION_TYPES.includes(questionData.questionType)) {
      setSubFieldRows([]);
      return;
    }

    try {
      const parsedRows = parseSubFieldsConfig(questionData.subFieldsConfig || "[]");
      setSubFieldRows((prevRows) => {
        return parsedRows.map((row, index) => {
          const previous = prevRows[index];
          return createSubFieldRow(
            {
              ...row,
              uiId: previous?.uiId,
            },
            index
          );
        });
      });
    } catch (error) {
      setSubFieldRows([]);
    }
  }, [questionData.questionType, questionData.subFieldsConfig]);

  const applySubFieldsTemplate = (templateId) => {
    const template = SUB_FIELDS_CONFIG_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;

    const nextRows = template.config.map((row, index) => createSubFieldRow(row, index));
    setSubFieldRows(nextRows);
    setQuestionData((prev) => ({
      ...prev,
      subFieldsConfig: stringifySubFieldsConfig(sanitizeSubFieldRows(nextRows)),
    }));
  };

  const formatSubFieldsConfig = () => {
    try {
      const parsed = JSON.parse(questionData.subFieldsConfig || "[]");
      setQuestionData((prev) => ({
        ...prev,
        subFieldsConfig: JSON.stringify(parsed, null, 2),
      }));
    } catch (error) {
      setMessageDialog({
        open: true,
        title: "JSON chua dung",
        description: "Khong the format vi JSON dang sai. Hay sua loi JSON truoc.",
      });
    }
  };

  const updateSubFieldsFromRows = (rows) => {
    const normalizedRows = rows.map((row, index) => createSubFieldRow(row, index));
    setSubFieldRows(normalizedRows);
    setQuestionData((prev) => ({
      ...prev,
      subFieldsConfig: stringifySubFieldsConfig(sanitizeSubFieldRows(normalizedRows)),
    }));
  };

  const addSubFieldRow = () => {
    const nextIndex = subFieldRows.length + 1;
    const nextRows = [
      ...subFieldRows,
      createSubFieldRow({
        key: `field_${nextIndex}`,
        label: `Truong ${nextIndex}`,
        type: "TEXT",
        placeholder: "",
      }, nextIndex - 1),
    ];
    updateSubFieldsFromRows(nextRows);
  };

  const removeSubFieldRow = (index) => {
    const nextRows = subFieldRows.filter((_, idx) => idx !== index);
    updateSubFieldsFromRows(nextRows);
  };

  const updateSubFieldRow = (index, patch) => {
    const nextRows = subFieldRows.map((row, idx) => {
      if (idx !== index) {
        return row;
      }
      return createSubFieldRow({ ...row, ...patch }, idx);
    });
    updateSubFieldsFromRows(nextRows);
  };

  const updateSelectOptions = (index, rawOptions) => {
    const optionLines = (rawOptions || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const options = optionLines.map((line) => ({ value: line, label: line }));
    updateSubFieldRow(index, { options });
  };

  const addMatrixRow = () => {
    const nextIndex = (questionData.matrixRows || []).length + 1;
    const nextRows = [
      ...(questionData.matrixRows || []),
      { key: `disease_${nextIndex}`, label: `Benh ${nextIndex}` },
    ];
    setQuestionData((prev) => ({ ...prev, matrixRows: nextRows }));
  };

  const updateMatrixRow = (index, patch) => {
    const nextRows = (questionData.matrixRows || []).map((row, idx) => {
      if (idx !== index) return row;
      const nextRow = { ...row, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "label") && (!nextRow.key || nextRow.key.startsWith("disease_"))) {
        const generated = slugifyMatrixKey(nextRow.label);
        if (generated) nextRow.key = generated;
      }
      return nextRow;
    });
    setQuestionData((prev) => ({ ...prev, matrixRows: nextRows }));
  };

  const removeMatrixRow = (index) => {
    const nextRows = (questionData.matrixRows || []).filter((_, idx) => idx !== index);
    setQuestionData((prev) => ({ ...prev, matrixRows: nextRows }));
  };

  const addMatrixColumn = () => {
    const nextIndex = (questionData.matrixColumns || []).length + 1;
    const nextColumns = [
      ...(questionData.matrixColumns || []),
      { key: `member_${nextIndex}`, label: `Thanh vien ${nextIndex}`, birth_year: null, relationship: "" },
    ];
    setQuestionData((prev) => ({ ...prev, matrixColumns: nextColumns }));
  };

  const updateMatrixColumn = (index, patch) => {
    const nextColumns = (questionData.matrixColumns || []).map((col, idx) => {
      if (idx !== index) return col;
      const nextCol = { ...col, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "label") && (!nextCol.key || nextCol.key.startsWith("member_"))) {
        const generated = slugifyMatrixKey(nextCol.label);
        if (generated) nextCol.key = generated;
      }
      return nextCol;
    });
    setQuestionData((prev) => ({ ...prev, matrixColumns: nextColumns }));
  };

  const removeMatrixColumn = (index) => {
    const nextColumns = (questionData.matrixColumns || []).filter((_, idx) => idx !== index);
    setQuestionData((prev) => ({ ...prev, matrixColumns: nextColumns }));
  };

  const toggleQuestionSelect = (questionId, checked) => {
    setSelectedQuestionIds((prev) => {
      if (checked) {
        return prev.includes(questionId) ? prev : [...prev, questionId];
      }
      return prev.filter((id) => id !== questionId);
    });
  };

  const clearSelectedQuestions = () => {
    setSelectedQuestionIds([]);
    setBulkGroupConfig((prev) => ({
      ...prev,
      rootQuestionId: "",
    }));
  };

  const applyBulkGroupConfig = async () => {
    if (selectedQuestionIds.length === 0) {
      setMessageDialog({
        open: true,
        title: "Chưa chọn câu hỏi",
        description: "Hãy chọn ít nhất 1 câu hỏi để gán Group ID.",
      });
      return;
    }

    const fallbackGroupId = `grp_${Date.now()}`;
    const sanitizedDisplayCondition = sanitizeDisplayCondition(questionData.displayCondition || "");
    // Parse rootQuestionId as UUID or null
    let rootId = null;
    if (bulkGroupConfig.rootQuestionId && bulkGroupConfig.rootQuestionId.trim()) {
      rootId = bulkGroupConfig.rootQuestionId.trim();
    } else {
      rootId = selectedQuestionIds[0];
    }

    // Handle maxRepeat - be careful with falsy values like 0
    let maxRepeatValue = null;
    if (bulkGroupConfig.maxRepeat !== "" && bulkGroupConfig.maxRepeat !== null && bulkGroupConfig.maxRepeat !== undefined) {
      const parsed = Number(bulkGroupConfig.maxRepeat);
      if (!isNaN(parsed) && parsed > 0) {
        maxRepeatValue = parsed;
      }
    } else {
      // Default to 3 if not specified
      maxRepeatValue = 3;
    }

    const payload = {
      questionIds: selectedQuestionIds,
      groupId: bulkGroupConfig.groupId?.trim() || fallbackGroupId,
      rootQuestionId: rootId,
      displayCondition: sanitizedDisplayCondition || null,
      labelAddButton: bulkGroupConfig.labelAddButton?.trim() || "Thêm mục khác",
    };

    console.log("Bulk group config payload:", payload); // Debug log

    try {
      const response = await api.put("/api/forms/admin/questions/group-config", payload);
      await loadFormData();
      clearSelectedQuestions();
      setMessageDialog({
        open: true,
        title: "Đã gán group thành công",
        description: `Đã cập nhật ${response.data?.updatedCount || selectedQuestionIds.length} câu hỏi vào group ${payload.groupId}`,
      });
    } catch (error) {
      setMessageDialog({
        open: true,
        title: "Không thể gán group",
        description: error?.response?.data?.message || "Lỗi khi gán group hàng loạt.",
      });
    }
  };

  const handleSectionChange = (e) => {
    const { name, value } = e.target;
    setSectionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionData((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "isRepeatableGroup" && checked && !next.groupId) {
        next.groupId = buildDefaultGroupId(next.questionCode, next.questionText);
      }

      if (name === "questionCode" && next.isRepeatableGroup && !prev.groupId) {
        next.groupId = buildDefaultGroupId(value, next.questionText);
      }

      return next;
    });
  };

  const slugify = (input) => {
    return (input || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase();
  };

  const buildDefaultGroupId = (questionCode, questionText) => {
    const codePart = slugify(questionCode);
    if (codePart) {
      return `grp_${codePart}`;
    }

    const textPart = slugify(questionText);
    if (textPart) {
      return `grp_${textPart.substring(0, 24)}`;
    }

    return `grp_${Date.now()}`;
  };

  const buildOptionPayload = () => {
    const lines = parseOptionLines(questionData.options);

    let normalizedSubFieldsConfig = null;
    if (SUB_FIELDS_QUESTION_TYPES.includes(questionData.questionType)) {
      try {
        const parsed = sanitizeSubFieldRows(parseSubFieldsConfig(questionData.subFieldsConfig || "[]"));
        normalizedSubFieldsConfig = parsed.length > 0 ? stringifySubFieldsConfig(parsed) : null;
      } catch (error) {
        normalizedSubFieldsConfig = questionData.subFieldsConfig || null;
      }
    }

    return lines.map((text, index) => ({
      optionText: text,
      optionValue: text,
      optionOrder: index + 1,
      subFieldsConfig:
        SUB_FIELDS_QUESTION_TYPES.includes(questionData.questionType)
          ? normalizedSubFieldsConfig
          : null,
    }));
  };

  const updateOptionList = (nextOptions) => {
    setQuestionData((prev) => ({
      ...prev,
      options: stringifyOptionLines(nextOptions),
    }));
  };

  const addChoiceOption = () => {
    const normalized = optionDraft.trim();
    if (!normalized) return;

    const currentOptions = parseOptionLines(questionData.options);
    updateOptionList([...currentOptions, normalized]);
    setOptionDraft("");
  };

  const removeChoiceOption = (index) => {
    const currentOptions = parseOptionLines(questionData.options);
    updateOptionList(currentOptions.filter((_, idx) => idx !== index));
  };

  const updateChoiceOption = (index, value) => {
    const currentOptions = parseOptionLines(questionData.options);
    const next = currentOptions.map((item, idx) => (idx === index ? value : item));
    updateOptionList(next);
  };

  const handleChoiceOptionDraftKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addChoiceOption();
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
      subFieldsConfig: "",
      matrixRows: [],
      matrixColumns: [],
      matrixAllowAdditionalColumn: true,
      matrixAllowAdditionalRow: true,
      required: true,
      allowAdditionalAnswers: false,
      maxAdditionalAnswers: "",
      groupId: "",
      isRepeatableGroup: false,
      repeatGroupRoot: false,
      maxRepeat: "",
      labelAddButton: "",
      questionOrder: 1,
      helpText: "",
      displayCondition: "",
    });
    setSubFieldRows([]);
    setOptionDraft("");
    setConditionalRules([]);
    setScoringRules("");
    setEditingQuestion(null);
    setActiveSectionId("");
  };

  const resetSectionForm = () => {
    setSectionData({
      sectionName: "",
      sectionOrder: 1,
    });
    setEditingSection(null);
  };

  const handleSubmitSection = async (e) => {
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
      const payload = {
        sectionName: sectionData.sectionName,
        sectionOrder: Number(sectionData.sectionOrder) || 1,
      };

      if (editingSection) {
        await api.put(`/api/forms/admin/sections/${editingSection.sectionId}`, payload);
      } else {
        await api.post(`/api/forms/admin/${formId}/sections`, payload);
      }

      resetSectionForm();
      setShowSectionForm(false);
      await loadFormData();
      setMessageDialog({
        open: true,
        title: "Thành công",
        description: editingSection ? "Thông tin nhóm câu hỏi đã được cập nhật." : "Nhóm câu hỏi đã được tạo.",
      });
    } catch (error) {
      console.error("Error saving section:", error);
      setMessageDialog({
        open: true,
        title: editingSection ? "Không thể cập nhật" : "Không thể tạo",
        description: editingSection ? "Lỗi khi cập nhật nhóm câu hỏi." : "Lỗi khi tạo nhóm câu hỏi.",
      });
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionData({
      sectionName: section.sectionName || "",
      sectionOrder: section.sectionOrder || 1,
    });
    setShowSectionForm(true);
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

    if (questionData.isRepeatableGroup && !questionData.groupId?.trim()) {
      setMessageDialog({
        open: true,
        title: "Thiếu Group ID",
        description: "Vui lòng nhập Group ID hoặc bấm nút tạo tự động.",
      });
      return;
    }

    if (SUB_FIELDS_QUESTION_TYPES.includes(questionData.questionType) && !subFieldsConfigState.valid) {
      setMessageDialog({
        open: true,
        title: "Sub-fields config chua hop le",
        description: subFieldsConfigState.message,
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
      allowAdditionalAnswers: Boolean(questionData.allowAdditionalAnswers),
      maxAdditionalAnswers: questionData.allowAdditionalAnswers
        ? (questionData.maxAdditionalAnswers === "" ? null : Number(questionData.maxAdditionalAnswers))
        : null,
      groupId: questionData.groupId?.trim() || null,
      isRepeatableGroup: Boolean(questionData.isRepeatableGroup),
      repeatGroupRoot: Boolean(questionData.isRepeatableGroup && questionData.repeatGroupRoot),
      maxRepeat: questionData.isRepeatableGroup
        ? (questionData.maxRepeat === "" ? null : Number(questionData.maxRepeat))
        : null,
      labelAddButton: questionData.isRepeatableGroup
        ? (questionData.labelAddButton?.trim() || null)
        : null,
      helpText: questionData.helpText || null,
      displayCondition: questionData.displayCondition || null,
      matrixConfig:
        questionData.questionType === "MATRIX_FAMILY_DISEASE"
          ? {
              // This matrix type is always user-driven at runtime.
              rows: [],
              columns: [],
              allowAdditionalColumn: true,
              allowAdditionalRow: true,
            }
          : null,
      options:
        questionData.questionType === "SINGLE_CHOICE" ||
        questionData.questionType === "MULTIPLE_CHOICE" ||
        questionData.questionType === "SELECT_DROPDOWN" ||
        SUB_FIELDS_QUESTION_TYPES.includes(questionData.questionType)
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
      const backendMessage = error?.response?.data?.message;
      setMessageDialog({
        open: true,
        title: "Không thể lưu",
        description: backendMessage || "Lỗi khi lưu câu hỏi.",
      });
    }
  };

  const handleEditQuestion = (sectionId, question) => {
    setEditingQuestion(question);
    setActiveSectionId(sectionId);
    
    // Parse displayCondition JSON to array
    let parsedRules = [];
    if (question.displayCondition) {
      try {
        parsedRules = JSON.parse(question.displayCondition);
        if (!Array.isArray(parsedRules)) parsedRules = [];
      } catch (e) {
        console.warn("Could not parse displayCondition JSON:", e);
        parsedRules = [];
      }
    }
    setConditionalRules(parsedRules);
    
    // TODO: Parse scoring rules if stored in metadata
    setScoringRules("");
    
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
      subFieldsConfig: question.optionItems?.[0]?.subFieldsConfig || "",
      matrixRows: question.matrixConfig?.rows || [],
      matrixColumns: question.matrixConfig?.columns || [],
      matrixAllowAdditionalColumn: question.matrixConfig?.allowAdditionalColumn !== false,
      matrixAllowAdditionalRow: question.matrixConfig?.allowAdditionalRow !== false,
      required: question.required !== false,
      allowAdditionalAnswers: question.allowAdditionalAnswers === true,
      maxAdditionalAnswers: question.maxAdditionalAnswers ?? "",
      groupId: question.groupId || "",
      isRepeatableGroup: question.isRepeatableGroup === true,
      repeatGroupRoot: question.repeatGroupRoot === true,
      maxRepeat: question.maxRepeat ?? "",
      labelAddButton: question.labelAddButton || "",
      questionOrder: question.questionOrder || 1,
      helpText: question.helpText || "",
      displayCondition: question.displayCondition || "",
    });
    setOptionDraft("");
    setShowQuestionForm(true);
  };

  useEffect(() => {
    if (!sections.length) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const focusCodeRaw = params.get("focusCode");
    const focusCode = (focusCodeRaw || "").trim().toUpperCase();

    if (!focusCode) {
      return;
    }

    let matchedSectionId = null;
    let matchedQuestion = null;

    for (const section of sections) {
      const found = (section.questions || []).find(
        (q) => (q.questionCode || "").trim().toUpperCase() === focusCode
      );
      if (found) {
        matchedSectionId = section.sectionId;
        matchedQuestion = found;
        break;
      }
    }

    if (!matchedQuestion) {
      setMessageDialog({
        open: true,
        title: "Không tìm thấy câu hỏi",
        description: `Không tìm thấy question code '${focusCodeRaw}' trong biểu mẫu này.`,
      });
      return;
    }

    setHighlightQuestionId(matchedQuestion.questionId);
    setTimeout(() => {
      const el = document.getElementById(`question-${matchedQuestion.questionId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 0);

    handleEditQuestion(matchedSectionId, matchedQuestion);

    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("focusCode");
    navigate(
      {
        pathname: location.pathname,
        search: nextParams.toString() ? `?${nextParams.toString()}` : "",
      },
      { replace: true }
    );
  }, [sections, location.search, location.pathname, navigate]);

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

      {selectedQuestionIds.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-emerald-800">
              Gán Repeat Group hàng loạt ({selectedQuestionIds.length} câu hỏi)
            </h3>
            <button
              type="button"
              onClick={clearSelectedQuestions}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Bỏ chọn tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="text"
              value={bulkGroupConfig.groupId}
              onChange={(e) => setBulkGroupConfig((prev) => ({ ...prev, groupId: e.target.value }))}
              placeholder="Group ID (vd: cancer_history)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="number"
              min="1"
              value={bulkGroupConfig.maxRepeat}
              onChange={(e) => setBulkGroupConfig((prev) => ({ ...prev, maxRepeat: e.target.value }))}
              placeholder="max_repeat"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              value={bulkGroupConfig.labelAddButton}
              onChange={(e) => setBulkGroupConfig((prev) => ({ ...prev, labelAddButton: e.target.value }))}
              placeholder="Label nút thêm"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <select
              value={bulkGroupConfig.rootQuestionId}
              onChange={(e) => setBulkGroupConfig((prev) => ({ ...prev, rootQuestionId: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Root question (mặc định câu đầu)</option>
              {selectedQuestions.map((question) => (
                <option key={question.questionId} value={question.questionId}>
                  {question.questionCode || question.questionId} - {question.questionText?.slice(0, 40)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={applyBulkGroupConfig}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Áp dụng cho câu đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sections.map((s) => s.sectionId)} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {sections.length > 0 ? (
              sections.map((section) => (
                <SortableSection
                  key={section.sectionId}
                  section={section}
                  onEditSection={() => handleEditSection(section)}
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
                              highlighted={highlightQuestionId === question.questionId}
                              onEdit={() => handleEditQuestion(section.sectionId, question)}
                              onDelete={() => handleDeleteQuestion(question.questionId)}
                              selected={selectedQuestionIds.includes(question.questionId)}
                              onToggleSelect={toggleQuestionSelect}
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
          editingMode={Boolean(editingSection)}
        >
          <form onSubmit={handleSubmitSection} className="space-y-5">
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
                {editingSection ? "💾 Cập nhật nhóm" : "💾 Lưu nhóm"}
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
                  <option value="SINGLE_CHOICE_WITH_SUBFIELDS">Chọn 1 + trường phụ</option>
                  <option value="MULTIPLE_CHOICE_WITH_SUBFIELDS">Chọn nhiều + trường phụ</option>
                  <option value="MATRIX_FAMILY_DISEASE">Ma tran benh su gia dinh</option>
                  <option value="SELECT_DROPDOWN">Dropdown</option>
                  <option value="DATE">Ngày tháng</option>
                  <option value="BOOLEAN">Có/Không</option>
                  <option value="IMAGE_UPLOAD">Tải ảnh</option>
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
              questionData.questionType === "SELECT_DROPDOWN" ||
              SUB_FIELDS_QUESTION_TYPES.includes(questionData.questionType)) && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Các lựa chọn
                </label>
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={optionDraft}
                      onChange={(e) => setOptionDraft(e.target.value)}
                      onKeyDown={handleChoiceOptionDraftKeyDown}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Nhập lựa chọn rồi bấm Enter"
                    />
                    <button
                      type="button"
                      onClick={addChoiceOption}
                      className="px-3 py-2 text-sm rounded-lg border border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100"
                    >
                      + Thêm
                    </button>
                  </div>

                  {parseOptionLines(questionData.options).length === 0 ? (
                    <p className="text-xs text-slate-500">Chưa có lựa chọn.</p>
                  ) : (
                    <div className="space-y-2">
                      {parseOptionLines(questionData.options).map((option, index) => (
                        <div key={`option-${index}`} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateChoiceOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeChoiceOption(index)}
                            className="px-3 py-2 text-xs rounded border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label htmlFor="options" className="block text-xs font-semibold text-slate-600 mb-1">
                      Nhập nhanh nhiều dòng (tuỳ chọn)
                    </label>
                    <textarea
                      id="options"
                      name="options"
                      value={questionData.options}
                      onChange={handleQuestionChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      placeholder="Lựa chọn A&#10;Lựa chọn B&#10;Lựa chọn C"
                    />
                  </div>
                </div>
              </div>
            )}

            {SUB_FIELDS_QUESTION_TYPES.includes(questionData.questionType) && (
              <div>
                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                  <label className="block text-sm font-semibold text-slate-700">
                    Cau hinh truong phu
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSubFieldsJson((prev) => !prev)}
                    className="px-3 py-1.5 text-xs rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                  >
                    {showAdvancedSubFieldsJson ? "An JSON nang cao" : "Mo JSON nang cao"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {SUB_FIELDS_CONFIG_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applySubFieldsTemplate(template.id)}
                      className="px-3 py-1.5 text-xs rounded-full border border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100"
                      title={template.description}
                    >
                      Dung mau: {template.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={addSubFieldRow}
                    className="px-3 py-1.5 text-xs rounded-full border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100"
                  >
                    + Them truong phu
                  </button>
                </div>

                {subFieldRows.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600">
                    Chua co truong phu. Bam "Them truong phu" hoac dung mau de tao nhanh.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subFieldRows.map((field, index) => (
                      <div key={field.uiId} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Nhan hien thi</label>
                            <input
                              type="text"
                              value={field.label || ""}
                              onChange={(e) => updateSubFieldRow(index, { label: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="Vi du: Nam tiem"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Ma truong (key)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={field.key || ""}
                                onChange={(e) => updateSubFieldRow(index, { key: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="year"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const generated = slugifySubFieldKey(field.label);
                                  if (generated) {
                                    updateSubFieldRow(index, { key: generated });
                                  }
                                }}
                                className="px-2 py-2 text-xs rounded border border-slate-300 bg-white hover:bg-slate-100"
                                title="Tao key tu nhan"
                              >
                                Tu dong
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Loai du lieu</label>
                            <select
                              value={field.type || "TEXT"}
                              onChange={(e) => updateSubFieldRow(index, { type: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {SUB_FIELD_TYPE_OPTIONS.map((typeOption) => (
                                <option key={typeOption.value} value={typeOption.value}>{typeOption.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Placeholder (tuy chon)</label>
                            <input
                              type="text"
                              value={field.placeholder || ""}
                              onChange={(e) => updateSubFieldRow(index, { placeholder: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="Goi y cho nguoi nhap"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">So dong textarea</label>
                            <input
                              type="number"
                              min="1"
                              value={field.rows || ""}
                              onChange={(e) => {
                                const nextRows = e.target.value === "" ? undefined : Number(e.target.value);
                                updateSubFieldRow(index, { rows: nextRows });
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                              disabled={field.type !== "TEXT" && field.type !== "TEXTAREA"}
                            />
                          </div>
                        </div>

                        {(field.type === "SELECT" || field.type === "SINGLE_CHOICE" || field.type === "MULTIPLE_CHOICE") && (
                          <div className="mt-3">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Danh sach lua chon (moi dong 1 gia tri)
                            </label>
                            <textarea
                              rows="3"
                              value={(field.options || []).map((opt) => opt?.value || opt?.label || "").filter(Boolean).join("\n")}
                              onChange={(e) => updateSelectOptions(index, e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                              placeholder="PCV13&#10;PPSV23"
                            />
                          </div>
                        )}

                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeSubFieldRow(index)}
                            className="px-3 py-1.5 text-xs rounded-md border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
                          >
                            Xoa truong nay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAdvancedSubFieldsJson && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={formatSubFieldsConfig}
                        className="px-3 py-1.5 text-xs rounded-full border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100"
                      >
                        Format JSON
                      </button>
                    </div>
                    <textarea
                      id="subFieldsConfig"
                      name="subFieldsConfig"
                      value={questionData.subFieldsConfig}
                      onChange={handleQuestionChange}
                      rows="8"
                      placeholder='[{"key":"year","label":"Nam tiem","type":"NUMBER"}]'
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                    />
                  </div>
                )}

                <div className={`mt-2 text-sm ${subFieldsConfigState.valid ? "text-emerald-700" : "text-rose-700"}`}>
                  {subFieldsConfigState.valid ? "JSON hop le" : subFieldsConfigState.message}
                </div>

                {subFieldsConfigState.valid && subFieldsConfigState.fields.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Preview cho bac si</p>
                    <div className="space-y-2">
                      {subFieldsConfigState.fields.map((field) => (
                        <div key={field.key} className="text-sm text-slate-700">
                          <span className="font-semibold">{field.label}</span>
                          <span className="text-slate-500"> ({field.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {questionData.questionType === "MATRIX_FAMILY_DISEASE" && (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-700">Cau hinh matrix benh su gia dinh</h4>
                </div>

                <p className="text-xs text-slate-600">
                  Loai cau hoi nay mac dinh de nguoi dung tu nhap danh sach benh va thanh vien gia dinh khi dien form. Admin khong can cau hinh san cot/hang.
                </p>
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

            {/* Conditional Rules Builder */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">Dieu kien hien thi</p>
                <button
                  type="button"
                  onClick={() => {
                    setConditionalRules([]);
                    setQuestionData((prev) => ({
                      ...prev,
                      displayCondition: "",
                    }));
                    setMessageDialog({
                      open: true,
                      title: "Da xoa dieu kien",
                      description: "Tat ca dieu kien hien thi cua cau hoi nay da duoc xoa. Bam Cap nhat de luu.",
                    });
                  }}
                  className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Xoa tat ca dieu kien
                </button>
              </div>
              <ConditionalRuleBuilder
                questions={sections.flatMap(s => s.questions || [])}
                value={conditionalRules}
                onChange={(rules) => {
                  setConditionalRules(rules);
                  // Update questionData.displayCondition with JSON string
                  setQuestionData(prev => ({
                    ...prev,
                    displayCondition: rules.length > 0 ? JSON.stringify(rules) : ""
                  }));
                }}
              />
            </div>
            
            {/* Scoring Rules for this question */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <ScoringRulesEditor
                value={scoringRules}
                onChange={(rules) => {
                  setScoringRules(rules);
                  // TODO: Save to question metadata or separate field
                }}
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

            <div className="space-y-3 bg-violet-50 p-4 rounded-lg border border-violet-100">
              <div className="flex items-center gap-3">
                <input
                  id="allowAdditionalAnswers"
                  type="checkbox"
                  name="allowAdditionalAnswers"
                  checked={questionData.allowAdditionalAnswers}
                  onChange={handleQuestionChange}
                  className="w-5 h-5 text-violet-600 border-slate-300 rounded focus:ring-2 focus:ring-violet-500"
                />
                <label htmlFor="allowAdditionalAnswers" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  Hiển thị nút "Trả lời thêm"
                </label>
              </div>

              {questionData.allowAdditionalAnswers && (
                <div>
                  <label htmlFor="maxAdditionalAnswers" className="block text-sm font-semibold text-slate-700 mb-2">
                    Số câu trả lời thêm tối đa (để trống = không giới hạn)
                  </label>
                  <input
                    id="maxAdditionalAnswers"
                    type="number"
                    name="maxAdditionalAnswers"
                    value={questionData.maxAdditionalAnswers}
                    onChange={handleQuestionChange}
                    min="1"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Ví dụ: 5"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div>
                <label htmlFor="groupId" className="block text-sm font-semibold text-slate-700 mb-2">
                  Group ID (repeat group)
                </label>
                <div className="flex gap-2">
                  <input
                    id="groupId"
                    type="text"
                    name="groupId"
                    value={questionData.groupId}
                    onChange={handleQuestionChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Ví dụ: cancer_history"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionData((prev) => ({
                        ...prev,
                        groupId: buildDefaultGroupId(prev.questionCode, prev.questionText),
                      }));
                    }}
                    className="px-3 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-sm font-semibold"
                  >
                    Tạo ID
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Các câu hỏi cùng Group ID sẽ được lặp cùng nhau.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="isRepeatableGroup"
                  type="checkbox"
                  name="isRepeatableGroup"
                  checked={questionData.isRepeatableGroup}
                  onChange={handleQuestionChange}
                  className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <label htmlFor="isRepeatableGroup" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  Bật Repeatable Group
                </label>
              </div>

              {questionData.isRepeatableGroup && (
                <>
                  <div className="flex items-center gap-3">
                    <input
                      id="repeatGroupRoot"
                      type="checkbox"
                      name="repeatGroupRoot"
                      checked={questionData.repeatGroupRoot}
                      onChange={handleQuestionChange}
                      className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <label htmlFor="repeatGroupRoot" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                      Là câu root của group
                    </label>
                  </div>

                  <div>
                    <label htmlFor="maxRepeat" className="block text-sm font-semibold text-slate-700 mb-2">
                      max_repeat (để trống = không giới hạn)
                    </label>
                    <input
                      id="maxRepeat"
                      type="number"
                      name="maxRepeat"
                      value={questionData.maxRepeat}
                      onChange={handleQuestionChange}
                      min="1"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Ví dụ: 5"
                    />
                  </div>

                  <div>
                    <label htmlFor="labelAddButton" className="block text-sm font-semibold text-slate-700 mb-2">
                      Label nút thêm
                    </label>
                    <input
                      id="labelAddButton"
                      type="text"
                      name="labelAddButton"
                      value={questionData.labelAddButton}
                      onChange={handleQuestionChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Ví dụ: Thêm bệnh ung thư khác"
                    />
                  </div>
                </>
              )}
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
