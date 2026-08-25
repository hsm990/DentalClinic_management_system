import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import billingRepository from "./repository";
import * as httpsStatus from "../../common/httpStatus";
import emitters from "../../sockets/emitters";

interface RequestingUser {
  id: string;
  role: string;
  clinicId: string | null;
}

function requireClinicId(user: RequestingUser) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  return user.clinicId;
}

interface InvoiceItemInput {
  procedureId: string;
  toothNumber?: number;
  quantity: number;
  treatmentPlanItemId?: string;
}

async function createInvoice(
  user: RequestingUser,
  patientId: string,
  data: { items: InvoiceItemInput[]; discount?: number; notes?: string },
) {
  const clinicId = requireClinicId(user);

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
  });
  if (!patient) throw new AppError("Patient not found", 404, httpsStatus.ERROR);

  // verify every procedure belongs to this clinic
  const procedureIds = [...new Set(data.items.map((i) => i.procedureId))];
  const procedures = await prisma.procedure.findMany({
    where: { id: { in: procedureIds }, clinicId },
  });
  if (procedures.length !== procedureIds.length) {
    throw new AppError(
      "One or more procedures are invalid for this clinic",
      422,
      httpsStatus.ERROR,
    );
  }
  const procedureMap = new Map(procedures.map((p) => [p.id, p]));

  // verify every referenced treatment-plan item: belongs to this patient,
  // is COMPLETED, and isn't already linked to an invoice item
  const planItemIds = data.items
    .map((i) => i.treatmentPlanItemId)
    .filter(Boolean) as string[];
  const planItemMap = new Map<string, any>();
  if (planItemIds.length > 0) {
    const planItems = await prisma.treatmentPlanItem.findMany({
      where: { id: { in: planItemIds } },
      include: { treatmentPlan: true, invoiceItem: true },
    });
    for (const planItem of planItems) {
      planItemMap.set(planItem.id, planItem.estimatedCost);
    }

    for (const planItem of planItems) {
      if (planItem.treatmentPlan.patientId !== patientId) {
        throw new AppError(
          "Treatment plan item does not belong to this patient",
          422,
          httpsStatus.ERROR,
        );
      }
      if (planItem.status !== "COMPLETED") {
        throw new AppError(
          "Only COMPLETED treatment plan items can be billed",
          422,
          httpsStatus.ERROR,
        );
      }
      if (planItem.invoiceItem) {
        throw new AppError(
          "This treatment plan item has already been billed",
          409,
          httpsStatus.ERROR,
        );
      }
    }
  }

  const invoice = await runInvoiceTransaction(
    clinicId,
    patientId,
    user.id,
    data,
    procedureMap,
    planItemMap,
  );
  emitters.emitInvoiceCreated(clinicId, invoice);
  return invoice;
}

async function runInvoiceTransaction(
  clinicId: string,
  patientId: string,
  createdById: string,
  data: { items: InvoiceItemInput[]; discount?: number; notes?: string },
  procedureMap: Map<string, any>,
  planItemMap: Map<string, any>,
  attempt = 1,
): Promise<any> {
  try {
    return await prisma.$transaction(async (tx) => {
      // computed inside the transaction so it reads the latest number for
      // this clinic; retried on conflict below rather than locked up front
      const last = await tx.invoice.findFirst({
        where: { clinicId },
        orderBy: { invoiceNumber: "desc" },
        select: { invoiceNumber: true },
      });
      const invoiceNumber = (last?.invoiceNumber ?? 0) + 1;

      let subtotal = 0;
      const itemsData = data.items.map((item) => {
        const procedure = procedureMap.get(item.procedureId);
        const planItemPrice = item.treatmentPlanItemId
          ? planItemMap.get(item.treatmentPlanItemId)
          : undefined;
        const unitPrice =
          planItemPrice !== undefined
            ? Number(planItemPrice)
            : Number(procedure.price);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;
        return {
          procedureId: item.procedureId,
          toothNumber: item.toothNumber,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          treatmentPlanItemId: item.treatmentPlanItemId,
        };
      });

      const discount = data.discount ?? 0;
      const total = subtotal - discount;

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          clinicId,
          patientId,
          createdById,
          subtotal,
          discount,
          total,
          notes: data.notes,
          items: { create: itemsData },
        },
        include: { items: true },
      });

      return invoice;
    });
  } catch (err: any) {
    // unique constraint hit — either the invoiceNumber race, or a
    // treatmentPlanItemId got billed by a concurrent request. Retry a few
    // times for the former; the latter will keep failing, which is correct.
    if (err.code === "P2002" && attempt < 3) {
      return runInvoiceTransaction(
        clinicId,
        patientId,
        createdById,
        data,
        procedureMap,
        planItemMap,
        attempt + 1,
      );
    }
    throw err;
  }
}

