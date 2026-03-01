import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavigation from "../../navigation/TopNavigation";
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
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onLogout={handleLogout}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
