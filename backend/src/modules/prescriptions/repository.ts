import prisma from "../../config/prisma";

const dentistSelect = { select: { id: true, firstName: true, lastName: true } };

function findByPatient(patientId: string) {
  return prisma.prescription.findMany({
    where: { patientId },
    include: { dentist: dentistSelect },
    orderBy: { createdAt: "desc" },
  });
}

function findById(clinicId: string, id: string) {
  return prisma.prescription.findFirst({
    where: { id, clinicId },
    include: { dentist: dentistSelect, patient: true },
  });
}

function create(
  clinicId: string,
  patientId: string,
  dentistId: string,
  data: any,
) {
  return prisma.prescription.create({
    data: { ...data, clinicId, patientId, dentistId },
    include: { dentist: dentistSelect },
  });
}

export default { findByPatient, findById, create };
