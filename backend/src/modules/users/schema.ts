import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  role: z.enum(["DENTIST", "ASSISTANT", "RECEPTIONIST"]),
});
export const updateStaffSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(["DENTIST", "ASSISTANT", "RECEPTIONIST"]).optional(),
});
