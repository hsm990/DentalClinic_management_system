import { useState } from "react";
import { useGetAppointmentsQuery } from "@/features/appointments/appointmentsApi";
import { CreateAppointmentDialog } from "@/features/appointments/CreateAppointmentDialog";
import { StatusActions } from "@/features/appointments/StatusActions";
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
} from "@/features/appointments/stateMachine";
import {
  bucketAppointments,
  filterAppointments,
  type DateFilter,
} from "@/features/appointments/dateFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function AppointmentsPage() {
  const { data: appointments, isLoading, isError } = useGetAppointmentsQuery();
  const [filter, setFilter] = useState<DateFilter>("todayAndFuture");

  const buckets = bucketAppointments(appointments ?? []);
  const filtered = filterAppointments(appointments ?? [], filter);
  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Manage the clinic schedule
          </p>
        </div>
        <CreateAppointmentDialog />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("today")}
          >
            Today
          </Button>
          <Button
            variant={filter === "todayAndFuture" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("todayAndFuture")}
          >
            Today &amp; Future
          </Button>
        </div>

        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>
            Total:{" "}
            <strong className="text-foreground">{buckets.all.length}</strong>
          </span>
          <span>·</span>
          <span>
            Today:{" "}
            <strong className="text-foreground">{buckets.today.length}</strong>
          </span>
          <span>·</span>
          <span>
            Future:{" "}
            <strong className="text-foreground">{buckets.future.length}</strong>
          </span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date &amp; time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Dentist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">
                  Failed to load appointments.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No appointments in this view.
                </TableCell>
              </TableRow>
            )}
            {sorted.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>
                  {new Date(appt.scheduledAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {appt.patient.firstName} {appt.patient.lastName}
                </TableCell>
                <TableCell>
                  Dr. {appt.dentist.firstName} {appt.dentist.lastName}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[appt.status]}>
                    {STATUS_LABELS[appt.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusActions appointment={appt} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
