import prisma from "../../config/prisma";

export const categoryRepository = {
  findAll: (clinicId: string) =>
    prisma.procedureCategory.findMany({
      where: { clinicId },
      orderBy: { sortOrder: "asc" },
    }),
  findById: (clinicId: string, id: string) =>
    prisma.procedureCategory.findFirst({ where: { clinicId, id } }),
  create: (clinicId: string, data: any) =>
    prisma.procedureCategory.create({ data: { ...data, clinicId } }),
};

export const procedureRepository = {
  findAll: (clinicId: string) =>
    prisma.procedure.findMany({
      where: { clinicId },
      include: { category: true },
    }),
  findById: (clinicId: string, id: string) =>
    prisma.procedure.findFirst({ where: { id, clinicId } }),
  create: (clinicId: string, data: any) =>
    prisma.procedure.create({ data: { ...data, clinicId } }),
  update: async (clinicId: string, id: string, data: any) => {
    const result = await prisma.procedure.updateMany({
      where: { id, clinicId },
      data,
    });
    if (result.count === 0) return null;
    return procedureRepository.findById(clinicId, id);
  },
};
