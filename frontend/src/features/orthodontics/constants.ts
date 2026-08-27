import type { OrthoCaseStatus } from "./orthodonticsApi";

export const CASE_STATUS_LABELS: Record<OrthoCaseStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  DISCONTINUED: "Discontinued",
};

export const CASE_STATUS_VARIANT: Record<
  OrthoCaseStatus,
  "default" | "secondary" | "destructive"
> = {
  ACTIVE: "default",
  COMPLETED: "secondary",
  DISCONTINUED: "destructive",
};
