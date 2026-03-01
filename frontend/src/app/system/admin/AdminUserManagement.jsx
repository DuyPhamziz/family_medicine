import React, { useEffect, useMemo, useReducer } from "react";
import api from "../../../service/api";
import MessageDialog from "../../../components/common/MessageDialog";
import Pagination from "../../../components/common/Pagination";
import UserModal from "../../../components/admin/users/UserModal";

const PAGE_SIZE = 8;
const EMPTY_MESSAGE = { open: false, title: "", description: "" };

const initialState = {
  users: [],
  query: "",
  roleFilter: "all",
  statusFilter: "all",
  loading: true,
  error: "",
  page: 1,
  modalOpen: false,
  activeUser: null,
  messageDialog: EMPTY_MESSAGE,
};

const actions = {
  LOAD_START: "LOAD_START",
  LOAD_SUCCESS: "LOAD_SUCCESS",
  LOAD_ERROR: "LOAD_ERROR",
  SET_QUERY: "SET_QUERY",
  SET_ROLE_FILTER: "SET_ROLE_FILTER",
  SET_STATUS_FILTER: "SET_STATUS_FILTER",
  SET_PAGE: "SET_PAGE",
  OPEN_CREATE: "OPEN_CREATE",
  OPEN_EDIT: "OPEN_EDIT",
  CLOSE_MODAL: "CLOSE_MODAL",
  OPEN_MESSAGE: "OPEN_MESSAGE",
  CLOSE_MESSAGE: "CLOSE_MESSAGE",
};

function reducer(state, action) {
  switch (action.type) {
    case actions.LOAD_START:
      return { ...state, loading: true, error: "" };
    case actions.LOAD_SUCCESS:
      return { ...state, loading: false, users: action.payload || [] };
    case actions.LOAD_ERROR:
      return { ...state, loading: false, error: action.payload };
    case actions.SET_QUERY:
      return { ...state, query: action.payload, page: 1 };
    case actions.SET_ROLE_FILTER:
      return { ...state, roleFilter: action.payload, page: 1 };
    case actions.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload, page: 1 };
    case actions.SET_PAGE:
      return { ...state, page: action.payload };
    case actions.OPEN_CREATE:
      return { ...state, activeUser: null, modalOpen: true };
    case actions.OPEN_EDIT:
      return { ...state, activeUser: action.payload, modalOpen: true };
    case actions.CLOSE_MODAL:
      return { ...state, modalOpen: false, activeUser: null };
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
      return { ...state, messageDialog: EMPTY_MESSAGE };
    default:
      return state;
  }
}

const HeaderSection = ({ onCreate }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Quản lý người dùng</h1>
      <p className="text-slate-500 mt-2">
        Quản lý tài khoản, vai trò và tình trạng sử dụng trong hệ thống.
      </p>
    </div>
    <button
      type="button"
      onClick={onCreate}
      className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold"
    >
      Tạo người dùng mới
    </button>
  </div>
);

const FiltersSection = ({
  query,
  roleFilter,
  statusFilter,
  onQueryChange,
  onRoleChange,
  onStatusChange,
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <input
        id="userQuery"
        value={query}
        onChange={onQueryChange}
        placeholder="Tìm theo tên, email, mã..."
        className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <select
        id="roleFilter"
        value={roleFilter}
        onChange={onRoleChange}
        className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="all">Tất cả vai trò</option>
        <option value="ADMIN">Admin</option>
        <option value="DOCTOR">Bác sĩ</option>
        <option value="NURSE">Y tá</option>
        <option value="DATA_ENTRY">Nhập liệu</option>
      </select>
      <select
        id="statusFilter"
        value={statusFilter}
        onChange={onStatusChange}
        className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="ACTIVE">Đang hoạt động</option>
        <option value="INACTIVE">Tạm khóa</option>
      </select>
    </div>
  </div>
);

const UsersTableSection = ({ users, onEdit }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
      <div className="col-span-3">Người dùng</div>
      <div className="col-span-3">Email</div>
      <div className="col-span-2">Vai trò</div>
      <div className="col-span-2">Trạng thái</div>
      <div className="col-span-2">Gần đây</div>
    </div>

    {users.length === 0 ? (
      <div className="p-10 text-center text-slate-500">Chưa tìm thấy người dùng phù hợp.</div>
    ) : (
      users.map((user) => (
        <div
          key={user.userId}
          className="grid grid-cols-12 px-6 py-4 border-b border-slate-50 text-sm text-slate-700"
        >
          <div className="col-span-3 font-semibold text-slate-900">{user.fullName}</div>
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
              onClick={() => onEdit(user)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Sửa
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);

const AdminUserManagement = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadUsers = async () => {
    dispatch({ type: actions.LOAD_START });
    try {
      const response = await api.get("/api/admin/users");
      dispatch({ type: actions.LOAD_SUCCESS, payload: response.data || [] });
    } catch (error) {
      console.error("User management error:", error);
      dispatch({
        type: actions.LOAD_ERROR,
        payload: "Không thể tải danh sách người dùng. Vui lòng thử lại.",
      });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return state.users.filter((user) => {
      const matchesQuery = state.query
        ? `${user.fullName} ${user.email} ${user.userId}`
            .toLowerCase()
            .includes(state.query.toLowerCase())
        : true;

      const matchesRole =
        state.roleFilter === "all" ? true : user.role === state.roleFilter;
      const matchesStatus =
        state.statusFilter === "all" ? true : user.status === state.statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [state.users, state.query, state.roleFilter, state.statusFilter]);

  const pagedUsers = useMemo(() => {
    return filteredUsers.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
  }, [filteredUsers, state.page]);

  const openMessage = (title, description) => {
    dispatch({ type: actions.OPEN_MESSAGE, payload: { title, description } });
  };

  const handleSaveUser = async (payload) => {
    try {
      if (state.activeUser) {
        await api.put(`/api/admin/users/${state.activeUser.userId}`, {
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

      dispatch({ type: actions.CLOSE_MODAL });
      await loadUsers();
    } catch (error) {
      console.error("User save error:", error);
      openMessage("Không thể lưu", "Vui lòng kiểm tra dữ liệu và thử lại.");
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderSection onCreate={() => dispatch({ type: actions.OPEN_CREATE })} />

      {state.error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
          {state.error}
        </div>
      )}

      <FiltersSection
        query={state.query}
        roleFilter={state.roleFilter}
        statusFilter={state.statusFilter}
        onQueryChange={(event) =>
          dispatch({ type: actions.SET_QUERY, payload: event.target.value })
        }
        onRoleChange={(event) =>
          dispatch({ type: actions.SET_ROLE_FILTER, payload: event.target.value })
        }
        onStatusChange={(event) =>
          dispatch({ type: actions.SET_STATUS_FILTER, payload: event.target.value })
        }
      />

      <UsersTableSection
        users={pagedUsers}
        onEdit={(user) => dispatch({ type: actions.OPEN_EDIT, payload: user })}
      />

      <Pagination
        currentPage={state.page}
        pageSize={PAGE_SIZE}
        totalItems={filteredUsers.length}
        onPageChange={(page) => dispatch({ type: actions.SET_PAGE, payload: page })}
      />

      <UserModal
        open={state.modalOpen}
        onClose={() => dispatch({ type: actions.CLOSE_MODAL })}
        onSubmit={handleSaveUser}
        initialData={state.activeUser}
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

export default AdminUserManagement;
