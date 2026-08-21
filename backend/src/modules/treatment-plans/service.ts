import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import treatmentPlansRepository from "./repository";
import { isValidItemTransition, ItemStatus } from "./stateMachine";
import * as httpsStatus from "../../common/httpStatus";

interface RequestingUser {
  id: string;
  role: string;
  clinicId: string | null;
}

async function verifyPatientAccess(user: RequestingUser, patientId: string) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: user.clinicId },
  });
  if (!patient) throw new AppError("Patient not found", 404, httpsStatus.ERROR);
  return patient;
}

async function listPlans(user: RequestingUser, patientId: string) {
  await verifyPatientAccess(user, patientId);
  return treatmentPlansRepository.findPlansByPatient(patientId);
}

async function createPlan(user: RequestingUser, patientId: string, data: any) {
  await verifyPatientAccess(user, patientId);
  return treatmentPlansRepository.createPlan(patientId, user.id, data);
}
async function addItem(user: RequestingUser, planId: string, data: any) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );

  const plan = await treatmentPlansRepository.findPlanById(planId);
  if (!plan || plan.patient.clinicId !== user.clinicId) {
    throw new AppError("Treatment plan not found", 404, httpsStatus.ERROR);
  }

  const procedure = await prisma.procedure.findFirst({
    where: { id: data.procedureId, clinicId: user.clinicId },
  });
  if (!procedure)
    throw new AppError(
      "Invalid procedure for this clinic",
      422,
      httpsStatus.ERROR,
    );

  return treatmentPlansRepository.addItem(planId, user.id, data);
}
async function deletePlan(user: RequestingUser, planId: string) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );

  const plan = await treatmentPlansRepository.findPlanById(planId);
  if (!plan || plan.patient.clinicId !== user.clinicId) {
    throw new AppError("Treatment plan not found", 404, httpsStatus.ERROR);
  }

  const fullPlan = await prisma.treatmentPlan.findUnique({
    where: { id: planId },
    include: { items: true },
  });

  const hasCompletedItems = fullPlan!.items.some(
    (item) => item.status === "COMPLETED",
  );
  if (hasCompletedItems) {
    throw new AppError(
      "Cannot delete a treatment plan with completed items. Cancel or bill them first.",
      409,
      httpsStatus.ERROR,
    );
  }

  await treatmentPlansRepository.deletePlan(planId);
}
async function updateItemStatus(
  user: RequestingUser,
  itemId: string,
  newStatus: ItemStatus,
) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );

  const item = await treatmentPlansRepository.findItemById(itemId);
  if (!item || item.treatmentPlan.patient.clinicId !== user.clinicId) {
    throw new AppError("Treatment plan item not found", 404, httpsStatus.ERROR);
  }

  const currentStatus = item.status as ItemStatus;
  if (!isValidItemTransition(currentStatus, newStatus)) {
    throw new AppError(
      `Cannot move item from ${currentStatus} to ${newStatus}`,
      422,
      httpsStatus.ERROR,
    );
  }

  return treatmentPlansRepository.updateItemStatus(itemId, newStatus);
}

export default { listPlans, createPlan, addItem, updateItemStatus, deletePlan };
