import type { ClinicWithCounts } from "@/features/clinic/clinicApi";

const DAY = 24 * 60 * 60 * 1000;

export function getClinicState(c: ClinicWithCounts) {
  if (!c.isActive)
    return {
      key: "suspended",
      label: "Suspended",
      variant: "destructive" as const,
    };
  if (c.paidUntil) {
    const daysLeft = Math.ceil(
      (new Date(c.paidUntil).getTime() - Date.now()) / DAY,
    );
    if (daysLeft <= 0)
      return {
        key: "expired",
        label: "Expired",
        variant: "destructive" as const,
      };
    if (c.plan === "TRIAL")
      return {
        key: "trial",
        label: `Trial · ${daysLeft}d left`,
        variant: "secondary" as const,
        daysLeft,
      };
    return {
      key: "active",
      label: "Active",
      variant: "default" as const,
      daysLeft,
    };
  }
  return { key: "active", label: "Active", variant: "default" as const };
}
