import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdateAppointmentStatusMutation } from "./appointmentsApi";
import { getNextStatuses, STATUS_LABELS } from "./stateMachine";
import type { Appointment } from "./appointmentsApi";

export function StatusActions({ appointment }: { appointment: Appointment }) {
  const [updateStatus, { isLoading }] = useUpdateAppointmentStatusMutation();
  const nextStatuses = getNextStatuses(appointment.status);

  async function handleTransition(status: (typeof nextStatuses)[number]) {
    try {
      await updateStatus({ id: appointment.id, status }).unwrap();
      toast.success(`Marked as ${STATUS_LABELS[status]}`);
    } catch {
      toast.error("Could not update status");
    }
  }

  if (nextStatuses.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">No further actions</span>
    );
  }

  return (
    <div className="flex gap-2">
      {nextStatuses.map((status) => (
        <Button
          key={status}
          size="sm"
          variant={
            status === "CANCELLED" || status === "NO_SHOW"
              ? "outline"
              : "default"
          }
          disabled={isLoading}
          onClick={() => handleTransition(status)}
        >
          {STATUS_LABELS[status]}
        </Button>
      ))}
    </div>
  );
}
