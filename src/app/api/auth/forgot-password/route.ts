import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import { User } from "@/models/users";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          message: "Email is required",
        },

        {
          status: 400,
        },
      );
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },

        {
          status: 404,
        },
      );
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    return NextResponse.json(
      {
        message: "Reset token created",

        token: resetToken,
      },

      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
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
