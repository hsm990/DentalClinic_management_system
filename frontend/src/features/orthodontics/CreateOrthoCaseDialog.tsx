import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateOrthoCaseMutation } from "./orthodonticsApi";
import { useGetDentistsQuery } from "@/features/users/usersApi";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FormValues {
  applianceType: string;
  startDate: string;
  estimatedEndDate: string;
  dentistId: string;
  notes: string;
}

export function CreateOrthoCaseDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [createCase, { isLoading }] = useCreateOrthoCaseMutation();
  const { data: dentists } = useGetDentistsQuery();
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      applianceType: "",
      startDate: "",
      estimatedEndDate: "",
      dentistId: "",
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!values.applianceType || !values.startDate || !values.dentistId) {
      toast.error("Fill in required fields");
      return;
    }
    try {
      await createCase({
        patientId,
        applianceType: values.applianceType,
        startDate: values.startDate,
        estimatedEndDate: values.estimatedEndDate || undefined,
        dentistId: values.dentistId,
        notes: values.notes || undefined,
      }).unwrap();
      toast.success("Orthodontic case started");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to create case");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Start Ortho Case</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New orthodontic case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applianceType">Appliance type</Label>
            <Input
              id="applianceType"
              {...register("applianceType")}
              placeholder="e.g. Metal braces"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedEndDate">Est. end date</Label>
              <Input
                id="estimatedEndDate"
                type="date"
                {...register("estimatedEndDate")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Treating dentist</Label>
            <Controller
              name="dentistId"
              control={control}
              render={({ field }) => (
                <Select
                  items={
                    dentists?.map((d) => ({
                      value: d.id,
                      label: `Dr. ${d.firstName} ${d.lastName}`,
                    })) ?? []
                  }
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    {dentists?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        Dr. {d.firstName} {d.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={2} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Starting..." : "Start case"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
