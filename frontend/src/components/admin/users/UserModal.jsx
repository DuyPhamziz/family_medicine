import React, { useEffect, useState } from "react";
import Modal from "../../common/Modal";

const UserModal = ({ open, onClose, onSubmit, initialData }) => {
  const isEdit = Boolean(initialData?.userId);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    roleCode: "DOCTOR",
    password: "",
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        username: initialData.username || "",
        roleCode: initialData.role || "DOCTOR",
        password: "",
        active: initialData.status ? initialData.status === "ACTIVE" : true,
      });
      return;
    }

    setFormData({
      fullName: "",
      email: "",
      username: "",
      roleCode: "DOCTOR",
      password: "",
      active: true,
    });
  }, [initialData]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Cập nhật người dùng" : "Tạo người dùng mới"}
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="user-form"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            {isEdit ? "Lưu" : "Tạo"}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              required
              disabled={isEdit}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              required
              disabled={isEdit}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Vai trò</label>
            <select
              name="roleCode"
              value={formData.roleCode}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
            >
              <option value="ADMIN">Admin</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="NURSE">Y tá</option>
              <option value="DATA_ENTRY">Nhập liệu</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-7">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 rounded text-slate-900 focus:ring-slate-400"
            />
            <span className="text-sm text-slate-600">Đang hoạt động</span>
          </div>
        </div>

        {!isEdit && (
          <div>
            <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              required
            />
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UserModal;
