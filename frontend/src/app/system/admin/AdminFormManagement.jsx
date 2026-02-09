import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../service/api";

const AdminFormManagement = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [formData, setFormData] = useState({
    formName: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await api.get("/api/forms/admin/all");
      setForms(response.data);
    } catch (error) {
      console.error("Error loading forms:", error);
      alert("Lỗi khi tải danh sách biểu mẫu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.formName.trim()) {
      alert("Vui lòng nhập tên biểu mẫu");
      return;
    }

    try {
      if (editingForm) {
        await api.put(`/api/forms/admin/${editingForm.id}`, formData);
        alert("Cập nhật biểu mẫu thành công");
      } else {
        await api.post("/api/forms/admin/create", formData);
        alert("Tạo biểu mẫu thành công");
      }
      setFormData({ formName: "", description: "", category: "" });
      setEditingForm(null);
      setShowForm(false);
      loadForms();
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Lỗi khi lưu biểu mẫu");
    }
  };

  const handleEdit = (form) => {
    setEditingForm(form);
    setFormData({
      formName: form.formName,
      description: form.description,
      category: form.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa biểu mẫu này?")) {
      return;
    }

    try {
      await api.delete(`/api/forms/admin/${id}`);
      alert("Xóa biểu mẫu thành công");
      loadForms();
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Lỗi khi xóa biểu mẫu");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingForm(null);
    setFormData({ formName: "", description: "", category: "" });
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          📋 Quản lý Biểu mẫu Chuẩn đoán
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          ➕ Tạo Biểu mẫu Mới
        </button>
      </div>

      {/* Form Creation/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {editingForm ? "✏️ Chỉnh sửa Biểu mẫu" : "➕ Tạo Biểu mẫu Mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Biểu mẫu *
                </label>
                <input
                  type="text"
                  name="formName"
                  value={formData.formName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Tiểu Đường Screening"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả biểu mẫu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
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
                  {editingForm ? "💾 Cập nhật" : "💾 Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.length > 0 ? (
          forms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {form.formName}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{form.description}</p>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {form.category}
                </span>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                📚 {form.questions?.length || 0} câu hỏi
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/system/admin/forms/${form.id}/questions`)}
                  className="flex-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm font-medium"
                >
                  ❓ Quản lý Câu hỏi
                </button>
                <button
                  onClick={() => handleEdit(form)}
                  className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(form.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">📭 Chưa có biểu mẫu nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              ➕ Tạo biểu mẫu đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFormManagement;
