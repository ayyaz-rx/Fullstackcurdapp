import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import { getAuthenticatedUser } from "@/lib/permission";
import { ROLE_PERMISSIONS, ROLES, type Role } from "@/constants/roles";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
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

    // Get request body
    const body = await req.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Validate role
    const userRole = (role || ROLES.VIEWER) as Role;
    if (!Object.values(ROLES).includes(userRole)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get permissions for the role
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      permissions,
      isSuperAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    // Log the action
    console.log("New user created:");
    console.log("Created by:", authUser.email);
    console.log("New user email:", email);
    console.log("New user role:", userRole);

    return Response.json(
      {
        message: "User created successfully",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
