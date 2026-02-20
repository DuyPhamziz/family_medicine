import React, { useEffect, useMemo, useState } from "react";
import api from "../../../service/api";
import MessageDialog from "../../../components/common/MessageDialog";
import Pagination from "../../../components/common/Pagination";
import UserModal from "../../../components/admin/users/UserModal";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    title: "",
    description: "",
  });
  const pageSize = 8;

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/admin/users");
      setUsers(response.data || []);
    } catch (err) {
      console.error("User management error:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery = query
        ? `${user.fullName} ${user.email} ${user.userId}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ? true : user.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, statusFilter, users.length]);

  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const openMessage = (title, description) => {
    setMessageDialog({ open: true, title, description });
  };

  const openCreate = () => {
    setActiveUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setActiveUser(user);
    setModalOpen(true);
  };

  const handleSaveUser = async (payload) => {
    try {
      if (activeUser) {
        await api.put(`/api/admin/users/${activeUser.userId}`, {
          fullName: payload.fullName,
          roleCode: payload.roleCode,
          active: payload.active,
        });
      } else {
        await api.post("/api/admin/users", {
          username: payload.username,
          email: payload.email,
          fullName: payload.fullName,
          roleCode: payload.roleCode,
          password: payload.password,
          active: payload.active,
        });
      }

      setModalOpen(false);
      setActiveUser(null);
      await loadUsers();
    } catch (err) {
      console.error("User save error:", err);
      openMessage("Không thể lưu", "Vui lòng kiểm tra dữ liệu và thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý người dùng
          </h1>
          <p className="text-slate-500 mt-2">
            Quản lý tài khoản, vai trò và tình trạng sử dụng trong hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold"
        >
          Tạo người dùng mới
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email, mã..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Bác sĩ</option>
            <option value="NURSE">Y tá</option>
            <option value="DATA_ENTRY">Nhập liệu</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
          <div className="col-span-3">Người dùng</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Vai trò</div>
          <div className="col-span-2">Trạng thái</div>
          <div className="col-span-2">Gần đây</div>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            Chưa tìm thấy người dùng phù hợp.
          </div>
        ) : (
          pagedUsers.map((user) => (
            <div
              key={user.userId}
              className="grid grid-cols-12 px-6 py-4 border-b border-slate-50 text-sm text-slate-700"
            >
              <div className="col-span-3 font-semibold text-slate-900">
                {user.fullName}
              </div>
              <div className="col-span-3 text-slate-500">{user.email}</div>
              <div className="col-span-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {user.role}
                </span>
              </div>
              <div className="col-span-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {user.status === "ACTIVE" ? "Hoạt động" : "Tạm khóa"}
                </span>
              </div>
              <div className="col-span-2 text-slate-500 flex items-center justify-between gap-2">
                <span>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
                    : user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "-"}
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(user)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Sửa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={filteredUsers.length}
        onPageChange={setPage}
      />

      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveUser}
        initialData={activeUser}
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

export default AdminUserManagement;
