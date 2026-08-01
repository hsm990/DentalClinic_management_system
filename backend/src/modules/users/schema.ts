import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  role: z.enum(["DENTIST", "ASSISTANT", "RECEPTIONIST"]),
});
