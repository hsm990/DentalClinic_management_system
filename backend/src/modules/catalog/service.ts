import { da } from "zod/locales";
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
async function listProcedures(user: RequestingUser) {
  return procedureRepository.findAll(requireClinicId(user));
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

export default {
  listCategories,
  createCategory,
  listProcedures,
  createProcedure,
  updateProcedure,
};
