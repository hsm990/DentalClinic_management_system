import { z } from "zod";

export const onboardClinicSchema = z.object({
  clinic: z.object({
    name: z.string().min(2),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
  admin: z.object({
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
  }),
});

export const clinicIdParamSchema = z.object({
  id: z.string().min(1),
});
