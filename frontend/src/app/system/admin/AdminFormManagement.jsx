import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2 } from "lucide-react";
import api from "../../../service/api";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import AdminSearchBar from "../../../components/admin/AdminSearchBar";
import AdminTable from "../../../components/admin/AdminTable";
import StatusFilter from "../../../components/admin/StatusFilter";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { showSuccess, showError } from "../../../utils/toastNotifications";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import TwoColumnFormLayout from "../../../components/form/TwoColumnFormLayout";
import { generateMasterForm, setMasterFormLock } from "../../../api/formsApi";

const PAGE_SIZE = 9;
const PREDEFINED_CATEGORIES = [
  'ENDOCRINOLOGY',
  'CARDIOLOGY',
  'GENERAL',
  'RESPIRATORY',
  'NEUROLOGY',
  'GASTROENTEROLOGY',
  'ORTHOPEDICS',
  'DERMATOLOGY',
  'OBSTETRICS',
  'PEDIATRICS'
];

const EMPTY_FORM_DATA = {
  formName: "",
  description: "",
  category: "",
  customCategory: "",
  status: "DRAFT",
  isPublic: false,
  publicToken: null,
};
const EMPTY_CONFIRM_DIALOG = {
  open: false,
  title: "",
  description: "",
  onConfirm: null,
};

const initialState = {
  forms: [],
  loading: true,
  showForm: false,
  editingForm: null,
  formData: EMPTY_FORM_DATA,
  confirmDialog: EMPTY_CONFIRM_DIALOG,
};

const actions = {
  LOAD_SUCCESS: "LOAD_SUCCESS",
  LOAD_FINISH: "LOAD_FINISH",
  OPEN_FORM_CREATE: "OPEN_FORM_CREATE",
  OPEN_FORM_EDIT: "OPEN_FORM_EDIT",
  CLOSE_FORM: "CLOSE_FORM",
  UPDATE_FORM_FIELD: "UPDATE_FORM_FIELD",
  OPEN_CONFIRM: "OPEN_CONFIRM",
  CLOSE_CONFIRM: "CLOSE_CONFIRM",
};

function reducer(state, action) {
  switch (action.type) {
    case actions.LOAD_SUCCESS:
      return { ...state, forms: action.payload || [] };
    case actions.LOAD_FINISH:
      return { ...state, loading: false };
    case actions.OPEN_FORM_CREATE:
      return {
        ...state,
        showForm: true,
        editingForm: null,
        formData: EMPTY_FORM_DATA,
      };
    case actions.OPEN_FORM_EDIT: {
      const isCustomCategory = !PREDEFINED_CATEGORIES.includes(action.payload.category);
      return {
        ...state,
        showForm: true,
        editingForm: action.payload,
        formData: {
          formName: action.payload.formName,
          description: action.payload.description,
          category: isCustomCategory ? 'OTHER' : action.payload.category,
          customCategory: isCustomCategory ? action.payload.category : '',
          status: action.payload.status || "DRAFT",
          isPublic: Boolean(action.payload.isPublic),
          publicToken: action.payload.publicToken || null,
        },
      };
    }
    case actions.CLOSE_FORM:
      return {
        ...state,
        showForm: false,
        editingForm: null,
        formData: EMPTY_FORM_DATA,
      };
    case actions.UPDATE_FORM_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.name]: action.payload.value,
        },
      };
    case actions.OPEN_CONFIRM:
      return { ...state, confirmDialog: action.payload };
    case actions.CLOSE_CONFIRM:
      return { ...state, confirmDialog: EMPTY_CONFIRM_DIALOG };
    default:
      return state;
  }
}

