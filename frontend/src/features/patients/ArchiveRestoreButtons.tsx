import { toast } from "sonner";
import {
  useArchivePatientMutation,
  useRestorePatientMutation,
} from "./patientsApi";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function ArchiveRestoreButtons({
  patientId,
  patientName,
  isActive,
  size = "default",
}: {
  patientId: string;
  patientName: string;
  isActive: boolean;
  size?: "default" | "sm";
}) {
  const [archivePatient, { isLoading: archiving }] =
    useArchivePatientMutation();
  const [restorePatient, { isLoading: restoring }] =
    useRestorePatientMutation();

  if (isActive) {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="outline"
              size={size}
              onClick={(e) => e.stopPropagation()}
            >
              Archive
            </Button>
          }
        />
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {patientName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This hides them from the active patient list. Their records stay
              intact, and you can restore them anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiving}
              onClick={async () => {
                try {
                  await archivePatient(patientId).unwrap();
                  toast.success("Patient archived");
                } catch {
                  toast.error("Failed to archive patient");
                }
              }}
            >
              {archiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      disabled={restoring}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await restorePatient(patientId).unwrap();
          toast.success("Patient restored");
        } catch {
          toast.error("Failed to restore patient");
        }
      }}
    >
      {restoring ? "Restoring..." : "Restore"}
    </Button>
  );
}
