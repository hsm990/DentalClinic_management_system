import type { StockStatus } from "./inventoryApi";

export const STATUS_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
};

export const STATUS_VARIANT: Record<
  StockStatus,
  "default" | "secondary" | "destructive"
> = {
  IN_STOCK: "default",
  LOW_STOCK: "secondary",
  OUT_OF_STOCK: "destructive",
};
