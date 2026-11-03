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
export const updateClinicSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});
export const setClinicStatusSchema = z.object({ isActive: z.boolean() });

export const updateSubscriptionSchema = z.object({
  plan: z.enum(["TRIAL", "BASIC", "PRO"]),
  paidUntil: z.coerce.date().nullable(),
});

export const resetAdminPasswordSchema = z.object({
  adminId: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
export const extendSubscriptionSchema = z.object({
  plan: z.enum(["BASIC", "PRO"]),
  days: z.coerce.number().int().min(1).max(366),
});
