import repository from "./repository";
import AppError from "../../common/AppError";
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
async function listPatients(user: RequestingUser, search?: string) {
  const result = repository.findAll(requireClinicId(user), { search });
  return result;
}

async function getPatient(user: RequestingUser, id: string) {
  const patient = await repository.findById(requireClinicId(user), id);
  if (!patient) {
    throw new AppError("Patient not found", 404, httpsStatus.ERROR);
  }
  return patient;
}

function createPatient(user: RequestingUser, data: any) {
  return repository.create(requireClinicId(user), data);
}

async function updatePatient(user: RequestingUser, id: string, data: any) {
  const updated = await repository.update(requireClinicId(user), id, data);
  if (!updated) throw new AppError("Patient not found", 404, httpsStatus.ERROR);
  return updated;
}

async function deletePatient(user: RequestingUser, id: string) {
  const clinicId = requireClinicId(user);
  const patient = await repository.findById(clinicId, id);
  if (!patient) throw new AppError("Patient not found", 404, httpsStatus.ERROR);

  const [invoiceCount, appointmentCount, treatmentPlanCount] =
    await Promise.all([
      prisma.invoice.count({ where: { patientId: id } }),
      prisma.appointment.count({ where: { patientId: id } }),
      prisma.treatmentPlan.count({ where: { patientId: id } }),
    ]);

  if (invoiceCount > 0 || appointmentCount > 0 || treatmentPlanCount > 0) {
    throw new AppError(
      "Cannot delete a patient with appointments, treatment plans, or billing history.",
      409,
      httpsStatus.ERROR,
    );
  }

  await prisma.$transaction([
    prisma.toothChartEntry.deleteMany({ where: { patientId: id } }), // no FK risk here since tooth chart has no dependents
    prisma.patient.delete({ where: { id } }),
  ]);
}

export default {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
};
