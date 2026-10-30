import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import {
  useUpdateProcedureMutation,
  useGetCategoriesQuery,
} from "@/features/catalog/catalogApi";
import type { Procedure } from "@/features/catalog/catalogApi";
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

interface FormValues {
  name: string;
  price: string;
  durationMin: string;
  categoryId: string;
}

export function EditProcedureDialog({ procedure }: { procedure: Procedure }) {
  const [open, setOpen] = useState(false);
  const [updateProcedure, { isLoading }] = useUpdateProcedureMutation();
  const { data: categories } = useGetCategoriesQuery();

  const { register, control, handleSubmit } = useForm<FormValues>({
    values: {
      name: procedure.name,
      price: procedure.price,
      durationMin: String(procedure.durationMin),
      categoryId: procedure.categoryId,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateProcedure({
        id: procedure.id,
        data: {
          name: values.name,
          price: Number(values.price),
          durationMin: Number(values.durationMin),
          categoryId: values.categoryId,
        },
      }).unwrap();
      toast.success("Procedure updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update procedure");
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
          <DialogTitle>Edit procedure</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  items={
                    categories?.map((c) => ({ value: c.id, label: c.name })) ??
                    []
                  }
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMin">Duration (min)</Label>
              <Input
                id="durationMin"
                type="number"
                {...register("durationMin")}
              />
            </div>
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
