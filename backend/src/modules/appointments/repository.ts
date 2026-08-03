import prisma from "../../config/prisma";
import type { AppointmentStatus } from "./stateMachine";
interface ListFilters {
  dentistId?: string;
  status?: string;
  from?: Date;
  to?: Date;
}

function findAll(clinicId: string, filters: ListFilters = {}) {
  return prisma.appointment.findMany({
    where: {
      clinicId,
      ...(filters.dentistId ? { dentistId: filters.dentistId } : {}),
      ...(filters.status ? { status: filters.status as any } : {}),
      ...(filters.from || filters.to
        ? {
            scheduledAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    },
    include: {
      patient: true,
      dentist: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}
function findById(clinicId: string, id: string) {
  return prisma.appointment.findFirst({ where: { id, clinicId } });
}

function create(clinicId: string, data: any) {
  return prisma.appointment.create({ data: { ...data, clinicId } });
}

async function updateStatus(
  clinicId: string,
  id: string,
  status: AppointmentStatus,
) {
  const result = await prisma.appointment.updateMany({
    where: { id, clinicId },
    data: { status },
  });
  if (result.count === 0) return null;
  return findById(clinicId, id);
}

export default { findAll, findById, create, updateStatus };
