import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(7, "Password is required"),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
