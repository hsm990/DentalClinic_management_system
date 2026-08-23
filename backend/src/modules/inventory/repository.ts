import prisma from "../../config/prisma";

function computeStatus(quantity: number, threshold: number) {
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (quantity <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

function withStatus(item: any) {
  return {
    ...item,
    status: computeStatus(item.quantity, item.lowStockThreshold),
  };
}

async function findAll(clinicId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
  });
  return items.map(withStatus);
}

async function findLowStock(clinicId: string) {
  const items = await prisma.inventoryItem.findMany({ where: { clinicId } });
  return items.map(withStatus).filter((i) => i.status !== "IN_STOCK");
}

function findById(clinicId: string, id: string) {
  return prisma.inventoryItem.findFirst({ where: { id, clinicId } });
}

function create(clinicId: string, data: any) {
  return prisma.inventoryItem.create({ data: { ...data, clinicId } });
}

async function update(clinicId: string, id: string, data: any) {
  const result = await prisma.inventoryItem.updateMany({
    where: { id, clinicId },
    data,
  });
  if (result.count === 0) return null;
  return findById(clinicId, id);
}

async function adjustQuantity(clinicId: string, id: string, delta: number) {
  const item = await findById(clinicId, id);
  if (!item) return null;
  const newQuantity = Math.max(0, item.quantity + delta); // never goes negative
  return update(clinicId, id, { quantity: newQuantity });
}

async function remove(clinicId: string, id: string) {
  const result = await prisma.inventoryItem.deleteMany({
    where: { id, clinicId },
  });
  return result.count > 0;
}

export default {
  findAll,
  findLowStock,
  findById,
  create,
  update,
  adjustQuantity,
  remove,
  withStatus,
};
