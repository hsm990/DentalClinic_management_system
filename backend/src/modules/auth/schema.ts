import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(7, "Password is required"),
});
