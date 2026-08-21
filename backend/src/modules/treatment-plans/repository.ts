import prisma from "../../config/prisma";

function findPlansByPatient(patientId: string) {
  return prisma.treatmentPlan.findMany({
    where: { patientId },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } }, // new
      items: {
        include: {
          procedure: true,
          invoiceItem: true,
          createdBy: { select: { id: true, firstName: true, lastName: true } }, // new
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function createPlan(
  patientId: string,
  createdById: string,
  data: { title: string; notes?: string },
) {
  return prisma.treatmentPlan.create({
    data: { ...data, patientId, createdById },
  });
}

function findPlanById(id: string) {
  return prisma.treatmentPlan.findUnique({
    where: { id },
    include: { patient: true },
  });
}

function addItem(planId: string, createdById: string, data: any) {
  return prisma.treatmentPlanItem.create({
    data: { ...data, treatmentPlanId: planId, createdById },
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
async function deletePlan(planId: string) {
  await prisma.treatmentPlan.delete({ where: { id: planId } }); // items cascade automatically
}
export default {
  findPlansByPatient,
  createPlan,
  findPlanById,
  addItem,
  findItemById,
  updateItemStatus,
  deletePlan,
};
