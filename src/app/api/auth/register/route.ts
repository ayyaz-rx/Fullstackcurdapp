import { connectDB } from "@/lib/db";
import { User } from "@/models/users";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { ROLE_PERMISSIONS, ROLES } from "@/constants/roles";

// Password validation rules
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least 1 lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least 1 number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least 1 special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    //  validation
    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password required" },
        { status: 400 }
      );
    }

    // Validate name
    if (typeof name !== "string" || name.trim().length < 2) {
      return Response.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return Response.json(
        { error: passwordValidation.errors.join("; ") },
        { status: 400 }
      );
    }

    //  check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        { error: "User already registered with this email" },
        { status: 400 }
      );
    }

    //  hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const totalUsers = await User.countDocuments();
    const isFirstUser = totalUsers === 0;
    const selectedRole = isFirstUser ? ROLES.ADMIN : ROLES.VIEWER;
    const userPermissions = ROLE_PERMISSIONS[selectedRole] || [];

    // 👤 create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: selectedRole,
      isSuperAdmin: isFirstUser,
      permissions: userPermissions,
    });

    //  token generate
    const token = generateToken(user._id.toString());

    return Response.json(
      {
        message: "User Registered Successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isSuperAdmin: Boolean(user.isSuperAdmin),
          name: user.name,
          permissions: user.permissions || userPermissions,
        },
      },
      { status: 200 }
    );
  } catch {
    return Response.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
