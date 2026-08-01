import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import bcrypt from "bcrypt";
import * as httpsStatus from "../../common/httpStatus";

interface RequestingUser {
  id: string;
  role: string;
  clinicId: string | null;
}
interface OnboardClinicInput {
  clinic: { name: string; address?: string; phone?: string };
  admin: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

async function onboardClinic(input: OnboardClinicInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.admin.email },
  });
  if (existing) {
    throw new AppError(
      "A user with this email already exists",
      409,
      httpsStatus.ERROR,
    );
  }
  const passwordHash = await bcrypt.hash(input.admin.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: {
        name: input.clinic.name,
        address: input.clinic.address,
        phone: input.clinic.phone,
      },
    });

    const admin = await tx.user.create({
      data: {
        email: input.admin.email,
        passwordHash,
        firstName: input.admin.firstName,
        lastName: input.admin.lastName,
        role: "ADMIN",
        clinicId: clinic.id,
      },
    });
    return { clinic, admin };
  });
  return {
    clinic: result.clinic,
    admin: {
      id: result.admin.id,
      email: result.admin.email,
      firstName: result.admin.firstName,
      lastName: result.admin.lastName,
      role: result.admin.role,
    },
  };
}

async function getMyClinic(requestingUser: RequestingUser) {
  if (!requestingUser.clinicId) {
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: requestingUser.clinicId },
  });

  if (!clinic) throw new AppError("Clinic not found", 404, httpsStatus.ERROR);
  return clinic;
}
async function getClinicById(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) throw new AppError("Clinic not found", 404, httpsStatus.ERROR);
  return clinic;
}
export default { onboardClinic, getMyClinic, getClinicById };
