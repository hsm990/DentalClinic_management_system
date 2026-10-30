import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useOnboardClinicMutation } from "@/features/clinic/clinicApi";
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

interface FormValues {
  clinicName: string;
  address: string;
  phone: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  password: string;
}

interface OnboardClinicDialogProps {
  trigger?: React.ReactNode;
  prefill?: {
    clinicName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
  };
}

export function OnboardClinicDialog({
  trigger,
  prefill,
}: OnboardClinicDialogProps) {
  const [open, setOpen] = useState(false);
  const [onboardClinic, { isLoading }] = useOnboardClinicMutation();

  const [firstName = "", ...rest] = (prefill?.contactName ?? "").split(" ");
  const lastName = rest.join(" ");

  const { register, handleSubmit, reset } = useForm<FormValues>({
    values: {
      clinicName: prefill?.clinicName ?? "",
      address: "",
      phone: prefill?.phone ?? "",
      adminEmail: prefill?.email ?? "",
      adminFirstName: firstName,
      adminLastName: lastName,
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await onboardClinic({
        clinic: {
          name: values.clinicName,
          address: values.address || undefined,
          phone: values.phone || undefined,
        },
        admin: {
          email: values.adminEmail,
          password: values.password,
          firstName: values.adminFirstName,
          lastName: values.adminLastName,
        },
      }).unwrap();
      toast.success("Clinic onboarded");
      reset();
      setOpen(false);
    } catch (err: any) {
      if (err?.status === 409)
        toast.error("That admin email is already in use");
      else toast.error("Failed to onboard clinic");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button>Add clinic</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Onboard a new clinic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic name</Label>
            <Input
              id="clinicName"
              {...register("clinicName", { required: true })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium">Clinic admin account</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminFirstName">First name</Label>
                <Input
                  id="adminFirstName"
                  {...register("adminFirstName", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminLastName">Last name</Label>
                <Input
                  id="adminLastName"
                  {...register("adminLastName", { required: true })}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                {...register("adminEmail", { required: true })}
              />
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="password">Temporary password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: true, minLength: 8 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Onboard clinic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
