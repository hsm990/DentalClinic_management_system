import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateTaskMutation } from "./tasksApi";
import { useGetStaffQuery } from "@/features/users/usersApi";
import { ROLES } from "./constants";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormValues {
  title: string;
  description: string;
  dueDate: string;
  targetType: "USER" | "ROLE" | "CLINIC";
  targetUserId: string;
  targetRole: string;
}

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: staff } = useGetStaffQuery();

  const { register, control, handleSubmit, reset, watch } = useForm<FormValues>(
    {
      defaultValues: {
        title: "",
        description: "",
        dueDate: "",
        targetType: "CLINIC",
        targetUserId: "",
        targetRole: "",
      },
    },
  );

  const targetType = watch("targetType");

  async function onSubmit(values: FormValues) {
    if (targetType === "USER" && !values.targetUserId) {
      toast.error("Select a person");
      return;
    }
    if (targetType === "ROLE" && !values.targetRole) {
      toast.error("Select a role");
      return;
    }

    try {
      await createTask({
        title: values.title,
        description: values.description || undefined,
        dueDate: values.dueDate || undefined,
        targetType: values.targetType,
        targetUserId:
          values.targetType === "USER" ? values.targetUserId : undefined,
        targetRole:
          values.targetType === "ROLE" ? values.targetRole : undefined,
      }).unwrap();
      toast.success("Task added");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to create task");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Task</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="e.g. Fix sterilizer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Details</Label>
            <Textarea id="description" {...register("description")} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date (optional)</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          <div className="space-y-3">
            <Label>Assign to</Label>
            <Controller
              name="targetType"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="CLINIC" /> Everyone in the clinic
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="ROLE" /> A specific role
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="USER" /> A specific person
                  </label>
                </RadioGroup>
              )}
            />

            {targetType === "ROLE" && (
              <Controller
                name="targetRole"
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
            )}

            {targetType === "USER" && (
              <Controller
                name="targetUserId"
                control={control}
                render={({ field }) => (
                  <Select
                    items={
                      staff?.map((s) => ({
                        value: s.id,
                        label: `${s.firstName} ${s.lastName} (${s.role})`,
                      })) ?? []
                    }
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a person" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
