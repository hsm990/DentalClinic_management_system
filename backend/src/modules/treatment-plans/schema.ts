import { z } from "zod";

export const createTreatmentPlanSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
});

export const addPlanItemSchema = z.object({
  procedureId: z.string().cuid(),
  toothNumber: z.number().int().optional(),
  estimatedCost: z.number().positive(),
  notes: z.string().optional(),
});

export const updateItemStatusSchema = z.object({
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});
