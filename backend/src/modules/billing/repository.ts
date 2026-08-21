import prisma from "../../config/prisma";

function findInvoiceById(clinicId: string, id: string) {
  return prisma.invoice.findFirst({
    where: { id, clinicId },
    include: { items: true, payments: true },
  });
}

function findLastInvoiceNumber(clinicId: string) {
  return prisma.invoice.findFirst({
    where: { clinicId },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
}
function findInvoicesByPatient(clinicId: string, patientId: string) {
  return prisma.invoice.findMany({
    where: { patientId, clinicId },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });
}
function findOutstandingInvoices(clinicId: string) {
  return prisma.invoice.findMany({
    where: { clinicId, status: { in: ["PENDING", "PARTIALLY_PAID"] } },
    include: { payments: true },
  });
}
export default {
  findInvoiceById,
  findLastInvoiceNumber,
  findInvoicesByPatient,
  findOutstandingInvoices,
};
