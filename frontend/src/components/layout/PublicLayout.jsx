import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Moon, Search, Sun } from "lucide-react";
import { Icons } from "../../constants/index";

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState("light");
  const [mounted, setMounted] = React.useState(false);
  const [navbarSearch, setNavbarSearch] = React.useState("");

  // Initialize theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("familymed-theme") || "light";
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  // Apply theme to DOM
  React.useEffect(() => {
    if (!mounted) return;
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("familymed-theme", theme);
  }, [theme, mounted]);

  const submitNavbarSearch = (event) => {
    event.preventDefault();
    navigate(`/?q=${encodeURIComponent(navbarSearch)}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out flex flex-col">
      {/* Navigation */}
      <nav className="p-4 md:px-12 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 backdrop-blur-sm z-30 shadow-sm dark:shadow-lg transition-colors duration-300">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-emerald-700 transition-colors duration-200">
            <Icons.Risk />
          </div>
          <span className="font-display font-bold text-slate-900 dark:text-slate-100 text-xl tracking-tight">
            FamilyMed
          </span>
        </button>

        <form onSubmit={submitNavbarSearch} className="hidden lg:block flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={navbarSearch}
            onChange={(event) => setNavbarSearch(event.target.value)}
            placeholder="Tìm biểu mẫu cộng đồng"
            className="w-full rounded-xl border border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-100 transition-colors duration-200"
          />
        </form>

        <div className="hidden md:flex items-center gap-8 text-slate-600 dark:text-slate-300 font-semibold">
          {[
            { to: "/", label: "Trang chủ", end: true },
            { to: "/about", label: "Về chúng tôi" },
            { to: "/risk-tools", label: "Công cụ tính nguy cơ" },
            { to: "/guideline", label: "Hướng dẫn" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `transition-colors duration-200 ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto md:ml-0 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark";
              setTheme(next);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 relative group"
            aria-label={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
          >
            <div className="relative w-4 h-4">
              {theme === "dark" ? (
                <Sun size={16} className="text-yellow-500 animate-spin-slow" />
              ) : (
                <Moon size={16} className="text-slate-600" />
              )}
            </div>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {theme === "dark" ? "Sáng" : "Tối"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Dành cho Bác sĩ
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 dark:text-slate-500 py-12 px-4 md:px-12 border-t border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-lg">
                <Icons.Risk />
              </div>
              <span className="font-display font-bold text-white text-xl tracking-tight">
                FamilyMed
              </span>
            </div>
            <p className="max-w-md text-slate-400">
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
                <NavLink to="/" className="hover:text-white transition-colors duration-200">
                  Trang chủ
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="hover:text-white transition-colors duration-200">
                  Về chúng tôi
                </NavLink>
              </li>
              <li>
                <NavLink to="/guideline" className="hover:text-white transition-colors duration-200">
                  Hướng dẫn
                </NavLink>
              </li>
              <li>
                <NavLink to="/risk-tools" className="hover:text-white transition-colors duration-200">
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
