import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreatePrescriptionMutation } from "./prescriptionsApi";
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
import { Plus, X } from "lucide-react";

interface FormValues {
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  instructions: string;
}

export function CreatePrescriptionDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [createPrescription, { isLoading }] = useCreatePrescriptionMutation();

  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
      instructions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  async function onSubmit(values: FormValues) {
    const medications = values.medications.filter(
      (m) => m.name && m.dosage && m.frequency,
    );
    if (medications.length === 0) {
      toast.error("Add at least one complete medication");
      return;
    }
    try {
      await createPrescription({
        patientId,
        medications,
        instructions: values.instructions || undefined,
      }).unwrap();
      toast.success("Prescription written");
      reset();
      setOpen(false);
    } catch (err: any) {
      if (err?.status === 403)
        toast.error("Only a dentist can write prescriptions");
      else toast.error("Failed to create prescription");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">New prescription</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Write prescription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Medication {index + 1}
                  </Label>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Medication name"
                    {...register(`medications.${index}.name`)}
                  />
                  <Input
                    placeholder="Dosage (e.g. 500mg)"
                    {...register(`medications.${index}.dosage`)}
                  />
                  <Input
                    placeholder="Frequency (e.g. 3x/day)"
                    {...register(`medications.${index}.frequency`)}
                  />
                  <Input
                    placeholder="Duration (e.g. 5 days)"
                    {...register(`medications.${index}.duration`)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ name: "", dosage: "", frequency: "", duration: "" })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add medication
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Additional instructions</Label>
            <Textarea
              id="instructions"
              {...register("instructions")}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
