import { apiSlice } from "@/lib/apiBaseQuery";

export type InvoiceStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "REFUNDED";
export type PaymentMethod = "CASH" | "CARD" | "MOBILE_PAYMENT" | "OTHER";

export interface InvoiceItem {
  id: string;
  toothNumber?: number | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  procedureId: string;
}

export interface Payment {
  id: string;
  amount: string;
  method: PaymentMethod;
  paidAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: number;
  status: InvoiceStatus;
  subtotal: string;
  discount: string;
  total: string;
  patientId: string;
  createdAt: string;
  items: InvoiceItem[];
  payments: Payment[];
}

interface InvoiceResponse {
  invoice: Invoice;
}
interface PaymentResponse {
  payment: Payment;
}

export const billingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoice: builder.query<Invoice, string>({
      query: (id) => `/invoices/${id}`,
      transformResponse: (r: InvoiceResponse) => r.invoice,
      providesTags: (_r, _e, id) => [{ type: "Invoice", id }],
    }),
    getPatientInvoices: builder.query<Invoice[], string>({
      query: (patientId) => `/patients/${patientId}/invoices`,
      transformResponse: (r: { invoices: Invoice[] }) => r.invoices,
      providesTags: (result, _e, patientId) =>
        result
          ? [
              ...result.map((i) => ({ type: "Invoice" as const, id: i.id })),
              { type: "Invoice", id: `PATIENT-${patientId}` },
            ]
          : [{ type: "Invoice", id: `PATIENT-${patientId}` }],
    }),
    createInvoice: builder.mutation<
      Invoice,
      {
        patientId: string;
        discount?: number;
        notes?: string;
        items: {
          procedureId: string;
          toothNumber?: number;
          quantity: number;
          treatmentPlanItemId?: string;
        }[];
      }
    >({
      query: ({ patientId, ...body }) => ({
        url: `/patients/${patientId}/invoices`,
        method: "POST",
        body,
      }),
      transformResponse: (r: InvoiceResponse) => r.invoice,
      // creating an invoice can mark treatment-plan items as billed, so
      // invalidate that patient's plans too, not just the invoice itself
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "TreatmentPlan", id: patientId },
      ],
    }),

    recordPayment: builder.mutation<
      Payment,
      {
        invoiceId: string;
        amount: number;
        method: PaymentMethod;
        notes?: string;
      }
    >({
      query: ({ invoiceId, ...body }) => ({
        url: `/invoices/${invoiceId}/payments`,
        method: "POST",
        body,
      }),
      transformResponse: (r: PaymentResponse) => r.payment,
      invalidatesTags: (_r, _e, { invoiceId }) => [
        { type: "Invoice", id: invoiceId },
      ],
    }),
  }),
});

export const {
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useRecordPaymentMutation,
  useGetPatientInvoicesQuery,
} = billingApi;
