import { format } from "date-fns";
import { useDemoData } from "../DemoDataContext";
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
  getNextStatuses,
} from "@/features/appointments/stateMachine";
import type { AppointmentStatus } from "@/features/appointments/appointmentsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function DemoAppointmentsPage() {
  const { appointments, patients, updateAppointmentStatus } = useDemoData();
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Walk one through its real states — nothing here is saved
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Dentist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((a) => {
              const patient = patients.find((p) => p.id === a.patientId);
              const nextStatuses = getNextStatuses(a.status);
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    {format(new Date(a.scheduledAt), "h:mm a")}
                  </TableCell>
                  <TableCell>
                    {patient?.firstName} {patient?.lastName}
                  </TableCell>
                  <TableCell>{a.dentistName}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[a.status]}>
                      {STATUS_LABELS[a.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-1.5">
                    {nextStatuses.length === 0 && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                    {nextStatuses.map((s: AppointmentStatus) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(a.id, s)}
                      >
                        {STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
