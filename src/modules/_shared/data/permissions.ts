/**
 * Generates a list of application permissions.
 *
 * Permissions follow the format:
 * `<resource>:<action>`
 *
 * These permissions are used for authorization checks
 * to determine whether a user is allowed to perform
 * a specific action on a resource.
 *
 * @returns {string[]} An array of permission strings.
 *
 * @example
 * const perms = permissions();
 * [
 *   'users:create',
 *   'users:read',
 *   'users:update',
 *   'users:delete',
 * ]
 */
export const getPermissions = (): string[] => {
  const resources = {
    'master': ['read'],
    'users': ['create', 'read', 'update', 'delete'],
    'roles': ['create', 'read', 'update', 'delete'],
    'examples': ['create', 'read', 'update', 'delete'],
    'administrator': ['read'],
    'audit-logs': ['read'],
  };

  return Object.entries(resources).flatMap(([resource, actions]) =>
    actions.map(action => `${resource}:${action}`),
  );
};
