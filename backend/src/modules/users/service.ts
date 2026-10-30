import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import * as httpsStatus from "../../common/httpStatus";
import { logAudit } from "../../common/auditLog";
interface RequestingUser {
  id: string;
  role: string;
  clinicId: string | null;
}
interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "DENTIST" | "ASSISTANT" | "RECEPTIONIST";
}
async function createUser(
  requestingUser: RequestingUser,
  input: CreateUserInput,
) {
  if (requestingUser.role !== "ADMIN") {
    throw new AppError(
      "Only an ADMIN can create staff users",
      403,
      httpsStatus.ERROR,
    );
  }
  if (!requestingUser.clinicId) {
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing)
    throw new AppError(
      "A user with this email already exists",
      409,
      httpsStatus.ERROR,
    );
  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      clinicId: requestingUser.clinicId,
    },
  });
  await logAudit({
    clinicId: user.clinicId as any,
    userId: requestingUser.id,
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    summary: `Added staff member ${user.firstName} ${user.lastName} (${user.role})`,
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    clinicId: user.clinicId,
  };
}
async function listDentists(requestingUser: RequestingUser) {
  if (!requestingUser.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  return prisma.user.findMany({
    where: {
      clinicId: requestingUser.clinicId,
      role: "DENTIST",
      isActive: true,
    },
    select: { id: true, firstName: true, lastName: true },
  });
}
async function listStaff(requestingUser: RequestingUser) {
  if (!requestingUser.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  return prisma.user.findMany({
    where: { clinicId: requestingUser.clinicId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
    orderBy: { firstName: "asc" },
  });
}
async function updateStaff(
  requestingUser: RequestingUser,
  id: string,
  data: any,
) {
  if (requestingUser.role !== "ADMIN")
    throw new AppError("Only an ADMIN can edit staff", 403, httpsStatus.ERROR);
  if (!requestingUser.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );

  const result = await prisma.user.updateMany({
    where: { id, clinicId: requestingUser.clinicId, role: { not: "ADMIN" } }, // admins can't edit another admin/themselves here
    data,
  });
  if (result.count === 0)
    throw new AppError("Staff member not found", 404, httpsStatus.ERROR);

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });
}

async function setStaffActive(
  requestingUser: RequestingUser,
  id: string,
  isActive: boolean,
) {
  if (requestingUser.role !== "ADMIN")
    throw new AppError("Only an ADMIN can do this", 403, httpsStatus.ERROR);
  if (!requestingUser.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );

  const result = await prisma.user.updateMany({
    where: { id, clinicId: requestingUser.clinicId, role: { not: "ADMIN" } },
    data: { isActive },
  });
  if (result.count === 0)
    throw new AppError("Staff member not found", 404, httpsStatus.ERROR);
  await logAudit({
    clinicId: requestingUser.clinicId!,
    userId: requestingUser.id,
    action: "STATUS_CHANGE",
    entityType: "User",
    entityId: id,
    summary: `${isActive ? "Activated" : "Deactivated"} staff member`,
  });
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });
}

export default {
  createUser,
  listDentists,
  listStaff,
  updateStaff,
  setStaffActive,
};
