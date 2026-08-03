type ItemStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const ALLOWED_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  PLANNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidItemTransition(
  from: ItemStatus,
  to: ItemStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export type { ItemStatus };
