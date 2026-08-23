import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateInventoryItemMutation } from "./inventoryApi";
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
  reference: string;
  name: string;
  category: string;
  quantity: string;
  unitPrice: string;
  expiryDate: string;
  supplier: string;
  lowStockThreshold: string;
}

export function CreateInventoryItemDialog() {
  const [open, setOpen] = useState(false);
  const [createItem, { isLoading }] = useCreateInventoryItemMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      reference: "",
      name: "",
      category: "",
      quantity: "0",
      unitPrice: "",
      expiryDate: "",
      supplier: "",
      lowStockThreshold: "5",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createItem({
        reference: values.reference,
        name: values.name,
        category: values.category,
        quantity: Number(values.quantity),
        unitPrice: Number(values.unitPrice),
        expiryDate: values.expiryDate || undefined,
        supplier: values.supplier || undefined,
        lowStockThreshold: values.lowStockThreshold
          ? Number(values.lowStockThreshold)
          : undefined,
      }).unwrap();
      toast.success("Item added");
      reset();
      setOpen(false);
    } catch (err: any) {
      if (err?.status === 409) toast.error("Reference already exists");
      else toast.error("Failed to add item");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Item</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New inventory item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                {...register("reference", { required: true })}
                placeholder="e.g. COMP-A2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register("category", { required: true })}
                placeholder="e.g. Consumable"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Article name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit price (DA)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                {...register("unitPrice", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low stock at</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                {...register("lowStockThreshold")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry date</Label>
              <Input id="expiryDate" type="date" {...register("expiryDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                {...register("supplier")}
                placeholder="e.g. Dental Algérie"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
