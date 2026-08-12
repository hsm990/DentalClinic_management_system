import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateTreatmentPlanMutation } from "./treatmentPlansApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function CreatePlanDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [createPlan, { isLoading }] = useCreateTreatmentPlanMutation();
  const { register, handleSubmit, reset } = useForm<{ title: string }>();

  async function onSubmit(values: { title: string }) {
    if (!values.title) {
      toast.error("Enter a title");
      return;
    }
    try {
      await createPlan({ patientId, title: values.title }).unwrap();
      toast.success("Treatment plan created");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to create plan");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>New plan</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New treatment plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g. Root canal + crown, tooth 36"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
