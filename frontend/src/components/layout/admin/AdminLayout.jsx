import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../../hooks/auth/useAuth";
import { ROLES } from "../../../constants/roles";

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Helper để hiển thị tên role
  const getRoleLabel = (role) => {
    const roleLabels = {
      [ROLES.ADMIN]: "Quản trị viên",
      [ROLES.DOCTOR]: "Bác sĩ",
      [ROLES.NURSE]: "Y tá",
      [ROLES.DATA_ENTRY]: "Nhập liệu",
      [ROLES.PHARMACIST]: "Dược sĩ",
      [ROLES.RECEPTIONIST]: "Lễ tân",
    };
    return roleLabels[role] || role;
  };

  // Lấy tên hiển thị từ user
  const displayName = user?.fullName || user?.name || user?.email || "Người dùng";
  const userRole = user?.role || "";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans ">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header hiện đại */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 z-20">
          <div>
            <h2 className="text-sm font-medium text-slate-400">
              Hệ thống quản lý
            </h2>
            <p className="text-lg font-bold text-slate-800 capitalize">
              {window.location.pathname.split("/").pop() || "Dashboard"}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              🔔
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                  {displayName}
                </p>
                <p className="text-[11px] font-bold text-teal-600 uppercase tracking-tighter">
                  {getRoleLabel(userRole)}
                </p>
              </div>
              <div className="w-11 h-11 bg-teal-100 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center text-teal-700 font-black text-lg">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung chính */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
