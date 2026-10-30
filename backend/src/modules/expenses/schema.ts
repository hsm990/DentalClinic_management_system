import { z } from "zod";

export const createExpenseSchema = z.object({
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpensesQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
