import { toast } from "sonner";
import {
  useSetClinicActiveMutation,
  type ClinicWithCounts,
} from "@/features/clinic/clinicApi";
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

export function SuspendClinicButton({ clinic }: { clinic: ClinicWithCounts }) {
  const [setActive, { isLoading }] = useSetClinicActiveMutation();
  const suspending = clinic.isActive;

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button size="sm" variant={suspending ? "destructive" : "outline"}>
            {suspending ? "Suspend" : "Reactivate"}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {suspending ? "Suspend" : "Reactivate"} {clinic.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {suspending
              ? "No one at this clinic will be able to sign in. People already signed in are logged out within about 15 minutes. Their data is untouched."
              : "Staff at this clinic will be able to sign in again."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={async () => {
              try {
                await setActive({
                  id: clinic.id,
                  isActive: !clinic.isActive,
                }).unwrap();
                toast.success(
                  suspending ? "Clinic suspended" : "Clinic reactivated",
                );
              } catch {
                toast.error("Failed to update clinic");
              }
            }}
          >
            {suspending ? "Suspend" : "Reactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
