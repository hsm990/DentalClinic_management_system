import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateStaffMutation } from "@/features/users/usersApi";
import type { StaffMember } from "@/features/users/usersApi";
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
import { Pencil } from "lucide-react";

const ROLES = [
  { value: "DENTIST", label: "Dentist" },
  { value: "ASSISTANT", label: "Assistant" },
  { value: "RECEPTIONIST", label: "Receptionist" },
];

interface FormValues {
  firstName: string;
  lastName: string;
  role: string;
}

export function EditStaffDialog({ staff }: { staff: StaffMember }) {
  const [open, setOpen] = useState(false);
  const [updateStaff, { isLoading }] = useUpdateStaffMutation();

  const { register, control, handleSubmit } = useForm<FormValues>({
    values: {
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateStaff({ id: staff.id, data: values as any }).unwrap();
      toast.success("Staff member updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="icon" variant="ghost" className="h-7 w-7">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit staff member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                {...register("firstName", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                {...register("lastName", { required: true })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  items={ROLES}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
