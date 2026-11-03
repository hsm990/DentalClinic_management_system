import { useState } from "react";
import { toast } from "sonner";
import {
  useUpdateSubscriptionMutation,
  useResetAdminPasswordMutation,
  useExtendSubscriptionMutation,
  type ClinicWithCounts,
} from "@/features/clinic/clinicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const PLANS = [
  { value: "TRIAL", label: "Trial" },
  { value: "BASIC", label: "Basic" },
  { value: "PRO", label: "Pro" },
];

function PaymentReceivedForm({ clinic }: { clinic: ClinicWithCounts }) {
  const [plan, setPlan] = useState<"BASIC" | "PRO">(
    clinic.plan === "PRO" ? "PRO" : "BASIC",
  );
  const [extend, { isLoading }] = useExtendSubscriptionMutation();

  async function handle(days: number, label: string) {
    try {
      await extend({ id: clinic.id, plan, days }).unwrap();
      toast.success(`Extended by ${label}. The clinic can sign in again.`);
    } catch {
      toast.error("Failed to extend");
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Payment received</p>
      <p className="text-xs text-muted-foreground">
        Only press this after you have checked the payment yourself.
      </p>
      <Select
        items={[
          { value: "BASIC", label: "Basic" },
          { value: "PRO", label: "Pro" },
        ]}
        value={plan}
        onValueChange={(v) => setPlan(v as "BASIC" | "PRO")}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="BASIC">Basic</SelectItem>
          <SelectItem value="PRO">Pro</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isLoading}
          onClick={() => handle(30, "1 month")}
        >
          +1 month
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => handle(90, "3 months")}
        >
          +3 months
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => handle(365, "1 year")}
        >
          +1 year
        </Button>
      </div>
    </div>
  );
}

function SubscriptionForm({ clinic }: { clinic: ClinicWithCounts }) {
  const [plan, setPlan] = useState<string>(clinic.plan);
  const [paidUntil, setPaidUntil] = useState(
    clinic.paidUntil?.slice(0, 10) ?? "",
  );
  const [update, { isLoading }] = useUpdateSubscriptionMutation();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Manual subscription edit</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Plan</Label>
          <Select
            items={PLANS}
            value={plan}
            onValueChange={(v) => setPlan(v as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLANS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paidUntil">Paid until</Label>
          <Input
            id="paidUntil"
            type="date"
            value={paidUntil}
            onChange={(e) => setPaidUntil(e.target.value)}
          />
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={isLoading}
        onClick={async () => {
          try {
            await update({
              id: clinic.id,
              plan,
              // end of the chosen day, so access doesn't stop a day early
              paidUntil: paidUntil ? `${paidUntil}T23:59:59.999Z` : null,
            }).unwrap();
            toast.success("Subscription updated");
          } catch {
            toast.error("Failed to update");
          }
        }}
      >
        Save subscription
      </Button>
    </div>
  );
}

function ResetAdminPasswordForm({ clinic }: { clinic: ClinicWithCounts }) {
  const [adminId, setAdminId] = useState<string>(clinic.admins[0]?.id ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [reset, { isLoading }] = useResetAdminPasswordMutation();

  if (clinic.admins.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This clinic has no admin account.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Reset an admin's password</p>
      <Select
        items={clinic.admins.map((a) => ({
          value: a.id,
          label: `${a.firstName} ${a.lastName} (${a.email})`,
        }))}
        value={adminId}
        onValueChange={(v) => setAdminId(v as string)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {clinic.admins.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.firstName} {a.lastName} ({a.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="password"
        placeholder="Temporary password (min 8 characters)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={isLoading || newPassword.length < 8}
        onClick={async () => {
          try {
            await reset({ id: clinic.id, adminId, newPassword }).unwrap();
            toast.success(
              "Password reset. Send the temporary password to the admin.",
            );
            setNewPassword("");
          } catch {
            toast.error("Failed to reset password");
          }
        }}
      >
        Reset password
      </Button>
    </div>
  );
}

export function ManageClinicDialog({ clinic }: { clinic: ClinicWithCounts }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            Manage
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{clinic.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <PaymentReceivedForm clinic={clinic} />
          <div className="border-t pt-4">
            {/* key: remounts when the date changes, so after "+1 month" this form shows the new date */}
            <SubscriptionForm
              key={clinic.paidUntil ?? "none"}
              clinic={clinic}
            />
          </div>
          <div className="border-t pt-4">
            <ResetAdminPasswordForm clinic={clinic} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
