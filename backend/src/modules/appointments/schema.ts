import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Invalid patient id"),
  dentistId: z.string().min(1, "Invalid dentist id"),
  scheduledAt: z.coerce.date(),
  durationMin: z.number().int().positive().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "CONFIRMED",
    "CHECKED_IN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ]),
});

export const listAppointmentsQuerySchema = z.object({
  dentistId: z.string().cuid().optional(),
  patientId: z.string().optional(),
  status: z
    .enum([
      "SCHEDULED",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ])
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
