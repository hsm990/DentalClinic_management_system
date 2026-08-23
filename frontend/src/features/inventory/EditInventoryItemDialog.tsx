import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateInventoryItemMutation } from "./inventoryApi";
import type { InventoryItem } from "./inventoryApi";
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

// yyyy-MM-dd is what <input type="date"> requires; incoming ISO strings
// need trimming down to just the date portion
function toDateInputValue(iso?: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

export function EditInventoryItemDialog({ item }: { item: InventoryItem }) {
  const [open, setOpen] = useState(false);
  const [updateItem, { isLoading }] = useUpdateInventoryItemMutation();

  const { register, handleSubmit } = useForm<FormValues>({
    values: {
      reference: item.reference,
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unitPrice: item.unitPrice,
      expiryDate: toDateInputValue(item.expiryDate),
      supplier: item.supplier ?? "",
      lowStockThreshold: String(item.lowStockThreshold),
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateItem({
        id: item.id,
        data: {
          reference: values.reference,
          name: values.name,
          category: values.category,
          quantity: Number(values.quantity),
          unitPrice: Number(values.unitPrice),
          expiryDate: values.expiryDate || undefined,
          supplier: values.supplier || undefined,
          lowStockThreshold: Number(values.lowStockThreshold),
        },
      }).unwrap();
      toast.success("Item updated");
      setOpen(false);
    } catch (err: any) {
      if (err?.status === 409) toast.error("Reference already exists");
      else toast.error("Failed to update item");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit inventory item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reference">Reference</Label>
              <Input
                id="edit-reference"
                {...register("reference", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                {...register("category", { required: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Article name</Label>
            <Input id="edit-name" {...register("name", { required: true })} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                {...register("quantity", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unitPrice">Unit price (DA)</Label>
              <Input
                id="edit-unitPrice"
                type="number"
                step="0.01"
                {...register("unitPrice", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lowStockThreshold">Low stock at</Label>
              <Input
                id="edit-lowStockThreshold"
                type="number"
                {...register("lowStockThreshold", { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate">Expiry date</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                {...register("expiryDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input id="edit-supplier" {...register("supplier")} />
            </div>
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
