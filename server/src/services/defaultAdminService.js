import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin.js";

export const ensureDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, 10);

  return Admin.create({
    name: process.env.ADMIN_NAME || "AI4Kids Admin",
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
    active: true,
  });
};
