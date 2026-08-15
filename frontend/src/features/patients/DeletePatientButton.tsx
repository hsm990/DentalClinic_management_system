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
}: {
  patientId: string;
  patientName: string;
}) {
  const [deletePatient, { isLoading }] = useDeletePatientMutation();
  const navigate = useNavigate();

  async function handleDelete() {
    try {
      await deletePatient(patientId).unwrap();
      toast.success("Patient deleted");
      navigate("/patients");
    } catch (err: any) {
      if (err?.status === 409) {
        toast.error("Cannot delete: this patient has billing history");
      } else {
        toast.error("Failed to delete patient");
      }
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="destructive">Delete</Button>}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {patientName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the patient record, tooth chart, and
            treatment plans. This cannot be undone.
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
