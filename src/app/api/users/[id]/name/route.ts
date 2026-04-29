import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { getAuthenticatedUser, checkPermission } from "@/lib/permission";
import { PERMISSIONS} from "@/constants/roles";

type RouteContext = {
  params?: { id?: string } | Promise<{ id?: string }>;
};

function isPermissionError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("does not have permission");
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams?.id;

    if (!userId) {
      return Response.json({ error: "Invalid user id" }, { status: 400 });
    }

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

    const body = (await req.json()) as { name?: string };
    const newName = (body.name || "").trim();

    if (!newName) {
      return Response.json({ error: "Invalid name" }, { status: 400 });
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent changing super admin's name unless the requester is super admin
    if (targetUser.isSuperAdmin && !user.isSuperAdmin) {
      return Response.json({ error: "Cannot edit super admin" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: newName, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    console.log("User name updated:");
    console.log("Changed by:", user.email);
    console.log("Target user:", targetUser.email);
    console.log("New name:", newName);

    return Response.json({ message: "User name updated", user: updatedUser });
  } catch (error: unknown) {
    if (isPermissionError(error)) {
      return Response.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }
    console.error("Error updating user name:", error);
    return Response.json({ error: "Failed to update user name" }, { status: 500 });
  }
}