async function recordPayment(
  user: RequestingUser,
  invoiceId: string,
  data: { amount: number; method: string; notes?: string },
) {
  const clinicId = requireClinicId(user);
  const invoice = await billingRepository.findInvoiceById(clinicId, invoiceId);
  if (!invoice) throw new AppError("Invoice not found", 404, httpsStatus.ERROR);
  if (invoice.status === "REFUNDED")
    throw new AppError("Cannot pay a refunded invoice", 422, httpsStatus.ERROR);

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        method: data.method as any,
        notes: data.notes,
      },
    });

    const totalPaid =
      invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) +
      Number(data.amount);
    const total = Number(invoice.total);

    const status =
      totalPaid >= total
        ? "PAID"
        : totalPaid > 0
          ? "PARTIALLY_PAID"
          : "PENDING";

    await tx.invoice.update({ where: { id: invoiceId }, data: { status } });

    return payment;
  });
}

async function getInvoice(user: RequestingUser, invoiceId: string) {
  const clinicId = requireClinicId(user);
  const invoice = await billingRepository.findInvoiceById(clinicId, invoiceId);
  if (!invoice) throw new AppError("Invoice not found", 404, httpsStatus.ERROR);
  return invoice;
}

async function getRevenue(user: RequestingUser, from: Date, to: Date) {
  const clinicId = requireClinicId(user);
  const result = await prisma.payment.aggregate({
    where: { invoice: { clinicId }, paidAt: { gte: from, lte: to } },
    _sum: { amount: true },
    _count: true,
  });
  return {
    totalRevenue: result._sum.amount ?? 0,
    paymentCount: result._count,
    from,
    to,
  };
}
async function listPatientInvoices(user: RequestingUser, patientId: string) {
  const clinicId = requireClinicId(user);
  return billingRepository.findInvoicesByPatient(clinicId, patientId);
}

async function getOutstandingSummary(user: RequestingUser) {
  const clinicId = requireClinicId(user);
  const invoices = await billingRepository.findOutstandingInvoices(clinicId);

  let totalOutstanding = 0;
  for (const inv of invoices) {
    const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    totalOutstanding += Math.max(0, Number(inv.total) - paid);
  }

  return { totalOutstanding, invoiceCount: invoices.length };
}
async function getFinanceSummary(user: RequestingUser, from: Date, to: Date) {
  const clinicId = requireClinicId(user);

  // cash actually collected in the range, by day and by method — based on
  // when payments were made, not when invoices were created
  const payments = await prisma.payment.findMany({
    where: { invoice: { clinicId }, paidAt: { gte: from, lte: to } },
  });

  const revenueByDayMap = new Map<string, number>();
  const revenueByMethodMap = new Map<string, number>();
  let totalRevenue = 0;

  for (const p of payments) {
    const amount = Number(p.amount);
    totalRevenue += amount;
    const day = p.paidAt.toISOString().slice(0, 10);
    revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + amount);
    revenueByMethodMap.set(
      p.method,
      (revenueByMethodMap.get(p.method) ?? 0) + amount,
    );
  }

  // billed amount by procedure category — based on invoices created in
  // range (this is "work billed," a different number from "cash collected"
  // above; the two can legitimately differ if a client pays late)
  const invoices = await prisma.invoice.findMany({
    where: { clinicId, createdAt: { gte: from, lte: to } },
    include: {
      payments: true,
      items: { include: { procedure: { include: { category: true } } } },
    },
  });

  const revenueByCategoryMap = new Map<string, number>();
  let totalBilled = 0;
  for (const inv of invoices) {
    for (const item of inv.items) {
      const amount = Number(item.totalPrice);
      totalBilled += amount;
      const categoryName = item.procedure.category?.name ?? "Uncategorized";
      revenueByCategoryMap.set(
        categoryName,
        (revenueByCategoryMap.get(categoryName) ?? 0) + amount,
      );
    }
  }

  // current outstanding balance across ALL open invoices, not just this
  // date range — this is a point-in-time figure, always "as of now"
  const openInvoices = await prisma.invoice.findMany({
    where: { clinicId, status: { in: ["PENDING", "PARTIALLY_PAID"] } },
    include: { payments: true },
  });
  let totalOutstanding = 0;
  for (const inv of openInvoices) {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    totalOutstanding += Math.max(0, Number(inv.total) - paid);
  }

  return {
    totalRevenue,
    totalBilled,
    totalOutstanding,
    invoiceCount: invoices.length,
    paymentCount: payments.length,
    revenueByDay: Array.from(revenueByDayMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    revenueByMethod: Array.from(revenueByMethodMap.entries()).map(
      ([method, total]) => ({ method, total }),
    ),
    revenueByCategory: Array.from(revenueByCategoryMap.entries()).map(
      ([category, total]) => ({ category, total }),
    ),
  };
}
export default {
  createInvoice,
  recordPayment,
  getInvoice,
  getRevenue,
  listPatientInvoices,
  getOutstandingSummary,
  getFinanceSummary,
};
