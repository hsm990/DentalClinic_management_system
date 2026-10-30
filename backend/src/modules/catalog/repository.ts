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
  update: async (clinicId: string, id: string, data: any) => {
    const result = await prisma.procedureCategory.updateMany({
      where: { id, clinicId },
      data,
    });
    if (result.count === 0) return null;
    return prisma.procedureCategory.findFirst({ where: { id, clinicId } });
  },
  countProcedures: (clinicId: string, categoryId: string) =>
    prisma.procedure.count({ where: { clinicId, categoryId } }),
  remove: async (clinicId: string, id: string) => {
    const result = await prisma.procedureCategory.deleteMany({
      where: { id, clinicId },
    });
    return result.count > 0;
  },
};

export const procedureRepository = {
  findAll: (clinicId: string, includeInactive = false) =>
    prisma.procedure.findMany({
      where: { clinicId, ...(includeInactive ? {} : { isActive: true }) },
      include: { category: true },
      orderBy: { name: "asc" },
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
  setActive: async (clinicId: string, id: string, isActive: boolean) => {
    const result = await prisma.procedure.updateMany({
      where: { id, clinicId },
      data: { isActive },
    });
    if (result.count === 0) return null;
    return procedureRepository.findById(clinicId, id);
  },
};
