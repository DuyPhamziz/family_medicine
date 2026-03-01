import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Copy } from "lucide-react";
import api from "../../../service/api";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import MessageDialog from "../../../components/common/MessageDialog";
import AdminSearchBar from "../../../components/admin/AdminSearchBar";
import AdminTable from "../../../components/admin/AdminTable";
import StatusFilter from "../../../components/admin/StatusFilter";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import TwoColumnFormLayout from "../../../components/form/TwoColumnFormLayout";
import { showSuccess, showError } from "../../../utils/toastNotifications";

const PAGE_SIZE = 9;
const EMPTY_FORM_DATA = {
  formName: "",
  description: "",
  category: "",
  status: "DRAFT",
  isPublic: false,
  publicToken: null,
};
const EMPTY_MESSAGE_DIALOG = { open: false, title: "", description: "" };
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
  page: 1,
  openMenu: null,
  formData: EMPTY_FORM_DATA,
  confirmDialog: EMPTY_CONFIRM_DIALOG,
  messageDialog: EMPTY_MESSAGE_DIALOG,
};

const actions = {
  LOAD_SUCCESS: "LOAD_SUCCESS",
  LOAD_FINISH: "LOAD_FINISH",
  OPEN_FORM_CREATE: "OPEN_FORM_CREATE",
  OPEN_FORM_EDIT: "OPEN_FORM_EDIT",
  CLOSE_FORM: "CLOSE_FORM",
  UPDATE_FORM_FIELD: "UPDATE_FORM_FIELD",
  SET_PAGE: "SET_PAGE",
  TOGGLE_MENU: "TOGGLE_MENU",
  CLOSE_MENU: "CLOSE_MENU",
  OPEN_CONFIRM: "OPEN_CONFIRM",
  CLOSE_CONFIRM: "CLOSE_CONFIRM",
  OPEN_MESSAGE: "OPEN_MESSAGE",
  CLOSE_MESSAGE: "CLOSE_MESSAGE",
};

function reducer(state, action) {
  switch (action.type) {
    case actions.LOAD_SUCCESS:
      return { ...state, forms: action.payload || [], page: 1 };
    case actions.LOAD_FINISH:
      return { ...state, loading: false };
    case actions.OPEN_FORM_CREATE:
      return {
        ...state,
        showForm: true,
        editingForm: null,
        formData: EMPTY_FORM_DATA,
      };
    case actions.OPEN_FORM_EDIT:
      return {
        ...state,
        showForm: true,
        editingForm: action.payload,
        formData: {
          formName: action.payload.formName,
          description: action.payload.description,
          category: action.payload.category,
          status: action.payload.status || "DRAFT",
          isPublic: Boolean(action.payload.isPublic),
          publicToken: action.payload.publicToken || null,
        },
      };
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
    case actions.SET_PAGE:
      return { ...state, page: action.payload };
    case actions.TOGGLE_MENU:
      return {
        ...state,
        openMenu: state.openMenu === action.payload ? null : action.payload,
      };
    case actions.CLOSE_MENU:
      return { ...state, openMenu: null };
    case actions.OPEN_CONFIRM:
      return { ...state, confirmDialog: action.payload };
    case actions.CLOSE_CONFIRM:
      return { ...state, confirmDialog: EMPTY_CONFIRM_DIALOG };
    case actions.OPEN_MESSAGE:
      return {
        ...state,
        messageDialog: {
          open: true,
          title: action.payload.title,
          description: action.payload.description,
        },
      };
    case actions.CLOSE_MESSAGE:
      return { ...state, messageDialog: EMPTY_MESSAGE_DIALOG };
    default:
      return state;
  }
}

const ManagementHeader = ({ onCreate }) => (
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold text-gray-800">📋 Quản lý Biểu mẫu Chuẩn đoán</h1>
    <button
      type="button"
      onClick={onCreate}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
    >
      ➕ Tạo Biểu mẫu Mới
    </button>
  </div>
);

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
              Danh mục
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn danh mục</option>
              <option value="ENDOCRINOLOGY">🩺 Nội tiết</option>
              <option value="CARDIOLOGY">❤️ Tim mạch</option>
              <option value="GENERAL">📋 Tổng quát</option>
              <option value="RESPIRATORY">🫁 Hô hấp</option>
              <option value="NEUROLOGY">🧠 Thần kinh</option>
            </select>
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

