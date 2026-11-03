import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { useDemoData } from "../DemoDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Banknote, CalendarClock, Wallet } from "lucide-react";
import { StatCard } from "@/features/dashboard/StatCard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPENSE_CATEGORIES = [
  "Rent",
  "Salaries",
  "Supplies",
  "Equipment",
  "Utilities",
  "Other",
];

const fmtDA = (n: number) =>
  `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} DA`;

export function DemoFinancePage() {
  const { invoices, expenses, addExpense } = useDemoData();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Supplies");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const collected = invoices.reduce(
    (sum, inv) => sum + inv.payments.reduce((s, p) => s + p.amount, 0),
    0,
  );
  const billed = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstanding = billed - collected;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    addExpense({
      category,
      amount: value,
      date: new Date().toISOString(),
      note: note.trim() || undefined,
    });
    setAmount("");
    setNote("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Finance</h1>
          <p className="text-sm text-muted-foreground">
            Quick revenue continuation — reflects what you did in Patients &
            Billing
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Add expense</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Amount (DA)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Save expense
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Collected" value={fmtDA(collected)} icon={Banknote} />
        <StatCard
          label="Outstanding"
          value={fmtDA(outstanding)}
          icon={CalendarClock}
        />
        <StatCard label="Expenses" value={fmtDA(totalExpenses)} icon={Wallet} />
      </div>

      <p className="text-sm text-muted-foreground">
        Net: {fmtDA(collected - totalExpenses)}
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-sm text-muted-foreground"
                >
                  No expenses yet.
                </TableCell>
              </TableRow>
            )}
            {[...expenses]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{format(new Date(e.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.note ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {fmtDA(e.amount)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
