import { useAuth } from './useAuth';
import { ROLES, hasRole, hasPermission } from '../../constants/roles';

/**
 * Hook để check role và permission của user hiện tại
 */
export const useRole = () => {
  const { user } = useAuth();

  const userRole = user?.role || null;

  /**
   * Check xem user có role trong danh sách allowed roles không
   * @param {string[]} allowedRoles - Mảng các roles được phép
   * @returns {boolean}
   */
  const checkRole = (allowedRoles) => {
    if (!userRole) return false;
    return hasRole(userRole, allowedRoles);
  };

  /**
   * Check xem user có permission không
   * @param {string} permission - Permission cần check
   * @returns {boolean}
   */
  const checkPermission = (permission) => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  /**
   * Check xem user có phải là admin không
   */
  const isAdmin = userRole === ROLES.ADMIN;

  /**
   * Check xem user có phải là bác sĩ không
   */
  const isDoctor = userRole === ROLES.DOCTOR;

  /**
   * Check xem user có phải là y tá không
   */
  const isNurse = userRole === ROLES.NURSE;

  /**
   * Check xem user có phải là nhập liệu không
   */
  const isDataEntry = userRole === ROLES.DATA_ENTRY;

  return {
    userRole,
    checkRole,
    checkPermission,
    isAdmin,
    isDoctor,
    isNurse,
    isDataEntry,
  };
};
