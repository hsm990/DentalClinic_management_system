import { z } from "zod";

export const createInvoiceSchema = z.object({
  discount: z.number().min(0).optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        procedureId: z.string().cuid(),
        toothNumber: z.number().int().optional(),
        quantity: z.number().int().positive().default(1),
        treatmentPlanItemId: z.string().cuid().optional(),
      }),
    )
    .min(1, "Invoice must have at least one item"),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["CASH", "CARD", "MOBILE_PAYMENT", "OTHER"]),
  notes: z.string().optional(),
});

export const revenueQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});
export const financeSummaryQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});
