import AppError from "../../common/AppError";
import * as httpsStatus from "../../common/httpStatus";
import { procedureRepository, categoryRepository } from "./repository";

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
async function listCategories(user: RequestingUser) {
  return categoryRepository.findAll(requireClinicId(user));
}

async function createCategory(user: RequestingUser, data: any) {
  return categoryRepository.create(requireClinicId(user), data);
}

async function createProcedure(user: RequestingUser, data: any) {
  const clinicId = requireClinicId(user);
  const category = await categoryRepository.findById(clinicId, data.categoryId);
  if (!category)
    throw new AppError(
      "Invalid category for this clinic",
      422,
      httpsStatus.ERROR,
    );
  return procedureRepository.create(clinicId, data);
}

async function updateProcedure(user: RequestingUser, id: string, data: any) {
  const clinicId = requireClinicId(user);

  if (data.categoryId) {
    const category = await categoryRepository.findById(
      clinicId,
      data.categoryId,
    );
    if (!category)
      throw new AppError(
        "Invalid category for this clinic",
        422,
        httpsStatus.ERROR,
      );
  }

  const updated = await procedureRepository.update(clinicId, id, data);
  if (!updated)
    throw new AppError("Procedure not found", 404, httpsStatus.ERROR);
  return updated;
}
async function updateCategory(user: RequestingUser, id: string, data: any) {
  const clinicId = requireClinicId(user);
  const updated = await categoryRepository.update(clinicId, id, data);
  if (!updated)
    throw new AppError("Category not found", 404, httpsStatus.ERROR);
  return updated;
}

async function deleteCategory(user: RequestingUser, id: string) {
  const clinicId = requireClinicId(user);
  const procedureCount = await categoryRepository.countProcedures(clinicId, id);
  if (procedureCount > 0) {
    throw new AppError(
      "Cannot delete a category with procedures in it. Move or deactivate them first.",
      409,
      httpsStatus.ERROR,
    );
  }
  const deleted = await categoryRepository.remove(clinicId, id);
  if (!deleted)
    throw new AppError("Category not found", 404, httpsStatus.ERROR);
}

async function listProcedures(user: RequestingUser, includeInactive: boolean) {
  return procedureRepository.findAll(requireClinicId(user), includeInactive);
}

async function setProcedureActive(
  user: RequestingUser,
  id: string,
  isActive: boolean,
) {
  const updated = await procedureRepository.setActive(
    requireClinicId(user),
    id,
    isActive,
  );
  if (!updated)
    throw new AppError("Procedure not found", 404, httpsStatus.ERROR);
  return updated;
}

export default {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProcedures,
  createProcedure,
  updateProcedure,
  setProcedureActive,
};
