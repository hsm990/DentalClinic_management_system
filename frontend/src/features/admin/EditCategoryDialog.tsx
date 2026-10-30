import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateCategoryMutation } from "@/features/catalog/catalogApi";
import type { ProcedureCategory } from "@/features/catalog/catalogApi";
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
import { Pencil } from "lucide-react";

export function EditCategoryDialog({
  category,
}: {
  category: ProcedureCategory;
}) {
  const [open, setOpen] = useState(false);
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();
  const { register, handleSubmit } = useForm<{ name: string }>({
    values: { name: category.name },
  });

  async function onSubmit(values: { name: string }) {
    try {
      await updateCategory({ id: category.id, data: values }).unwrap();
      toast.success("Category updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update category");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="icon" variant="ghost" className="h-6 w-6">
            <Pencil className="h-3 w-3" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
