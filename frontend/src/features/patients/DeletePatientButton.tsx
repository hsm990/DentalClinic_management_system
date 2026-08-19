import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDeletePatientMutation } from "./patientsApi";
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

export function DeletePatientButton({
  patientId,
  patientName,
  size = "default",
  redirectOnDelete = false,
}: {
  patientId: string;
  patientName: string;
  size?: "default" | "sm";
  redirectOnDelete?: boolean;
}) {
  const [deletePatient, { isLoading }] = useDeletePatientMutation();
  const navigate = useNavigate();

  async function handleDelete() {
    try {
      await deletePatient(patientId).unwrap();
      toast.success("Patient deleted");
      if (redirectOnDelete) navigate("/patients");
    } catch (err: any) {
      if (err?.status === 409) {
        toast.error(
          "Cannot delete: this patient has clinical or billing history. Archive instead.",
        );
      } else {
        toast.error("Failed to delete patient");
      }
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            size={size}
            onClick={(e) => e.stopPropagation()}
          >
            Delete
          </Button>
        }
      />
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {patientName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the patient record. Only possible if they
            have no appointments, treatment plans, or invoices — otherwise,
            archive them instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
