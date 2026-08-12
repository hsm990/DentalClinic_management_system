// src/features/admin/CreateCategoryDialog.tsx
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateCategoryMutation } from "@/features/catalog/catalogApi";
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

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const { register, handleSubmit, reset } = useForm<{ name: string }>();

  async function onSubmit(values: { name: string }) {
    if (!values.name) return;
    try {
      await createCategory(values).unwrap();
      toast.success("Category added");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to add category");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            Add category
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="e.g. Preventive"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
