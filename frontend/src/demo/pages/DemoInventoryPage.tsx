import { useState, type FormEvent } from "react";
import { useDemoData } from "../DemoDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DemoInventoryPage() {
  const { stockItems, adjustStock, addStockItem } = useDemoData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const lowCount = stockItems.filter(
    (i) => i.quantity < i.minQuantity,
  ).length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unit.trim()) return;
    addStockItem({
      name,
      unit,
      quantity: Math.max(0, Number(quantity) || 0),
      minQuantity: Math.max(0, Number(minQuantity) || 0),
    });
    setName("");
    setQuantity("");
    setMinQuantity("");
    setUnit("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Track stock levels — try adjusting quantities
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Add item</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New stock item</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <Input
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Unit (e.g. boxes)"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Current quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Low stock threshold"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Save item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lowCount > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400">
          {lowCount} item{lowCount === 1 ? " is" : "s are"} below the low-stock
          threshold.
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockItems.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Min: {i.minQuantity} {i.unit}
                  </p>
                </TableCell>
                <TableCell>
                  {i.quantity < i.minQuantity ? (
                    <Badge variant="destructive">Low</Badge>
                  ) : (
                    <Badge variant="secondary">OK</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {i.quantity} {i.unit}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustStock(i.id, -1)}
                    >
                      −
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustStock(i.id, +1)}
                    >
                      +
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
