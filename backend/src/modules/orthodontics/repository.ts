import prisma from "../../config/prisma";

const userSelect = { select: { id: true, firstName: true, lastName: true } };

function findCasesByPatient(patientId: string) {
  return prisma.orthodonticCase.findMany({
    where: { patientId },
    include: {
      dentist: userSelect,
      createdBy: userSelect,
      visits: {
        include: { createdBy: userSelect },
        orderBy: { visitDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function findCaseById(caseId: string) {
  return prisma.orthodonticCase.findUnique({
    where: { id: caseId },
    include: { patient: true },
  });
}

function createCase(patientId: string, createdById: string, data: any) {
  return prisma.orthodonticCase.create({
    data: { ...data, patientId, createdById },
    include: { dentist: userSelect, createdBy: userSelect, visits: true },
  });
}

function updateStatus(caseId: string, status: string) {
  return prisma.orthodonticCase.update({
    where: { id: caseId },
    data: { status: status as any },
  });
}

function addVisit(caseId: string, createdById: string, data: any) {
  return prisma.orthodonticVisit.create({
    data: { ...data, caseId, createdById },
    include: { createdBy: userSelect },
  });
}

export default {
  findCasesByPatient,
  findCaseById,
  createCase,
  updateStatus,
  addVisit,
};
