import { z } from "zod";

export const createTodoSchema = z.object({
  text: z.string().min(1),
  date: z.coerce.date(),
});

export const updateTodoSchema = z.object({
  text: z.string().min(1).optional(),
  isDone: z.boolean().optional(),
});

export const listTodosQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
