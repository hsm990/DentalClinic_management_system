import { z } from "zod";

export const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.email().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
});
export const updatePatientSchema = createPatientSchema.partial();
export const listPatientsQuerySchema = z.object({
  search: z.string().optional(),
  includeArchived: z.string().optional(), // "true"/"false" from query string
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