const FormModalSection = ({
  show,
  editingForm,
  formData,
  onInputChange,
  onCancel,
  onSubmit,
  onSubmitPublishPublic,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">
          {editingForm ? "✏️ Chỉnh sửa Biểu mẫu" : "➕ Tạo Biểu mẫu Mới"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-1">
              Tên Biểu mẫu *
            </label>
            <input
              id="formName"
              type="text"
              name="formName"
              value={formData.formName}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Tiểu Đường Screening"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả biểu mẫu..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              <option value="ENDOCRINOLOGY">🩺 Nội tiết</option>
              <option value="CARDIOLOGY">❤️ Tim mạch</option>
              <option value="GENERAL">📋 Tổng quát</option>
              <option value="RESPIRATORY">🫁 Hô hấp</option>
              <option value="NEUROLOGY">🧠 Thần kinh</option>
              <option value="GASTROENTEROLOGY">🫃 Tiêu hóa</option>
              <option value="ORTHOPEDICS">🦴 Cơ xương khớp</option>
              <option value="DERMATOLOGY">🧴 Da liễu</option>
              <option value="OBSTETRICS">🤰 Sản khoa</option>
              <option value="PEDIATRICS">👶 Nhi khoa</option>
              <option value="OTHER">✏️ Khác (Tự nhập)</option>
            </select>
            
            {/* Custom Category Input */}
            {formData.category === 'OTHER' && (
              <div className="mt-3">
                <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập danh mục tùy chỉnh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customCategory"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={onInputChange}
                  placeholder="Ví dụ: Chuyên khoa Tai-Mũi-Họng"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Danh mục này sẽ được lưu vào database và có thể chọn lại sau
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label htmlFor="isPublic" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                id="isPublic"
                type="checkbox"
                name="isPublic"
                checked={Boolean(formData.isPublic)}
                onChange={onInputChange}
                className="h-4 w-4"
              />
              Public biểu mẫu này
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Khi bật, form có thể xuất hiện ở trang public nếu đang ở trạng thái publish.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSubmitPublishPublic}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              🚀 Publish + Public
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {editingForm ? "💾 Cập nhật" : "💾 Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminFormManagement = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [masterFormMeta, setMasterFormMeta] = useState(null);
  const [masterActionLoading, setMasterActionLoading] = useState(false);

  const loadForms = async () => {
    try {
      const response = await api.get("/api/forms/admin/all");
      dispatch({ type: actions.LOAD_SUCCESS, payload: response.data || [] });
    } catch (error) {
      console.error("Error loading forms:", error);
      showError("Không thể tải danh sách biểu mẫu");
    } finally {
      dispatch({ type: actions.LOAD_FINISH });
    }
  };

  const loadMasterMeta = async () => {
    try {
      const response = await api.get("/api/admin/master-form");
      setMasterFormMeta(response.data || null);
    } catch {
      setMasterFormMeta(null);
    }
  };

  useEffect(() => {
    loadForms();
    loadMasterMeta();
  }, []);

  const handleGenerateMasterForm = async () => {
    setMasterActionLoading(true);
    try {
      await generateMasterForm();
      showSuccess("Đã tạo/tái tạo Master Form thành công");
      await Promise.all([loadForms(), loadMasterMeta()]);
    } catch (error) {
      console.error("Error generating master form:", error);
      showError(error?.response?.data?.message || "Không thể tạo Master Form");
    } finally {
      setMasterActionLoading(false);
    }
  };

  const handleToggleMasterLock = async () => {
    if (!masterFormMeta) {
      showError("Chưa có Master Form. Hãy tạo trước.");
      return;
    }

    setMasterActionLoading(true);
    try {
      await setMasterFormLock(!masterFormMeta.masterLocked);
      showSuccess(masterFormMeta.masterLocked ? "Đã mở khóa Master Form" : "Đã khóa Master Form");
      await loadMasterMeta();
    } catch (error) {
      console.error("Error toggling master lock:", error);
      showError(error?.response?.data?.message || "Không thể cập nhật trạng thái khóa Master Form");
    } finally {
      setMasterActionLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    dispatch({
      type: actions.UPDATE_FORM_FIELD,
      payload: { name, value: type === "checkbox" ? checked : value },
    });
  };

  const closeForm = () => dispatch({ type: actions.CLOSE_FORM });

  const validateFormName = () => {
    if (state.formData.formName.trim()) {
      return true;
    }

    showError("Vui lòng nhập tên biểu mẫu.");
    return false;
  };

  const saveForm = async (payload) => {
    let finalPayload = { ...payload };
    if (payload.category === 'OTHER' && payload.customCategory) {
      finalPayload.category = payload.customCategory.trim();
    }

    delete finalPayload.customCategory;

    if (state.editingForm) {
      const response = await api.put(`/api/forms/admin/${state.editingForm.formId}`, finalPayload);
      return response.data;
    }

    const response = await api.post("/api/forms/admin/create", finalPayload);
    return response.data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateFormName()) {
      return;
    }

    try {
      await saveForm(state.formData);
      showSuccess(
        state.editingForm ? "Cập nhật thành công" : "Tạo thành công"
      );
      closeForm();
      await loadForms();
    } catch (error) {
      console.error("Error saving form:", error);
      showError("Lỗi khi lưu biểu mẫu");
    }
  };

  const handleSubmitPublishPublic = async () => {
    if (!validateFormName()) {
      return;
    }

    const payload = {
      ...state.formData,
      isPublic: true,
    };

    try {
      const saved = await saveForm(payload);
      const targetFormId = state.editingForm?.formId || saved?.formId;

      if (!targetFormId) {
        throw new Error("Không xác định được formId để publish");
      }

      await api.post(`/api/forms/${targetFormId}/publish`);
      showSuccess("Đã đồng bộ Doctor Form → Public Form thành công");
      closeForm();
      await loadForms();
    } catch (error) {
      console.error("Error save+publish form:", error);
      showError(error?.response?.data?.message || "Lỗi khi lưu và publish biểu mẫu");
    }
  };

  const handlePublishFromRow = async (formId) => {
    try {
      await api.post(`/api/forms/${formId}/publish`);
      showSuccess("Đã publish phiên bản mới ra Public");
      await loadForms();
    } catch (error) {
      console.error("Error publishing form:", error);
      showError(error?.response?.data?.message || "Không thể publish form");
    }
  };

  const handleDelete = (id) => {
    dispatch({
      type: actions.OPEN_CONFIRM,
      payload: {
        open: true,
        title: "Xóa biểu mẫu?",
        description: "Bạn có chắc muốn xóa biểu mẫu này?",
        onConfirm: async () => {
          try {
            await api.delete(`/api/forms/admin/${id}`);
            dispatch({ type: actions.CLOSE_CONFIRM });
            showSuccess("Biểu mẫu đã được xóa.");
            await loadForms();
          } catch (error) {
            console.error("Error deleting form:", error);
            dispatch({ type: actions.CLOSE_CONFIRM });
            showError("Lỗi khi xóa biểu mẫu. Vui lòng thử lại.");
          }
        },
      },
    });
  };

  const filteredForms = useMemo(() => {
    return state.forms.filter((form) => {
      const matchesSearch = form.formName
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || form.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [state.forms, searchText, statusFilter]);

  const tableColumns = [
    { key: "formName", label: "Tên biểu mẫu" },
    { key: "category", label: "Danh mục" },
    { key: "status", label: "Trạng thái" },
    { key: "questions", label: "Câu hỏi" },
    { key: "public", label: "Quyền truy cập" },
    { key: "actions", label: "Hành động" },
  ];

  const tableRows = filteredForms.map((form) => ({
    formId: form.formId,
    formName: form.formName,
    category: form.category || "-",
    status: (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          form.status === "PUBLISHED"
            ? "bg-emerald-100 text-emerald-700"
            : form.status === "DRAFT"
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {form.status}
      </span>
    ),
    questions: form.questionCount || 0,
    public: form.isPublic ? "Công khai" : "Riêng tư",
    actions: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/system/admin/forms/${form.formId}/questions`)}
        >
          Câu hỏi
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={Boolean(form.isMaster)}
          onClick={() => dispatch({ type: actions.OPEN_FORM_EDIT, payload: form })}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={Boolean(form.isMaster)}
          onClick={() => handlePublishFromRow(form.formId)}
        >
          Publish
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={Boolean(form.isMaster)}
          onClick={() => handleDelete(form.formId)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  }));

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay isLoading={state.loading} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Quản lý Biểu mẫu
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {filteredForms.length} biểu mẫu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={masterActionLoading}
            onClick={handleGenerateMasterForm}
          >
            Regenerate Master Form
          </Button>
          <Button
            variant="outline"
            disabled={masterActionLoading || !masterFormMeta}
            onClick={handleToggleMasterLock}
          >
            {masterFormMeta?.masterLocked ? "Unlock Master" : "Lock Master"}
          </Button>
          <Button
            onClick={() => dispatch({ type: actions.OPEN_FORM_CREATE })}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm biểu mẫu
          </Button>
        </div>
      </div>

      {masterFormMeta && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-semibold text-slate-800">Master Form: {masterFormMeta.formName}</p>
              <p className="text-slate-500">Version {masterFormMeta.version} • {masterFormMeta.formId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${masterFormMeta.masterLocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
              {masterFormMeta.masterLocked ? "LOCKED" : "UNLOCKED"}
            </span>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminSearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Tìm biểu mẫu..."
        />
        <StatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"]}
        />
      </div>

      {/* Table */}
      {filteredForms.length > 0 ? (
        <Card elevated>
          <AdminTable columns={tableColumns} rows={tableRows} />
        </Card>
      ) : (
        <Card elevated>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">📭 Chưa có biểu mẫu nào</p>
            <Button
              onClick={() => dispatch({ type: actions.OPEN_FORM_CREATE })}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Tạo biểu mẫu đầu tiên
            </Button>
          </div>
        </Card>
      )}

      {/* Form Modal */}
      <FormModalSection
        show={state.showForm}
        editingForm={state.editingForm}
        formData={state.formData}
        onInputChange={handleInputChange}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        onSubmitPublishPublic={handleSubmitPublishPublic}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={state.confirmDialog.open}
        title={state.confirmDialog.title}
        description={state.confirmDialog.description}
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
        onConfirm={state.confirmDialog.onConfirm}
        onClose={() => dispatch({ type: actions.CLOSE_CONFIRM })}
      />
    </div>
  );
};

export default AdminFormManagement;
