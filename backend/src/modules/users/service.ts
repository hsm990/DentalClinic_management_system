import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import * as httpsStatus from "../../common/httpStatus";

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
export default { createUser, listDentists };
