import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import orthoRepository from "./repository";
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

async function listCases(user: RequestingUser, patientId: string) {
  await verifyPatientAccess(user, patientId);
  return orthoRepository.findCasesByPatient(patientId);
}

async function createCase(user: RequestingUser, patientId: string, data: any) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );

  await verifyPatientAccess(user, patientId);

  const dentist = await prisma.user.findFirst({
    where: { id: data.dentistId, clinicId: user.clinicId, role: "DENTIST" },
  });
  if (!dentist)
    throw new AppError(
      "Invalid dentist for this clinic",
      422,
      httpsStatus.ERROR,
    );

  return orthoRepository.createCase(patientId, user.id, data);
}

async function verifyCaseAccess(user: RequestingUser, caseId: string) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  const orthoCase = await orthoRepository.findCaseById(caseId);
  if (!orthoCase || orthoCase.patient.clinicId !== user.clinicId) {
    throw new AppError("Orthodontic case not found", 404, httpsStatus.ERROR);
  }
  return orthoCase;
}

async function updateStatus(
  user: RequestingUser,
  caseId: string,
  status: string,
) {
  await verifyCaseAccess(user, caseId);
  return orthoRepository.updateStatus(caseId, status);
}

async function addVisit(user: RequestingUser, caseId: string, data: any) {
  await verifyCaseAccess(user, caseId);
  return orthoRepository.addVisit(caseId, user.id, data);
}

export default { listCases, createCase, updateStatus, addVisit };
