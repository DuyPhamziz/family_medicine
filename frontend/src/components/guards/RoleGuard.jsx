import { Navigate } from "react-router-dom";
import { useRole } from "../../hooks/auth/useRole";
import { useAuth } from "../../hooks/auth/useAuth";

const RoleGuard = ({ allowRoles, children, fallbackPath = "/" }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { checkRole } = useRole();

  // Hiển thị loading khi đang check authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Redirect về login nếu chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role
  const hasAccess = checkRole(allowRoles);

  if (!hasAccess) {
    // Redirect về fallback path hoặc hiển thị thông báo không có quyền
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-slate-600 mb-6">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên.
          </p>
          <button
            onClick={() => window.location.href = fallbackPath}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
