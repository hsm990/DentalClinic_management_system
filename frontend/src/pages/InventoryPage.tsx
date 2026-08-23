import { toast } from "sonner";
import { format } from "date-fns";
import {
  useGetInventoryQuery,
  useAdjustQuantityMutation,
  useDeleteInventoryItemMutation,
} from "@/features/inventory/inventoryApi";
import { CreateInventoryItemDialog } from "@/features/inventory/CreateInventoryItemDialog";
import { STATUS_LABELS, STATUS_VARIANT } from "@/features/inventory/constants";
import { useAppSelector } from "@/app/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EditInventoryItemDialog } from "@/features/inventory/EditInventoryItemDialog";

import { Trash2, Minus, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function InventoryPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: items, isLoading } = useGetInventoryQuery();
  const [adjustQuantity] = useAdjustQuantityMutation();
  const [deleteItem] = useDeleteInventoryItemMutation();
  const canManage = user?.role === "ADMIN";
  const canAdjust = user?.role === "ADMIN" || user?.role === "ASSISTANT";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Stock, supplies, and equipment
          </p>
        </div>
        {canManage && <CreateInventoryItemDialog />}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit price</TableHead>
              <TableHead>Date added</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={10}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && items?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground"
                >
                  No items yet.
                </TableCell>
              </TableRow>
            )}

            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">
                  {item.reference}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {canAdjust && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={async () => {
                          try {
                            await adjustQuantity({
                              id: item.id,
                              delta: -1,
                            }).unwrap();
                          } catch {
                            toast.error("Failed to update quantity");
                          }
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                    <span className="w-6 text-center">{item.quantity}</span>
                    {canAdjust && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={async () => {
                          try {
                            await adjustQuantity({
                              id: item.id,
                              delta: 1,
                            }).unwrap();
                          } catch {
                            toast.error("Failed to update quantity");
                          }
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.unitPrice} DA</TableCell>
                <TableCell>
                  {format(new Date(item.dateAdded), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {item.expiryDate
                    ? format(new Date(item.expiryDate), "dd/MM/yyyy")
                    : "—"}
                </TableCell>
                <TableCell>{item.supplier || "—"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[item.status]}>
                    {STATUS_LABELS[item.status]}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell>
                    <div className="flex gap-1">
                      <EditInventoryItemDialog item={item} />
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete {item.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await deleteItem(item.id).unwrap();
                                  toast.success("Item deleted");
                                } catch {
                                  toast.error("Failed to delete");
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
