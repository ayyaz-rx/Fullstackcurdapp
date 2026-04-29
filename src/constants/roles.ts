// Role definitions
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

// Permission definitions
export const PERMISSIONS = {
  // Post permissions
  CREATE_POST: "create:post",
  READ_POST: "read:post",
  UPDATE_POST: "update:post",
  DELETE_POST: "delete:post",

  // User permissions
  MANAGE_USERS: "manage:users",
  MANAGE_ROLES: "manage:roles",
} as const;

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.READ_POST,
    PERMISSIONS.UPDATE_POST,
    PERMISSIONS.DELETE_POST,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.READ_POST,
    PERMISSIONS.UPDATE_POST,
  ],
  [ROLES.VIEWER]: [PERMISSIONS.READ_POST],
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];