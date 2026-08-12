import { useGetInvoiceQuery } from "./billingApi";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_VARIANT } from "./constants";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const { data: invoice, isLoading } = useGetInvoiceQuery(invoiceId);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!invoice) return null;

  const totalPaid = invoice.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  );
  const remaining = Number(invoice.total) - totalPaid;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
          {INVOICE_STATUS_LABELS[invoice.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Tooth</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>Procedure</TableCell>
                <TableCell>{item.toothNumber ?? "—"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-right">${item.totalPrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Separator />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${invoice.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>-${invoice.discount}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${invoice.total}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Paid</span>
            <span>${totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Remaining</span>
            <span>${remaining.toFixed(2)}</span>
          </div>
        </div>

        {invoice.payments.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium">Payment history</p>
              <div className="space-y-1">
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <span>
                      {new Date(p.paidAt).toLocaleDateString()} · {p.method}
                    </span>
                    <span>${p.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {remaining > 0 && (
          <div className="pt-2">
            <RecordPaymentDialog invoiceId={invoice.id} remaining={remaining} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
