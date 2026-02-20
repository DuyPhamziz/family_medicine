import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icons } from "../../constants/index";

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Navigation */}
      <nav className="p-4 md:px-12 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Icons.Risk />
          </div>
          <span className="font-display font-bold text-slate-900 text-xl tracking-tight">
            FamilyMed
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-slate-600 font-semibold">
          {[
            { to: "/", label: "Trang chủ", end: true },
            { to: "/about", label: "Về chúng tôi" },
            { to: "/risk-tools", label: "Công cụ tính nguy cơ" },
            { to: "/guideline", label: "Guideline" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          Dành cho Bác sĩ
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 md:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-900">
                <Icons.Risk />
              </div>
              <span className="font-display font-bold text-white text-xl tracking-tight">
                FamilyMed
              </span>
            </div>
            <p className="max-w-md">
              Trung tâm Nghiên cứu và Đào tạo Y học gia đình - Nâng tầm sức khỏe
              cộng đồng qua dữ liệu và trí tuệ nhân tạo.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">
              Liên kết
            </h4>
            <ul className="space-y-4">
              <li>
                <NavLink to="/" className="hover:text-white">
                  Trang chủ
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="hover:text-white">
                  Về chúng tôi
                </NavLink>
              </li>
              <li>
                <NavLink to="/guideline" className="hover:text-white">
                  Guideline
                </NavLink>
              </li>
              <li>
                <NavLink to="/risk-tools" className="hover:text-white">
                  Công cụ tính nguy cơ
                </NavLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">
              Liên hệ
            </h4>
            <ul className="space-y-4">
              <li>info@familymed.vn</li>
              <li>+84 (024) 123 4567</li>
              <li>TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          © {new Date().getFullYear()} FamilyMed Management System. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
