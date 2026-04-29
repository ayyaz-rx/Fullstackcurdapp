import { PERMISSIONS } from "@/constants/roles";
import { connectDB } from "@/lib/db";
import { checkPermission, getAuthenticatedUser } from "@/lib/permission";
import { User } from "@/models/users";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    //  ADMIN CHECK
    const canManageUsers = user.isSuperAdmin || user.role === "admin";

    if (!canManageUsers) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    checkPermission(user.role, PERMISSIONS.MANAGE_USERS);

    //  body
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return Response.json({ error: "Valid name required" }, { status: 400 });
    }

    //  number validation (
    if (/\d/.test(name)) {
      return Response.json({ error: "Name cannot contain numbers" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { name },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user: updatedUser });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Forbidden") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}