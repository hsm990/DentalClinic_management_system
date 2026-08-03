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

export default { findInvoiceById, findLastInvoiceNumber };
