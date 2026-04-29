// roles.ts
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// All permissions in system
export const PERMISSIONS = {
  CREATE_POST: "create:post",
  READ_POST: "read:post",
  UPDATE_POST: "update:post",
  DELETE_POST: "delete:post",

  // user management (admin only)
  CREATE_USER: "create:user",
  UPDATE_USER: "update:user",
  DELETE_USER: "delete:user",
  READ_USER: "read:user",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role → Permissions mapping 
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.READ_POST,
    PERMISSIONS.UPDATE_POST,
    PERMISSIONS.DELETE_POST,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.READ_USER,
  ],

  editor: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.READ_POST,
    PERMISSIONS.UPDATE_POST,
    PERMISSIONS.READ_USER,
  ],

  viewer: [PERMISSIONS.READ_POST],
};

//  check permission
export function hasPermission(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// check multiple permissions
export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
) {
  return permissions.some((p) =>
    ROLE_PERMISSIONS[role]?.includes(p)
  );
}