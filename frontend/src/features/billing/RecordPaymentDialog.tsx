import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useRecordPaymentMutation } from "./billingApi";
import { PAYMENT_METHODS } from "./constants";
import type { PaymentMethod } from "./billingApi";
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
  amount: string;
  method: PaymentMethod | "";
}

export function RecordPaymentDialog({
  invoiceId,
  patientId,
  remaining,
}: {
  invoiceId: string;
  patientId: string;
  remaining: number;
}) {
  const [open, setOpen] = useState(false);
  const [recordPayment, { isLoading }] = useRecordPaymentMutation();
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { amount: "", method: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!values.method || !values.amount) {
      toast.error("Fill in all fields");
      return;
    }
    try {
      await recordPayment({
        invoiceId,
        patientId,
        amount: Number(values.amount),
        method: values.method as PaymentMethod,
      }).unwrap();
      toast.success("Payment recorded");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to record payment");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Record Payment</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Remaining balance: ${remaining.toFixed(2)}
          </p>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label>Method</Label>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <Select
                  items={PAYMENT_METHODS}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
