import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import toothChartRepository from "./repository";
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

async function getToothChart(user: RequestingUser, patientId: string) {
  await verifyPatientAccess(user, patientId);
  return toothChartRepository.findAllByPatient(patientId);
}

async function upsertTooth(
  user: RequestingUser,
  patientId: string,
  toothNumber: number,
  data: any,
) {
  await verifyPatientAccess(user, patientId);
  return toothChartRepository.upsertTooth(patientId, toothNumber, data);
}

export default { getToothChart, upsertTooth };
