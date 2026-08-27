import { z } from "zod";

export const createCaseSchema = z.object({
  applianceType: z.string().min(1),
  startDate: z.coerce.date(),
  estimatedEndDate: z.coerce.date().optional(),
  dentistId: z.string().min(1),
  notes: z.string().optional(),
});

export const updateCaseStatusSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "DISCONTINUED"]),
});

export const addVisitSchema = z.object({
  visitDate: z.coerce.date().optional(),
  notes: z.string().min(1),
  nextVisitDate: z.coerce.date().optional(),
});
