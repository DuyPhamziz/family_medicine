import { useRole } from "../../hooks/auth/useRole";
import { PERMISSIONS } from "../../constants/roles";

const PatientPermissionGuard = ({ canEdit, canDelete, children }) => {
  const { checkPermission } = useRole();

  // Check quyền chỉnh sửa
  if (canEdit && !checkPermission(PERMISSIONS.PATIENT_EDIT)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Không có quyền chỉnh sửa
          </h2>
          <p className="text-slate-600">
            Bạn không có quyền chỉnh sửa thông tin bệnh nhân.
          </p>
        </div>
      </div>
    );
  }

  // Check quyền xóa
  if (canDelete && !checkPermission(PERMISSIONS.PATIENT_DELETE)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Không có quyền xóa
          </h2>
          <p className="text-slate-600">
            Bạn không có quyền xóa thông tin bệnh nhân.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default PatientPermissionGuard;