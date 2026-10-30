import prisma from "../../config/prisma";

function findAll(clinicId: string, filters: { from?: Date; to?: Date }) {
  return prisma.expense.findMany({
    where: {
      clinicId,
      ...(filters.from || filters.to
        ? {
            date: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { date: "desc" },
  });
}

function create(clinicId: string, createdById: string, data: any) {
  return prisma.expense.create({ data: { ...data, clinicId, createdById } });
}

function findById(clinicId: string, id: string) {
  return prisma.expense.findFirst({ where: { id, clinicId } });
}

async function update(clinicId: string, id: string, data: any) {
  const result = await prisma.expense.updateMany({
    where: { id, clinicId },
    data,
  });
  if (result.count === 0) return null;
  return findById(clinicId, id);
}

async function remove(clinicId: string, id: string) {
  const result = await prisma.expense.deleteMany({ where: { id, clinicId } });
  return result.count > 0;
}

export default { findAll, create, findById, update, remove };
