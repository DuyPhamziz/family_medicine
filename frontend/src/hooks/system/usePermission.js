import { useRole } from '../auth/useRole';

/**
 * Hook để check permission cụ thể
 * @param {string} permission - Permission cần check
 * @returns {boolean}
 */
export const usePermission = (permission) => {
  const { checkPermission } = useRole();
  return checkPermission(permission);
};
