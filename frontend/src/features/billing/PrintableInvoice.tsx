import type { Invoice } from "./billingApi";

interface PrintableInvoiceProps {
  invoice: Invoice;
  clinicName: string;
  patientName: string;
}

export function PrintableInvoice({
  invoice,
  clinicName,
  patientName,
}: PrintableInvoiceProps) {
  const totalPaid = invoice.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  );
  const remaining = Number(invoice.total) - totalPaid;

  return (
    <div
      id="invoice-print-area"
      className="hidden print:block bg-white p-8 text-black"
    >
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{clinicName}</h1>
          <p className="text-sm text-gray-600">
            Invoice #{invoice.invoiceNumber}
          </p>
        </div>
        <div className="text-right text-sm">
          <p>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
          <p>Patient: {patientName}</p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2">Item</th>
            <th className="py-2">Tooth</th>
            <th className="py-2">Qty</th>
            <th className="py-2 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">Procedure</td>
              <td className="py-2">{item.toothNumber ?? "—"}</td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2 text-right">${item.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${invoice.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-${invoice.discount}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-bold">
            <span>Total</span>
            <span>${invoice.total}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid</span>
            <span>${totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Balance due</span>
            <span>${remaining.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div className="mt-6">
          <p className="mb-1 text-sm font-semibold">Payment history</p>
          {invoice.payments.map((p) => (
            <div
              key={p.id}
              className="flex justify-between text-sm text-gray-600"
            >
              <span>
                {new Date(p.paidAt).toLocaleDateString()} — {p.method}
              </span>
              <span>${p.amount}</span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-gray-500">
        Thank you for visiting {clinicName}.
      </p>
    </div>
  );
}
