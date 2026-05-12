import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { getAuthenticatedUser, checkPermission } from "@/lib/permission";
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES, type Role } from "@/constants/roles";

function isPermissionError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("does not have permission");
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await context.params;

    if (!userId) {
      return Response.json({ error: "Invalid user id" }, { status: 400 });
    }

    await connectDB();

    //  Get token (header or cookie)
    const headerToken = req.headers.get("authorization")?.replace("Bearer ", "");
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieToken = cookieHeader
      .split("; ")
      .find((part) => part.startsWith("token="))
      ?.split("=")[1];

    const token = headerToken || cookieToken;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    //  Authenticate user
    const user = await getAuthenticatedUser(token);

    if (!user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const canManageUsers = user.isSuperAdmin || user.role === "admin";

    if (!canManageUsers) {
      return Response.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    //  Permission check
    checkPermission(user.role, PERMISSIONS.MANAGE_USERS);

    //  Get request body
    const body = (await req.json()) as { role?: Role };
    const role = body.role;

    if (!role || !Object.values(ROLES).includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    //  Find target user
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.isSuperAdmin && role !== ROLES.ADMIN) {
      return Response.json(
        { error: "Super Admin role cannot be Chnaged" },
        { status: 400 }
      );
    }

    const oldRole = targetUser.role;
    const updatedPermissions = ROLE_PERMISSIONS[role] || [];

    //  Update role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role, permissions: updatedPermissions, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    //  Simple log
    console.log("User role updated:");
    console.log("Changed by:", user.email);
    console.log("Target user:", targetUser.email);
    console.log("Old role:", oldRole, "→ New role:", role);

    return Response.json({
      message: "User role updated",
      user: updatedUser,
    });

  } catch (error: unknown) {
    if (isPermissionError(error)) {
      return Response.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    return Response.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}