import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import appointmentsRepository from "./repository";
import { isValidTransition, AppointmentStatus } from "./stateMachine";
import * as httpsStatus from "../../common/httpStatus";

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

async function listAppointments(user: RequestingUser, filters: any) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  return appointmentsRepository.findAll(requireClinicId(user), filters);
}

async function createAppointment(user: RequestingUser, data: any) {
  const clinicId = requireClinicId(user);
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, clinicId },
  });
  if (!patient)
    throw new AppError(
      "Invalid patient for this clinic",
      422,
      httpsStatus.ERROR,
    );
  const dentist = await prisma.user.findFirst({
    where: { id: data.dentistId, clinicId, role: "DENTIST" },
  });
  if (!dentist)
    throw new AppError(
      "Invalid dentist for this clinic",
      422,
      httpsStatus.ERROR,
    );
  return appointmentsRepository.create(clinicId, data);
}

async function updateStatus(
  user: RequestingUser,
  id: string,
  newStatus: AppointmentStatus,
) {
  const clinicId = requireClinicId(user);

  const appointment = await appointmentsRepository.findById(clinicId, id);
  if (!appointment)
    throw new AppError("Appointment not found", 404, httpsStatus.ERROR);

  const currentStatus = appointment.status as AppointmentStatus;

  if (!isValidTransition(currentStatus, newStatus)) {
    throw new AppError(
      `Cannot move appointment from ${currentStatus} to ${newStatus}`,
      422,
      httpsStatus.ERROR,
    );
  }

  const updated = await appointmentsRepository.updateStatus(
    clinicId,
    id,
    newStatus,
  );
  if (!updated)
    throw new AppError("Appointment not found", 404, httpsStatus.ERROR);
  return updated;
}

export default { listAppointments, createAppointment, updateStatus };
