import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icons } from "../../constants";
import { useAuth } from "../../hooks/auth/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/system/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect dựa trên role của user
        const userRole = result.user?.role;
        
        // Có thể customize redirect dựa trên role
        if (userRole === "ADMIN") {
          navigate("/system/admin", { replace: true });
        } else {
          navigate("/system/dashboard", { replace: true });
        }
      } else {
        const errorMsg = result.error || "Đăng nhập thất bại. Vui lòng thử lại.";
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.status === 401 
        ? "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại."
        : err.response?.status === 0
        ? "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối Internet."
        : "Có lỗi xảy ra. Vui lòng thử lại sau.";
      setError(errorMsg);
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test credentials - Always available for easy access
  const fillTestCredentials = (role = "admin") => {
    const credentials = {
      admin: { email: "admin@familymed.vn", password: "Admin@123456" },
      doctor: { email: "doctor@familymed.vn", password: "Doctor@123456" }
    };
    setFormData(credentials[role] || credentials.admin);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-teal-100/50 border border-slate-100">
        {/* Cột trái: Hình ảnh & Giới thiệu */}
        <div className="md:w-1/2 bg-teal-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decor tảng màu nền */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full -mr-32 -mt-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400 rounded-full -ml-16 -mb-16 opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-lg">
                <Icons.Risk />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white">
                FamilyMed
              </span>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-6">
              Đồng hành cùng <br />
              <span className="text-teal-200">Sức khỏe Gia đình</span>
            </h2>
            <p className="text-teal-50/80 text-lg leading-relaxed">
              Hệ thống hỗ trợ ra quyết định lâm sàng (CDSS) giúp bác sĩ tối ưu
              hóa quá trình điều trị và quản lý bệnh nhân mãn tính.
            </p>
          </div>

          <div className="relative z-10 mt-12 bg-teal-700/30 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-400/30 rounded-full flex items-center justify-center text-2xl">
                🩺
              </div>
              <div>
                <p className="text-sm font-medium opacity-80">
                  Dành cho chuyên gia
                </p>
                <p className="font-bold">Hơn 500+ Bác sĩ đang sử dụng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Form đăng nhập */}
        <div className="md:w-1/2 p-8 md:p-16">
          <div className="max-w-sm mx-auto">
            <h3 className="text-3xl font-black text-slate-800 mb-2">
              Chào mừng Bác sĩ!
            </h3>
            <p className="text-slate-500 mb-8">
              Vui lòng đăng nhập để tiếp tục công việc.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 text-black">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-sm font-bold text-slate-700 mb-2">
                  Email hoặc Mã nhân viên
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Icons.Patients />
                  </span>
                  <input
                    id="login-email"
                    type="text"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    placeholder="doctor@familymed.vn hoặc NV001"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-bold text-slate-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Icons.Form />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-slate-600 font-medium">Ghi nhớ</span>
                </label>
                <button
                  type="button"
                  className="text-teal-600 font-bold hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  "Đăng nhập ngay"
                )}
              </button>
            </form>

            <div className="mt-12 text-center space-y-3">
              <p className="text-slate-500 text-sm">
                Bạn chưa có tài khoản? <br />
                <button className="text-teal-600 font-bold hover:underline mt-1">
                  Yêu cầu cấp quyền truy cập
                </button>
              </p>
              <div className="pt-3 border-t border-slate-200">
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 font-medium text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay về trang chủ
                </Link>
              </div>
            </div>

            {/* Quick Login Credentials - Always visible for convenience */}
            <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-base">🔐</span>
                Tài khoản mặc định (Click để điền tự động)
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillTestCredentials("admin")}
                  className="block w-full text-left px-3 py-2 text-xs text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium bg-white/50"
                >
                  <span className="font-bold text-blue-900">👨‍💼 Admin:</span> admin@familymed.vn / Admin@123456
                </button>
                <button
                  type="button"
                  onClick={() => fillTestCredentials("doctor")}
                  className="block w-full text-left px-3 py-2 text-xs text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium bg-white/50"
                >
                  <span className="font-bold text-blue-900">👨‍⚕️ Doctor:</span> doctor@familymed.vn / Doctor@123456
                </button>
              </div>
              <p className="mt-3 text-[10px] text-blue-600 italic">
                💡 Sau khi đăng nhập, Admin có thể tạo thêm tài khoản mới tại <span className="font-bold">Quản lý Users</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
