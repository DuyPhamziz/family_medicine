import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/auth/useAuth";
import { ROLES } from "../../../constants/roles";
import { Icons } from "../../../constants";

const Sidebar = ({ collapsed, setCollapsed, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Menu khác nhau tùy theo role
  const menu = user?.role === ROLES.DOCTOR ? [
    {
      section: "Chính",
      items: [
        { id: "/system/dashboard", label: "Tổng quan", icon: <Icons.Home /> },
        {
          id: "/system/patients",
          label: "Bệnh nhân",
          icon: <Icons.Patients />,
        },
      ],
    },
    {
      section: "Chuẩn đoán",
      items: [
        { id: "/system/forms", label: "Nhập liệu", icon: <Icons.Form /> },
        { id: "/system/analysis", label: "Kết quả", icon: <Icons.Risk /> },
        { 
          id: "/system/doctor/public-submissions", 
          label: "Form công khai", 
          icon: <Icons.Form /> 
        },
      ],
    },
  ] : [
    {
      section: "Chính",
      items: [
        { id: "/system/dashboard", label: "Tổng quan", icon: <Icons.Home /> },
        {
          id: "/system/patients",
          label: "Bệnh nhân",
          icon: <Icons.Patients />,
        },
      ],
    },
    {
      section: "Lâm sàng",
      items: [
        { id: "/system/forms", label: "Biểu mẫu", icon: <Icons.Form /> },
        { id: "/system/logic", label: "Logic CDSS", icon: <Icons.Risk /> },
        {
          id: "/system/guidelines",
          label: "Hướng dẫn",
          icon: <Icons.Patients />,
        },
      ],
    },
    {
      section: "Báo cáo",
      items: [
        {
          id: "/system/admin/analytics",
          label: "Analytics",
          icon: <Icons.Risk />,
        },
        {
          id: "/system/report/summary",
          label: "Thống kê",
          icon: <Icons.Risk />,
        },
      ],
    },
    {
      section: "Quản lý Hệ thống",
      items: [
        {
          id: "/system/admin/forms",
          label: "Biểu mẫu Chuẩn đoán",
          icon: <Icons.Form />,
        },
        {
          id: "/system/admin/guidelines",
          label: "Hướng dẫn Lâm sàng",
          icon: <Icons.Risk />,
        },
        {
          id: "/system/admin/users",
          label: "Quản lý Người dùng",
          icon: <Icons.Patients />,
        },
      ],
    },
  ];

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-72"} bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-30`}
    >
      <div className="p-6 flex items-center justify-between mb-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-teal-200">
              <Icons.Risk />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              FamilyMed
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="bg-slate-50 hover:bg-slate-50 rounded-xl text-slate-400"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
        {menu.map((sec) => (
          <div key={sec.section}>
            {!collapsed && (
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] px-4 mb-3">
                {sec.section}
              </p>
            )}
            {sec.items.map((item) => {
              const isActive = location.pathname === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex items-center w-full p-3.5 mb-1 rounded-2xl transition-all ${
                    isActive
                      ? "bg-teal-50 text-teal-700 shadow-sm"
                      : "bg-sky-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 ${isActive ? "text-teal-600" : "text-slate-400"}`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className={`ml-3 text-sm font-bold`}>
                      {item.label}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 bg-teal-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-50">
        <button
          onClick={onLogout}
          className="bg-neutral-50 flex items-center w-full p-4 text-slate-400 font-bold hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <span className="text-xl">🚪</span>
          {!collapsed && <span className="ml-3 text-sm">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
