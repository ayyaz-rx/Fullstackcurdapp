import { ROLE_PERMISSIONS, type Permission, type Role } from "@/constants/roles";
import { verifyToken } from "./auth";
import { connectDB } from "./db";
import { User } from "@/models/users";

type DecodedToken = {
  id?: string;
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  isSuperAdmin: boolean;
}

export async function getAuthenticatedUser(token: string): Promise<AuthenticatedUser | null> {
  try {
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded?.id) {
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role || "viewer",
      isSuperAdmin: Boolean(user.isSuperAdmin),
    };
  } catch {
    return null;
  }
}

export function hasPermission(userRole: Role, requiredPermission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission);
}

export function checkPermission(userRole: Role, requiredPermission: Permission) {
  if (!hasPermission(userRole, requiredPermission)) {
    throw new Error(`User does not have permission: ${requiredPermission}`);
  }
}
