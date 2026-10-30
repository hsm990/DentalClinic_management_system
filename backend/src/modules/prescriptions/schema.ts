import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  medications: z.array(medicationSchema).min(1, "Add at least one medication"),
  instructions: z.string().optional(),
});
