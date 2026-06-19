import mongoose from "mongoose";
import { ROLES } from "@/constants/roles";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
  isSuperAdmin: { type: Boolean, default: false },
  permissions: { type: [String], default: [] },
  role: {
    type: String,
    enum: [ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER],
    default: ROLES.VIEWER,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);