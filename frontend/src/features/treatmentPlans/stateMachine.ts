import type { PlanItemStatus } from "./treatmentPlansApi";

const ALLOWED_TRANSITIONS: Record<PlanItemStatus, PlanItemStatus[]> = {
  PLANNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function getNextItemStatuses(current: PlanItemStatus): PlanItemStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export const ITEM_STATUS_LABELS: Record<PlanItemStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ITEM_STATUS_VARIANT: Record<
  PlanItemStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PLANNED: "outline",
  IN_PROGRESS: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
};
