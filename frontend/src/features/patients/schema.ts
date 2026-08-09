import { z } from "zod";

export const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  medicalNotes: z.string().optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
