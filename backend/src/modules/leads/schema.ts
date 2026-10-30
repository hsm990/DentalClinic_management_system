import { z } from "zod";

export const createLeadSchema = z.object({
  clinicName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  message: z.string().optional(),
});
export const updateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONVERTED", "DECLINED"]),
});
