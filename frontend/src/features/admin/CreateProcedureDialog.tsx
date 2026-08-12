// src/features/admin/CreateProcedureDialog.tsx
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateProcedureMutation,
  useGetCategoriesQuery,
} from "@/features/catalog/catalogApi";
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
  name: string;
  price: string;
  durationMin: string;
  categoryId: string;
}

export function CreateProcedureDialog() {
  const [open, setOpen] = useState(false);
  const [createProcedure, { isLoading }] = useCreateProcedureMutation();
  const { data: categories } = useGetCategoriesQuery();
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { name: "", price: "", durationMin: "", categoryId: "" },
  });
  async function onSubmit(values: FormValues) {
    if (!values.categoryId || !values.price) {
      toast.error("Fill in required fields");
      return;
    }
    try {
      await createProcedure({
        name: values.name,
        price: Number(values.price),
        durationMin: values.durationMin
          ? Number(values.durationMin)
          : undefined,
        categoryId: values.categoryId,
      }).unwrap();
      toast.success("Procedure added");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to add procedure");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Add procedure</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New procedure</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="e.g. Root Canal"
            />
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
                    <SelectValue placeholder="Select a category" />
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
                placeholder="30"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add procedure"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
