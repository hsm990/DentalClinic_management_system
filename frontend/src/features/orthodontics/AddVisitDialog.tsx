import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useAddOrthoVisitMutation } from "./orthodonticsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface FormValues {
  notes: string;
  nextVisitDate: string;
}

export function AddVisitDialog({
  caseId,
  patientId,
}: {
  caseId: string;
  patientId: string;
}) {
  const [open, setOpen] = useState(false);
  const [addVisit, { isLoading }] = useAddOrthoVisitMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { notes: "", nextVisitDate: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!values.notes) {
      toast.error("Add a note for this visit");
      return;
    }
    try {
      await addVisit({
        caseId,
        patientId,
        notes: values.notes,
        nextVisitDate: values.nextVisitDate || undefined,
      }).unwrap();
      toast.success("Visit logged");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to log visit");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Log visit</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log follow-up visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">What was done</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              rows={3}
              placeholder="e.g. Adjusted wire tension, replaced elastics"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextVisitDate">Next visit (optional)</Label>
            <Input
              id="nextVisitDate"
              type="date"
              {...register("nextVisitDate")}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Log visit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
