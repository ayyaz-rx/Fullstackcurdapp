import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { ROLE_PERMISSIONS } from "@/constants/roles";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const bodyToken = typeof body?.token === "string" ? body.token : null;

    const cookieHeader = req.headers.get("cookie") || "";
    const cookieToken = cookieHeader
      .split("; ")
      .find((part) => part.startsWith("token="))
      ?.split("=")[1];

    const token = bodyToken || cookieToken;

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);//  verify the token

    if (!decoded) {
      return Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId =
      typeof decoded === "object" && decoded !== null && "id" in decoded
        ? String(decoded.id)
        : null;

    if (!userId) {
      return Response.json({ error: "Invalid token payload" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(userId).select("_id name email role isSuperAdmin permissions").lean();

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      valid: true,
      user: {
        id: String(user._id),
        name: user.name || "",
        email: user.email,
        role: user.role,
        isSuperAdmin: Boolean(user.isSuperAdmin),
        permissions:
          Array.isArray(user.permissions) && user.permissions.length > 0
            ? user.permissions
            : ROLE_PERMISSIONS[user.role] || [],
      },
    });
  } catch {
    return Response.json({ error: "Token verification failed" }, { status: 500 });
  }
}
