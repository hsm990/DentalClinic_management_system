import prisma from "../../config/prisma";

function findAll(userId: string, filters: { from?: Date; to?: Date }) {
  return prisma.personalTodo.findMany({
    where: {
      userId,
      ...(filters.from || filters.to
        ? {
            date: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
}

function create(userId: string, data: { text: string; date: Date }) {
  return prisma.personalTodo.create({ data: { ...data, userId } });
}

async function update(userId: string, id: string, data: any) {
  const result = await prisma.personalTodo.updateMany({
    where: { id, userId },
    data,
  });
  if (result.count === 0) return null;
  return prisma.personalTodo.findUnique({ where: { id } });
}

async function remove(userId: string, id: string) {
  const result = await prisma.personalTodo.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}

export default { findAll, create, update, remove };
