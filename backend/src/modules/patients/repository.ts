import prisma from "../../config/prisma";
interface PatientFilters {
  search?: string;
}

function findAll(clinicId: string, filters: PatientFilters = {}) {
  return prisma.patient.findMany({
    where: {
      clinicId,
      ...(filters.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: "insensitive" } },
              { lastName: { contains: filters.search, mode: "insensitive" } },
              { phone: { contains: filters.search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

function findById(clinicId: string, id: string) {
  return prisma.patient.findUnique({
    where: { clinicId, id },
  });
}
function create(clinicId: string, input: any) {
  return prisma.patient.create({
    data: { ...input, clinicId },
  });
}
async function update(clinicId: string, id: string, data: any) {
  const result = await prisma.patient.updateMany({
    where: { clinicId, id },
    data,
  });
  return findById(clinicId, id);
}

function deletePatient(clinicId: string, id: string) {
  return prisma.patient.deleteMany({
    where: { clinicId, id },
  });
}
export default { findAll, findById, create, update, deletePatient };
