import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useAddPlanItemMutation } from "./treatmentPlansApi";
import { useGetProceduresQuery } from "@/features/catalog/catalogApi";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FormValues {
  procedureId: string;
  toothNumber: string;
  estimatedCost: string;
}

export function AddPlanItemDialog({
  planId,
  patientId,
}: {
  planId: string;
  patientId: string;
}) {
  const [open, setOpen] = useState(false);
  const [addItem, { isLoading }] = useAddPlanItemMutation();
  const { data: procedures } = useGetProceduresQuery();

  const { register, control, handleSubmit, reset, setValue, watch } =
    useForm<FormValues>({
      defaultValues: { procedureId: "", toothNumber: "", estimatedCost: "" },
    });

  async function onSubmit(values: FormValues) {
    if (!values.procedureId || !values.estimatedCost || !values.toothNumber) {
      toast.error("Select a procedure, tooth, and cost");
      return;
    }
    const toothNum = Number(values.toothNumber);
    const quadrant = Math.floor(toothNum / 10);
    const position = toothNum % 10;
    if (quadrant < 1 || quadrant > 4 || position < 1 || position > 8) {
      toast.error("Invalid tooth number (expected 11-18, 21-28, 31-38, 41-48)");
      return;
    }
    try {
      await addItem({
        planId,
        patientId,
        procedureId: values.procedureId,
        toothNumber: Number(values.toothNumber),
        estimatedCost: Number(values.estimatedCost),
      }).unwrap();
      toast.success("Item added");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to add item");
    }
  }

  const selectedProcedureId = watch("procedureId");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Add item</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add treatment item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Procedure</Label>
            <Controller
              name="procedureId"
              control={control}
              render={({ field }) => (
                <Select
                  items={
                    procedures?.map((p) => ({
                      value: p.id,
                      label: `${p.name} — $${p.price}`,
                    })) ?? []
                  }
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    const proc = procedures?.find((p) => p.id === v);
                    if (proc) setValue("estimatedCost", proc.price);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a procedure" />
                  </SelectTrigger>
                  <SelectContent>
                    {procedures?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${p.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="toothNumber">Tooth (optional)</Label>
              <Input
                id="toothNumber"
                type="number"
                {...register("toothNumber")}
                placeholder="e.g. 36"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Cost</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                {...register("estimatedCost")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !selectedProcedureId}>
              {isLoading ? "Adding..." : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
