import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useAppSelector } from "@/app/hooks";
import { useGetAppointmentsQuery } from "@/features/appointments/appointmentsApi";
import { useGetPatientsQuery } from "@/features/patients/patientsApi";
import {
  useGetOutstandingSummaryQuery,
  useGetRevenueQuery,
} from "@/features/billing/billingApi";
import { StatCard } from "@/features/dashboard/StatCard";
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
} from "@/features/appointments/stateMachine";
import { CreateAppointmentDialog } from "@/features/appointments/CreateAppointmentDialog";
import { CreatePatientDialog } from "@/features/patients/CreatePatientDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  Users,
  Wallet,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const isFrontDesk = user?.role === "ADMIN" || user?.role === "RECEPTIONIST";
  const isDentist = user?.role === "DENTIST";

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
  );

  const { data: todaysAppointments, isLoading: loadingAppointments } =
    useGetAppointmentsQuery({
      from: todayStart.toISOString(),
      to: todayEnd.toISOString(),
      ...(isDentist && user ? { dentistId: user.id } : {}),
    });

  const { data: patientsPage } = useGetPatientsQuery(
    { limit: 1 },
    { skip: !isFrontDesk },
  );

  const { data: outstanding } = useGetOutstandingSummaryQuery(undefined, {
    skip: !isFrontDesk,
  });

  const { data: revenue } = useGetRevenueQuery(
    {
      from: startOfMonth(today).toISOString(),
      to: endOfMonth(today).toISOString(),
    },
    { skip: user?.role !== "ADMIN" },
  );

  const sortedToday = useMemo(
    () =>
      [...(todaysAppointments ?? [])].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    [todaysAppointments],
  );

  const checkedInCount = sortedToday.filter((a) =>
    ["CHECKED_IN", "IN_PROGRESS"].includes(a.status),
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {user?.role === "DENTIST" ? "Your day" : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(today, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <CreatePatientDialog />
          <CreateAppointmentDialog />
        </div>
      </div>

      {/* Stat cards — different set per role */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={isDentist ? "Your appointments today" : "Appointments today"}
          value={loadingAppointments ? "—" : sortedToday.length}
          icon={CalendarDays}
        />

        {isFrontDesk && (
          <>
            <StatCard
              label="Active patients"
              value={patientsPage?.pagination.total ?? "—"}
              icon={Users}
            />
            <StatCard
              label="Outstanding balance"
              value={
                outstanding
                  ? `$${outstanding.totalOutstanding.toFixed(2)}`
                  : "—"
              }
              icon={Wallet}
              tone={
                outstanding && outstanding.totalOutstanding > 0
                  ? "warning"
                  : "success"
              }
            />
          </>
        )}

        {user?.role === "ADMIN" && (
          <StatCard
            label="Revenue this month"
            value={revenue ? `$${revenue.totalRevenue.toFixed(2)}` : "—"}
            icon={TrendingUp}
            tone="success"
          />
        )}

        {!isFrontDesk && !isDentist && (
          <StatCard
            label="Checked in / in progress"
            value={checkedInCount}
            icon={Users}
          />
        )}

        {isDentist && (
          <StatCard
            label="Checked in / in progress"
            value={checkedInCount}
            icon={Users}
          />
        )}
      </div>

      {/* Today's schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {isDentist ? "Your appointments today" : "Today's schedule"}
          </CardTitle>
          <Link to="/calendar">
            <Button variant="ghost" size="sm">
              View calendar <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingAppointments && <Skeleton className="h-32 w-full" />}

          {!loadingAppointments && sortedToday.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No appointments today.
            </p>
          )}

          <div className="space-y-2">
            {sortedToday.map((appt) => (
              <div
                key={appt.id}
                className="flex cursor-pointer items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                onClick={() => navigate(`/patients/${appt.patient.id}`)}
              >
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(appt.scheduledAt), "h:mm a")} —{" "}
                    {appt.patient.firstName} {appt.patient.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDentist
                      ? ""
                      : `Dr. ${appt.dentist.firstName} ${appt.dentist.lastName} · `}
                    {appt.reason || "No reason given"}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[appt.status]}>
                  {STATUS_LABELS[appt.status]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
