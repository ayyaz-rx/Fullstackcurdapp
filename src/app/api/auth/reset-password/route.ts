import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { User } from "@/models/users";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        {
          message: "Token and password are required",
        },

        {
          status: 400,
        },
      );
    }

    const user = await User.findOne({
      resetPasswordToken: token,

      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid or expired token",
        },

        {
          status: 400,
        },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = null;

    user.resetPasswordExpire = null;

    await user.save();

    return NextResponse.json(
      {
        message: "Password reset successfully",
      },

      {
        status: 200,
      },
    );

    
  } catch {
    return NextResponse.json(
      {
        message: "Server error",
      },

      {
        status: 500,
      },
    );
  }
}