const FormCard = ({
  form,
  isMenuOpen,
  onToggleMenu,
  onManageQuestions,
  onPublish,
  onTogglePublic,
  onCreateVersion,
  onEdit,
  onDelete,
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
    <h3 className="text-xl font-bold text-gray-800 mb-2">{form.formName}</h3>
    <p className="text-gray-600 text-sm mb-3">{form.description}</p>

    <div className="mb-4">
      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        {form.category}
      </span>
      <span
        className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
          form.isPublic
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {form.isPublic ? "🌐 Public" : "🔒 Private"}
      </span>
    </div>

    <div className="text-sm text-gray-500 mb-4">
      📚 {form.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0} câu hỏi
      <span className="ml-2 text-xs text-slate-400">v{form.version || 1}</span>
    </div>

    <div className="flex gap-2 relative">
      <button
        type="button"
        onClick={onManageQuestions}
        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
      >
        ❓ Quản lý Câu hỏi
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={onToggleMenu}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
        >
          ⋮ Thêm
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
            <button
              type="button"
              onClick={onPublish}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 border-b"
            >
              🚀 Publish + Public
            </button>
            <button
              type="button"
              onClick={onCreateVersion}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 border-b"
            >
              🧬 Tạo phiên bản
            </button>
            <button
              type="button"
              onClick={onTogglePublic}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 border-b"
            >
              {form.isPublic ? "🔒 Chuyển Private" : "🌐 Chuyển Public"}
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              ✏️ Sửa
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
      >
        🗑️
      </button>
    </div>
  </div>
);

const AdminFormManagement = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  const openMessage = (title, description) => {
    dispatch({ type: actions.OPEN_MESSAGE, payload: { title, description } });
  };

  const loadForms = async () => {
    try {
      const response = await api.get("/api/forms/admin/all");
      dispatch({ type: actions.LOAD_SUCCESS, payload: response.data || [] });
    } catch (error) {
      console.error("Error loading forms:", error);
      openMessage("Không thể tải", "Lỗi khi tải danh sách biểu mẫu.");
    } finally {
      dispatch({ type: actions.LOAD_FINISH });
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

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

    openMessage("Thiếu thông tin", "Vui lòng nhập tên biểu mẫu.");
    return false;
  };

  const saveForm = async (payload) => {
    if (state.editingForm) {
      await api.put(`/api/forms/admin/${state.editingForm.formId}`, payload);
      return;
    }
    await api.post("/api/forms/admin/create", payload);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateFormName()) {
      return;
    }

    try {
      await saveForm(state.formData);
      openMessage(
        state.editingForm ? "Cập nhật thành công" : "Tạo thành công",
        state.editingForm
          ? "Biểu mẫu đã được cập nhật."
          : "Biểu mẫu mới đã được tạo."
      );
      closeForm();
      await loadForms();
    } catch (error) {
      console.error("Error saving form:", error);
      openMessage("Không thể lưu", "Lỗi khi lưu biểu mẫu. Vui lòng thử lại.");
    }
  };

  const handlePublishPublic = async (form) => {
    try {
      await api.put(`/api/forms/admin/${form.formId}`, {
        formName: form.formName,
        description: form.description,
        category: form.category,
        estimatedTime: form.estimatedTime,
        iconColor: form.iconColor,
        status: "PUBLISHED",
        isPublic: true,
        publicToken: form.publicToken,
      });
      openMessage(
        "Đã Publish + Public",
        "Biểu mẫu đã được publish và hiển thị ngoài homepage."
      );
      await loadForms();
    } catch (error) {
      console.error("Error publishing public form:", error);
      openMessage(
        "Không thể Publish",
        "Lỗi khi publish biểu mẫu public. Vui lòng thử lại."
      );
    }
  };

  const handleTogglePublic = async (form) => {
    const nextIsPublic = !Boolean(form.isPublic);

    try {
      await api.put(`/api/forms/admin/${form.formId}`, {
        formName: form.formName,
        description: form.description,
        category: form.category,
        estimatedTime: form.estimatedTime,
        iconColor: form.iconColor,
        status: form.status || "DRAFT",
        isPublic: nextIsPublic,
        publicToken: form.publicToken,
      });

      openMessage(
        nextIsPublic ? "Đã chuyển Public" : "Đã chuyển Private",
        nextIsPublic
          ? "Biểu mẫu đã được bật public."
          : "Biểu mẫu đã được chuyển về private."
      );
      await loadForms();
    } catch (error) {
      console.error("Error toggling public state:", error);
      openMessage(
        "Không thể cập nhật",
        "Lỗi khi chuyển trạng thái public/private. Vui lòng thử lại."
      );
    }
  };

  const handleSubmitPublishPublic = async () => {
    if (!validateFormName()) {
      return;
    }

    const payload = {
      ...state.formData,
      status: "PUBLISHED",
      isPublic: true,
    };

    try {
      await saveForm(payload);
      openMessage(
        "Đã Publish + Public",
        "Biểu mẫu đã được publish và hiển thị ngoài homepage."
      );
      closeForm();
      await loadForms();
    } catch (error) {
      console.error("Error save+publish form:", error);
      openMessage(
        "Không thể Publish",
        "Lỗi khi lưu và publish biểu mẫu. Vui lòng thử lại."
      );
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
            openMessage("Đã xóa", "Biểu mẫu đã được xóa.");
            await loadForms();
          } catch (error) {
            console.error("Error deleting form:", error);
            dispatch({ type: actions.CLOSE_CONFIRM });
            openMessage(
              "Không thể xóa",
              "Lỗi khi xóa biểu mẫu. Vui lòng thử lại."
            );
          }
        },
      },
    });
  };

  const handleCreateVersion = (form) => {
    dispatch({
      type: actions.OPEN_CONFIRM,
      payload: {
        open: true,
        title: "Tạo phiên bản mới?",
        description: "Tạo phiên bản mới từ biểu mẫu hiện tại?",
        onConfirm: async () => {
          try {
            await api.post(`/api/forms/admin/${form.formId}/versions`, {
              formName: form.formName,
              description: form.description,
              category: form.category,
            });
            dispatch({ type: actions.CLOSE_CONFIRM });
            openMessage("Tạo thành công", "Phiên bản mới đã được tạo.");
            await loadForms();
          } catch (error) {
            console.error("Error creating new version:", error);
            dispatch({ type: actions.CLOSE_CONFIRM });
            openMessage(
              "Không thể tạo",
              "Lỗi khi tạo phiên bản mới. Vui lòng thử lại."
            );
          }
        },
      },
    });
  };

  const pagedForms = useMemo(() => {
    return state.forms.slice(
      (state.page - 1) * PAGE_SIZE,
      state.page * PAGE_SIZE
    );
  }, [state.forms, state.page]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagementHeader
        onCreate={() => dispatch({ type: actions.OPEN_FORM_CREATE })}
      />

      <FormModalSection
        show={state.showForm}
        editingForm={state.editingForm}
        formData={state.formData}
        onInputChange={handleInputChange}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        onSubmitPublishPublic={handleSubmitPublishPublic}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.forms.length > 0 ? (
          pagedForms.map((form) => (
            <FormCard
              key={form.formId}
              form={form}
              isMenuOpen={state.openMenu === form.formId}
              onToggleMenu={() =>
                dispatch({ type: actions.TOGGLE_MENU, payload: form.formId })
              }
              onManageQuestions={() =>
                navigate(`/system/admin/forms/${form.formId}/questions`)
              }
              onPublish={() => {
                handlePublishPublic(form);
                dispatch({ type: actions.CLOSE_MENU });
              }}
              onCreateVersion={() => {
                handleCreateVersion(form);
                dispatch({ type: actions.CLOSE_MENU });
              }}
              onTogglePublic={() => {
                handleTogglePublic(form);
                dispatch({ type: actions.CLOSE_MENU });
              }}
              onEdit={() => {
                dispatch({ type: actions.OPEN_FORM_EDIT, payload: form });
                dispatch({ type: actions.CLOSE_MENU });
              }}
              onDelete={() => handleDelete(form.formId)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">📭 Chưa có biểu mẫu nào</p>
            <button
              type="button"
              onClick={() => dispatch({ type: actions.OPEN_FORM_CREATE })}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              ➕ Tạo biểu mẫu đầu tiên
            </button>
          </div>
        )}
      </div>

      <Pagination
        currentPage={state.page}
        pageSize={PAGE_SIZE}
        totalItems={state.forms.length}
        onPageChange={(page) => dispatch({ type: actions.SET_PAGE, payload: page })}
      />

      <ConfirmDialog
        open={state.confirmDialog.open}
        title={state.confirmDialog.title}
        description={state.confirmDialog.description}
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
        onConfirm={state.confirmDialog.onConfirm}
        onClose={() => dispatch({ type: actions.CLOSE_CONFIRM })}
      />

      <MessageDialog
        open={state.messageDialog.open}
        title={state.messageDialog.title}
        description={state.messageDialog.description}
        onClose={() => dispatch({ type: actions.CLOSE_MESSAGE })}
        actionLabel="Đóng"
      />
    </div>
  );
};

export default AdminFormManagement;
