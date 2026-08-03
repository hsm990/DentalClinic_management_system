import prisma from "../../config/prisma";

function findAllByPatient(patientId: string) {
  return prisma.toothChartEntry.findMany({
    where: { patientId },
    orderBy: { toothNumber: "asc" },
  });
}

function upsertTooth(
  patientId: string,
  toothNumber: number,
  data: { condition: string; notes?: string },
) {
  return prisma.toothChartEntry.upsert({
    where: { patientId_toothNumber: { patientId, toothNumber } },
    update: { condition: data.condition as any, notes: data.notes },
    create: {
      patientId,
      toothNumber,
      condition: data.condition as any,
      notes: data.notes,
    },
  });
}

export default { findAllByPatient, upsertTooth };
