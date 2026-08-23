import type { TaskStatus } from "./tasksApi";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const TASK_STATUS_VARIANT: Record<
  TaskStatus,
  "default" | "secondary" | "outline"
> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
};

export const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "DENTIST", label: "Dentist" },
  { value: "ASSISTANT", label: "Assistant" },
  { value: "RECEPTIONIST", label: "Receptionist" },
];
