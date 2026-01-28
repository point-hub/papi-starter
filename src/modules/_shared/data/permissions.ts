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
    'master': ['module'],
    'users': ['module', 'read', 'create', 'update', 'delete'],
    'roles': ['module', 'read', 'create', 'update', 'delete'],
    'examples': ['module', 'read', 'create', 'update', 'delete'],
    'administrator': ['module'],
    'audit-logs': ['module', 'read', 'create', 'update', 'delete'],
  };

  return Object.entries(resources).flatMap(([resource, actions]) =>
    actions.map(action => `${resource}:${action}`),
  );
};
