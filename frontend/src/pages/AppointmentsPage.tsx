import { useGetAppointmentsQuery } from "@/features/appointments/appointmentsApi";
import { CreateAppointmentDialog } from "@/features/appointments/CreateAppointmentDialog";
import { StatusActions } from "@/features/appointments/StatusActions";
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
} from "@/features/appointments/stateMachine";
import { Badge } from "@/components/ui/badge";
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

            {!isLoading && !isError && appointments?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No appointments yet.
                </TableCell>
              </TableRow>
            )}

            {appointments?.map((appt) => (
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
