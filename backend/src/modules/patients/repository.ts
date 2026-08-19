import prisma from "../../config/prisma";

interface PatientFilters {
  search?: string;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
}
async function findAll(clinicId: string, filters: PatientFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    clinicId,
    ...(filters.includeArchived ? {} : { isActive: true }),
    ...(filters.search
      ? {
          OR: [
            {
              firstName: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              lastName: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            { phone: { contains: filters.search } },
          ],
        }
      : {}),
  };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
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
async function setActive(clinicId: string, id: string, isActive: boolean) {
  const result = await prisma.patient.updateMany({
    where: { id, clinicId },
    data: { isActive },
  });
  if (result.count === 0) return null;
  return findById(clinicId, id);
}
export default { findAll, findById, create, update, deletePatient, setActive };
