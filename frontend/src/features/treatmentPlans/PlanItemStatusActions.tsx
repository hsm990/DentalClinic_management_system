import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdatePlanItemStatusMutation } from "./treatmentPlansApi";
import { getNextItemStatuses, ITEM_STATUS_LABELS } from "./stateMachine";
import type { TreatmentPlanItem } from "./treatmentPlansApi";

export function PlanItemStatusActions({
  item,
  patientId,
}: {
  item: TreatmentPlanItem;
  patientId: string;
}) {
  const [updateStatus, { isLoading }] = useUpdatePlanItemStatusMutation();
  const nextStatuses = getNextItemStatuses(item.status);

  if (nextStatuses.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex gap-1.5">
      {nextStatuses.map((status) => (
        <Button
          key={status}
          size="sm"
          variant={status === "CANCELLED" ? "outline" : "default"}
          disabled={isLoading}
          onClick={async () => {
            try {
              await updateStatus({
                itemId: item.id,
                patientId,
                status,
              }).unwrap();
              toast.success(`Marked as ${ITEM_STATUS_LABELS[status]}`);
            } catch {
              toast.error("Could not update status");
            }
          }}
        >
          {ITEM_STATUS_LABELS[status]}
        </Button>
      ))}
    </div>
  );
}
