import { z } from "zod";

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  dentistId: z.string().min(1, "Select a dentist"),
  scheduledAt: z.date({ message: "Select a date and time" }),
  reason: z.string().optional().or(z.literal("")),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
