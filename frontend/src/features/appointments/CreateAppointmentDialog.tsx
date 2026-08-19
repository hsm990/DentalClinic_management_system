import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateAppointmentMutation } from "./appointmentsApi";
import { useGetPatientsQuery } from "@/features/patients/patientsApi";
import { useGetDentistsQuery } from "@/features/users/usersApi";
import { appointmentFormSchema, type AppointmentFormValues } from "./schema";
import { DateTimePicker } from "@/components/DateTimePicker";
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

export function CreateAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const { data: patients } = useGetPatientsQuery();
  const { data: dentists } = useGetDentistsQuery();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });

  async function onSubmit(values: AppointmentFormValues) {
    try {
      await createAppointment({
        ...values,
        scheduledAt: values.scheduledAt.toISOString(),
        reason: values.reason || undefined,
      }).unwrap();
      toast.success("Appointment booked");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to book appointment");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Book Appointment</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Controller
              name="patientId"
              control={control}
              render={({ field }) => (
                <Select
                  items={
                    patients?.patients.map((p) => ({
                      value: p.id,
                      label: `${p.firstName} ${p.lastName}`,
                    })) ?? []
                  }
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.patientId && (
              <p className="text-sm text-destructive">
                {errors.patientId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Dentist</Label>
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
                  onValueChange={field.onChange}
                  value={field.value}
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
            {errors.dentistId && (
              <p className="text-sm text-destructive">
                {errors.dentistId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date &amp; time</Label>
            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <DateTimePicker value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.scheduledAt && (
              <p className="text-sm text-destructive">
                {errors.scheduledAt.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              {...register("reason")}
              placeholder="e.g. Checkup"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Booking..." : "Book appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
