import AppError from "../../common/AppError";
import inventoryRepository from "./repository";
import * as httpsStatus from "../../common/httpStatus";
import prisma from "../../config/prisma";
interface RequestingUser {
  id: string;
  role: string;
  clinicId: string | null;
}

function requireClinicId(user: RequestingUser) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  return user.clinicId;
}

async function listItems(user: RequestingUser) {
  return inventoryRepository.findAll(requireClinicId(user));
}

async function getLowStockSummary(user: RequestingUser) {
  const items = await inventoryRepository.findLowStock(requireClinicId(user));
  return { count: items.length, items };
}

async function createItem(user: RequestingUser, data: any) {
  const clinicId = requireClinicId(user);
  const existing = await prisma.inventoryItem.findFirst({
    where: { clinicId, reference: data.reference },
  });
  if (existing)
    throw new AppError(
      "An item with this reference already exists",
      409,
      httpsStatus.ERROR,
    );
  return inventoryRepository.create(clinicId, data);
}

async function updateItem(user: RequestingUser, id: string, data: any) {
  const updated = await inventoryRepository.update(
    requireClinicId(user),
    id,
    data,
  );
  if (!updated) throw new AppError("Item not found", 404, httpsStatus.ERROR);
  return updated;
}

async function adjustQuantity(user: RequestingUser, id: string, delta: number) {
  const updated = await inventoryRepository.adjustQuantity(
    requireClinicId(user),
    id,
    delta,
  );
  if (!updated) throw new AppError("Item not found", 404, httpsStatus.ERROR);
  return updated;
}

async function deleteItem(user: RequestingUser, id: string) {
  const deleted = await inventoryRepository.remove(requireClinicId(user), id);
  if (!deleted) throw new AppError("Item not found", 404, httpsStatus.ERROR);
}

export default {
  listItems,
  getLowStockSummary,
  createItem,
  updateItem,
  adjustQuantity,
  deleteItem,
};
