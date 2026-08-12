import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateStaffMutation } from "@/features/users/usersApi";
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

const ROLES = [
  { value: "DENTIST", label: "Dentist" },
  { value: "ASSISTANT", label: "Assistant" },
  { value: "RECEPTIONIST", label: "Receptionist" },
];

interface FormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function CreateStaffDialog() {
  const [open, setOpen] = useState(false);
  const [createStaff, { isLoading }] = useCreateStaffMutation();
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "",
    },
  });
  async function onSubmit(values: FormValues) {
    if (!values.role) {
      toast.error("Select a role");
      return;
    }
    try {
      await createStaff(values).unwrap();
      toast.success("Staff member added");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to add staff member");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Staff</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New staff member</DialogTitle>
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: true, minLength: 8 })}
            />
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
                    <SelectValue placeholder="Select a role" />
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
              {isLoading ? "Adding..." : "Add staff member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
