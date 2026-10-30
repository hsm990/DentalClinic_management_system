import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateExpenseMutation } from "@/features/expenses/expensesApi";
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
  category: string;
  amount: string;
  date: string;
  notes: string;
}

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [createExpense, { isLoading }] = useCreateExpenseMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { category: "", amount: "", date: "", notes: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!values.category || !values.amount || !values.date) {
      toast.error("Fill in required fields");
      return;
    }
    try {
      await createExpense({
        category: values.category,
        amount: Number(values.amount),
        date: values.date,
        notes: values.notes || undefined,
      }).unwrap();
      toast.success("Expense added");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to add expense");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Expense</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="e.g. Rent, Salaries, Supplies"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
