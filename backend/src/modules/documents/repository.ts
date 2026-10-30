import prisma from "../../config/prisma";

function findByPatient(clinicId: string, patientId: string) {
  return prisma.patientDocument.findMany({
    where: { patientId, clinicId },
    include: {
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

function findById(clinicId: string, id: string) {
  return prisma.patientDocument.findFirst({ where: { id, clinicId } });
}

function create(data: any) {
  return prisma.patientDocument.create({ data });
}

async function remove(clinicId: string, id: string) {
  const result = await prisma.patientDocument.deleteMany({
    where: { id, clinicId },
  });
  return result.count > 0;
}

export default { findByPatient, findById, create, remove };
