import { useState } from "react";
import { toast } from "sonner";
import { useCreateInvoiceMutation } from "./billingApi";
import { useGetTreatmentPlansQuery } from "@/features/treatmentPlans/treatmentPlansApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateInvoiceDialogProps {
  patientId: string;
  onCreated?: (invoiceId: string) => void;
}

export function CreateInvoiceDialog({
  patientId,
  onCreated,
}: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: plans } = useGetTreatmentPlansQuery(patientId, { skip: !open });
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  // show every COMPLETED item, but tag which ones are already billed —
  // don't filter them out, just make them unselectable
  const completedItems =
    plans?.flatMap((plan) =>
      plan.items
        .filter((item) => item.status === "COMPLETED")
        .map((item) => ({
          ...item,
          planTitle: plan.title,
          alreadyBilled: !!item.invoiceItem,
        })),
    ) ?? [];

  function toggle(itemId: string, alreadyBilled: boolean) {
    if (alreadyBilled) return; // guard at the source too, not just visually
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  }

  async function handleCreate() {
    if (selected.size === 0) {
      toast.error("Select at least one item to invoice");
      return;
    }

    const items = completedItems
      .filter((item) => selected.has(item.id))
      .map((item) => ({
        procedureId: item.procedureId,
        toothNumber: item.toothNumber ?? undefined,
        quantity: 1,
        treatmentPlanItemId: item.id,
      }));

    try {
      const invoice = await createInvoice({ patientId, items }).unwrap();
      toast.success(`Invoice #${invoice.invoiceNumber} created`);
      setSelected(new Set());
      setOpen(false);
      onCreated?.(invoice.id);
    } catch (err: any) {
      if (err?.status === 409) {
        toast.error(
          "One of these items was already billed — refresh and try again",
        );
      } else {
        toast.error("Failed to create invoice");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Create Invoice</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
        </DialogHeader>

        {completedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No completed treatment items yet. Mark items as Completed on a
            treatment plan first.
          </p>
        ) : (
          <div className="space-y-2">
            {completedItems.map((item) => (
              <label
                key={item.id}
                className={`flex items-center justify-between rounded-md border p-3 text-sm ${
                  item.alreadyBilled
                    ? "cursor-not-allowed bg-muted/40 opacity-60"
                    : "cursor-pointer hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.has(item.id)}
                    disabled={item.alreadyBilled}
                    onCheckedChange={() => toggle(item.id, item.alreadyBilled)}
                  />
                  <div>
                    <p className="font-medium">{item.procedure.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.planTitle}
                      {item.toothNumber ? ` · Tooth ${item.toothNumber}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>${item.procedure.price}</span>
                  {item.alreadyBilled && (
                    <Badge variant="secondary">Billed</Badge>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={isLoading || selected.size === 0}
          >
            {isLoading
              ? "Creating..."
              : `Create invoice (${selected.size} item${selected.size === 1 ? "" : "s"})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
