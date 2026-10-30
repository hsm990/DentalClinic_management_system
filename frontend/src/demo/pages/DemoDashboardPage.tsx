import { format } from "date-fns";
import { useDemoData } from "../DemoDataContext";
import { StatCard } from "@/features/dashboard/StatCard";
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
} from "@/features/appointments/stateMachine";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, Wallet } from "lucide-react";

export function DemoDashboardPage() {
  const { patients, appointments, invoices } = useDemoData();

  const todays = appointments.filter((a) => {
    const d = new Date(a.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const outstanding = invoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, inv.total - paid);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Appointments today"
          value={todays.length}
          icon={CalendarDays}
        />
        <StatCard
          label="Active patients"
          value={patients.filter((p) => p.isActive).length}
          icon={Users}
        />
        <StatCard
          label="Outstanding"
          value={`${outstanding.toLocaleString()} DA`}
          icon={Wallet}
          tone={outstanding > 0 ? "warning" : "success"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todays.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No appointments today.
            </p>
          )}
          {todays.map((a) => {
            const patient = patients.find((p) => p.id === a.patientId);
            return (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(a.scheduledAt), "h:mm a")} —{" "}
                    {patient?.firstName} {patient?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.dentistName} · {a.reason}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[a.status]}>
                  {STATUS_LABELS[a.status]}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
