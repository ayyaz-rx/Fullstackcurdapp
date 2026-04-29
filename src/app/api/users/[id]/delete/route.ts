import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { getAuthenticatedUser } from "@/lib/permission";

type RouteContext = {
  params?: { id?: string } | Promise<{ id?: string }>;
};

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams?.id;

    if (!userId) {
      return Response.json({ error: "Invalid user id" }, { status: 400 });
    }

    await connectDB();

    // Get token from header or cookie
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

    // Authenticate user
    const authUser = await getAuthenticatedUser(token);

    if (!authUser) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is superadmin or admin
    const canManageUsers = authUser.isSuperAdmin || authUser.role === "admin";

    if (!canManageUsers) {
      return Response.json(
        { error: "Forbidden: Admin only" },
        { status: 403 }
      );
    }

    // Find the user to delete
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting super admin
    if (targetUser.isSuperAdmin) {
      return Response.json(
        { error: "Cannot delete super admin user" },
        { status: 400 }
      );
    }

    // Prevent deleting self
    if (authUser.id === userId) {
      return Response.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Log the action
    console.log("User deleted:");
    console.log("Deleted by:", authUser.email);
    console.log("Deleted user email:", targetUser.email);

    return Response.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
