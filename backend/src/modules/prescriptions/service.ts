import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import { logAudit } from "../../common/auditLog";
import prescriptionsRepository from "./repository";
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

async function listPrescriptions(user: RequestingUser, patientId: string) {
  await verifyPatientAccess(user, patientId);
  return prescriptionsRepository.findByPatient(patientId);
}

async function createPrescription(
  user: RequestingUser,
  patientId: string,
  data: any,
) {
  await verifyPatientAccess(user, patientId);

  // only a DENTIST can write a prescription — and specifically themself,
  // not on behalf of another dentist, matching real prescribing authority
  if (user.role !== "DENTIST") {
    throw new AppError(
      "Only a dentist can write a prescription",
      403,
      httpsStatus.ERROR,
    );
  }

  const prescription = await prescriptionsRepository.create(
    user.clinicId!,
    patientId,
    user.id,
    data,
  );

  await logAudit({
    clinicId: user.clinicId!,
    userId: user.id,
    action: "CREATE",
    entityType: "Prescription",
    entityId: prescription.id,
    summary: `Wrote a prescription (${data.medications.length} medication(s))`,
  });

  return prescription;
}

export default { listPrescriptions, createPrescription };
