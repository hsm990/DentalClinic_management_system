import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

export const createProcedureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  durationMin: z.number().int().positive().optional(),
  categoryId: z.string().cuid(),
});

export const updateProcedureSchema = createProcedureSchema.partial();
