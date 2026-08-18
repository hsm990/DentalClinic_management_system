import prisma from "../../config/prisma";

function findPlansByPatient(patientId: string) {
  return prisma.treatmentPlan.findMany({
    where: { patientId },
    include: { items: { include: { procedure: true, invoiceItem: true } } },
    orderBy: { createdAt: "desc" },
  });
}

function createPlan(
  patientId: string,
  data: { title: string; notes?: string },
) {
  return prisma.treatmentPlan.create({ data: { ...data, patientId } });
}

function findPlanById(id: string) {
  return prisma.treatmentPlan.findUnique({
    where: { id },
    include: { patient: true },
  });
}

function addItem(planId: string, data: any) {
  return prisma.treatmentPlanItem.create({
    data: { ...data, treatmentPlanId: planId },
  });
}

function findItemById(id: string) {
  return prisma.treatmentPlanItem.findUnique({
    where: { id },
    include: { treatmentPlan: { include: { patient: true } } },
  });
}

function updateItemStatus(id: string, status: string) {
  return prisma.treatmentPlanItem.update({
    where: { id },
    data: { status: status as any },
  });
}

export default {
  findPlansByPatient,
  createPlan,
  findPlanById,
  addItem,
  findItemById,
  updateItemStatus,
};
