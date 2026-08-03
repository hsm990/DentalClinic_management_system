import { z } from "zod";

const toothConditions = [
  "HEALTHY",
  "DECAYED",
  "FILLED",
  "CROWNED",
  "ROOT_CANAL",
  "MISSING",
  "IMPLANT",
  "FRACTURED",
  "IMPACTED",
] as const;

export const upsertToothSchema = z.object({
  condition: z.enum(toothConditions),
  notes: z.string().optional(),
});

export const patientIdParamSchema = z.object({
  patientId: z.string().cuid(),
});

export const toothParamSchema = z.object({
  patientId: z.string().cuid(),
  toothNumber: z.coerce
    .number()
    .int()
    .refine((n) => {
      const quadrant = Math.floor(n / 10);
      const position = n % 10;
      return quadrant >= 1 && quadrant <= 4 && position >= 1 && position <= 8;
    }, "Invalid FDI tooth number (expected 11-18, 21-28, 31-38, 41-48)"),
});
