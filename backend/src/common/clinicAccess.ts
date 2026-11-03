interface ClinicAccessInfo {
  isActive: boolean;
  plan: string;
  paidUntil: Date | null;
}

// returns the message to show, or null if the clinic may use the system.
// paidUntil = null means "no expiry" (your own demo clinics)
export function getClinicAccessIssue(
  clinic: ClinicAccessInfo | null,
): string | null {
  if (!clinic) return null; // SUPER_ADMIN has no clinic
  if (!clinic.isActive)
    return "This clinic's account is suspended. Please contact support.";
  if (clinic.paidUntil && clinic.paidUntil < new Date()) {
    return clinic.plan === "TRIAL"
      ? "Your free trial has ended. Contact us to activate your subscription."
      : "Your subscription has expired. Contact us to renew.";
  }
  return null;
}
