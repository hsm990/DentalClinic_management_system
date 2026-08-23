import { z } from "zod";

export const createInventoryItemSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  quantity: z.coerce.number().int().min(0).default(0),
  unitPrice: z.coerce.number().positive(),
  expiryDate: z.coerce.date().optional(),
  supplier: z.string().optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const adjustQuantitySchema = z.object({
  delta: z.coerce.number().int(), // positive to add stock, negative to consume
});
