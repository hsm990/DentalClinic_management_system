import type { InvoiceStatus, PaymentMethod } from "./billingApi";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: "Pending",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export const INVOICE_STATUS_VARIANT: Record<
  InvoiceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
  REFUNDED: "destructive",
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "MOBILE_PAYMENT", label: "Mobile Payment" },
  { value: "OTHER", label: "Other" },
];
