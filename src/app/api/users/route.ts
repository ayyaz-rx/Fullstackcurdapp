import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { getAuthenticatedUser, checkPermission } from "@/lib/permission";
import { PERMISSIONS } from "@/constants/roles";

function isPermissionError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("does not have permission");
}

export async function GET(req: Request) {
  try {
    await connectDB();

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

    const user = await getAuthenticatedUser(token);

    if (!user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const canManageUsers = user.isSuperAdmin || user.role === "admin";

    if (!canManageUsers) {
      return Response.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    checkPermission(user.role, PERMISSIONS.MANAGE_USERS);

    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return Response.json({ users });
  } catch (error: unknown) {
    if (isPermissionError(error)) {
      return Response.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
