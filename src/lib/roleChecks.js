export function checkRole(userRole, allowedRoles = []) {
  return allowedRoles.includes(userRole);
}
