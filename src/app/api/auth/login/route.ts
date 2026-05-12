import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { ROLE_PERMISSIONS } from "@/constants/roles";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log(` Login Failed: User not found - ${email}`);
      return Response.json(
        { error: "User not registered. Please register first." },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(` Login Failed: Invalid password for ${email}`);
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = generateToken(user._id.toString());
    const userPermissions: string[] =
      Array.isArray(user.permissions) && user.permissions.length > 0
        ? (user.permissions as string[])
        : (ROLE_PERMISSIONS[user.role] as string[]) || [];

    // LOGIN SUCCESS LOGS
    const timestamp = new Date().toLocaleString("en-PK");

    console.log("\n LOGIN SUCCESSFUL");
    console.log("--------------------------------------------");
    console.log("Timestamp:", timestamp);
    console.log("User ID:", user._id);
    console.log("Email:", user.email);
    console.log("Role:", user.role.toUpperCase());
    console.log("Created At:", new Date(user.createdAt).toLocaleString("en-PK"));

    console.log("Permissions:");
    userPermissions.forEach((perm: string) => {
      console.log(" -", perm);
    });

    console.log("--------------------------------------------\n");

    const response = NextResponse.json(
      {
        message: "Login success",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isSuperAdmin: Boolean(user.isSuperAdmin),
          name: user.name,
          permissions: userPermissions,
        },
      },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const isDbSelectionError =
        message.includes("mongoserverselectionerror") ||
        message.includes("mongooseserverselectionerror") ||
        message.includes("could not connect to any servers");
      const isAtlasNetworkBlock =
        message.includes("whitelist") ||
        message.includes("network access") ||
        message.includes("replicasetnoprimary");
      const isTlsIssue = message.includes("ssl") || message.includes("tls");

      if (isDbSelectionError || isAtlasNetworkBlock || isTlsIssue) {
        return Response.json(
          {
            error:
              "Database unreachable. Check MongoDB Atlas Network Access (whitelist your current IP) and try again.",
          },
          { status: 503 }
        );
      }
    }

    if (
      error instanceof Error &&
      (error.message.includes("MongoServerSelectionError") ||
        error.message.toLowerCase().includes("ssl"))
    ) {
      return Response.json(
        { error: "Database connection issue. Please try again in a moment." },
        { status: 503 }
      );
    }

    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
