import { z } from "zod";

export const createTaskSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    targetType: z.enum(["USER", "ROLE", "CLINIC"]),
    targetUserId: z.string().optional(),
    targetRole: z
      .enum(["ADMIN", "DENTIST", "ASSISTANT", "RECEPTIONIST"])
      .optional(),
  })
  .refine((data) => data.targetType !== "USER" || !!data.targetUserId, {
    message: "targetUserId is required when targetType is USER",
    path: ["targetUserId"],
  })
  .refine((data) => data.targetType !== "ROLE" || !!data.targetRole, {
    message: "targetRole is required when targetType is ROLE",
    path: ["targetRole"],
  });

export const updateTaskStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]),
});
