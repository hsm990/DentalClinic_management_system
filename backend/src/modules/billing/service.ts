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
  if (planItemIds.length > 0) {
    const planItems = await prisma.treatmentPlanItem.findMany({
      where: { id: { in: planItemIds } },
      include: { treatmentPlan: true, invoiceItem: true },
    });

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
        const unitPrice = Number(procedure.price);
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
export default {
  createInvoice,
  recordPayment,
  getInvoice,
  getRevenue,
  listPatientInvoices,
};
