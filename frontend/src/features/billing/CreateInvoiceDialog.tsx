import { useState } from "react";
import { toast } from "sonner";
import { useCreateInvoiceMutation } from "./billingApi";
import { useGetTreatmentPlansQuery } from "@/features/treatmentPlans/treatmentPlansApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

  // only COMPLETED items with no linked invoice item yet are billable —
  // mirrors the exact rule your backend service enforces
  const billableItems =
    plans?.flatMap((plan) =>
      plan.items
        .filter((item) => item.status === "COMPLETED")
        .map((item) => ({ ...item, planTitle: plan.title })),
    ) ?? [];

  function toggle(itemId: string) {
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

    const items = billableItems
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
      // your backend returns 409 specifically for an already-billed item —
      // surface that distinction rather than a generic failure message
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

        {billableItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No completed treatment items are ready to bill. Mark items as
            Completed on a treatment plan first.
          </p>
        ) : (
          <div className="space-y-2">
            {billableItems.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.has(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                  />
                  <div>
                    <p className="font-medium">{item.procedure.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.planTitle}
                      {item.toothNumber ? ` · Tooth ${item.toothNumber}` : ""}
                    </p>
                  </div>
                </div>
                <span>${item.procedure.price}</span>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={isLoading || billableItems.length === 0}
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
