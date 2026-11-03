import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import bcrypt from "bcrypt";
import * as httpsStatus from "../../common/httpStatus";
import { logAudit } from "../../common/auditLog";

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

async function onboardClinic(
  user: RequestingUser,
  input: OnboardClinicInput & { leadId?: string },
) {
  const existing = await prisma.user.findUnique({
    where: { email: input.admin.email },
  });
  if (existing)
    throw new AppError(
      "A user with this email already exists",
      409,
      httpsStatus.ERROR,
    );

  const passwordHash = await bcrypt.hash(input.admin.password, 10);
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: {
        name: input.clinic.name,
        address: input.clinic.address,
        phone: input.clinic.phone,
        plan: "TRIAL",
        paidUntil: trialEnd,
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

    if (input.leadId) {
      // updateMany: a stale leadId never fails the whole onboarding
      await tx.lead.updateMany({
        where: { id: input.leadId },
        data: { status: "CONVERTED", convertedClinicId: clinic.id },
      });
    }

    return { clinic, admin };
  });

  await logAudit({
    userId: user.id,
    action: "CREATE",
    entityType: "Clinic",
    entityId: result.clinic.id,
    summary: `Onboarded clinic "${result.clinic.name}"`,
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
async function updateMyClinic(requestingUser: RequestingUser, data: any) {
  if (requestingUser.role !== "ADMIN")
    throw new AppError(
      "Only an ADMIN can edit clinic settings",
      403,
      httpsStatus.ERROR,
    );
  if (!requestingUser.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  return prisma.clinic.update({ where: { id: requestingUser.clinicId }, data });
}
async function listAllClinics() {
  const [clinics, activity] = await Promise.all([
    prisma.clinic.findMany({
      include: {
        _count: { select: { users: true, patients: true } },
        users: {
          where: { role: "ADMIN" },
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.groupBy({ by: ["clinicId"], _max: { lastLoginAt: true } }),
  ]);

  const lastLogin = new Map(
    activity.map((a) => [a.clinicId, a._max.lastLoginAt]),
  );
  return clinics.map(({ users, ...c }) => ({
    ...c,
    admins: users,
    lastLoginAt: lastLogin.get(c.id) ?? null,
  }));
}
async function setClinicActive(
  user: RequestingUser,
  id: string,
  isActive: boolean,
) {
  const clinic = await prisma.clinic.findUnique({ where: { id } });
  if (!clinic) throw new AppError("Clinic not found", 404, httpsStatus.ERROR);

  const updated = await prisma.clinic.update({
    where: { id },
    data: { isActive },
  });
  await logAudit({
    userId: user.id,
    action: "STATUS_CHANGE",
    entityType: "Clinic",
    entityId: id,
    summary: `${isActive ? "Reactivated" : "Suspended"} clinic "${clinic.name}"`,
  });
  return updated;
}

async function updateSubscription(
  user: RequestingUser,
  id: string,
  data: { plan: "TRIAL" | "BASIC" | "PRO"; paidUntil: Date | null },
) {
  const clinic = await prisma.clinic.findUnique({ where: { id } });
  if (!clinic) throw new AppError("Clinic not found", 404, httpsStatus.ERROR);

  const updated = await prisma.clinic.update({ where: { id }, data });
  await logAudit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Clinic",
    entityId: id,
    summary: `Set "${clinic.name}" to ${data.plan}${data.paidUntil ? `, paid until ${data.paidUntil.toISOString().slice(0, 10)}` : ""}`,
  });
  return updated;
}

async function resetAdminPassword(
  user: RequestingUser,
  clinicId: string,
  adminId: string,
  newPassword: string,
) {
  const admin = await prisma.user.findFirst({
    where: { id: adminId, clinicId, role: "ADMIN" },
  });
  if (!admin)
    throw new AppError(
      "Admin not found for this clinic",
      404,
      httpsStatus.ERROR,
    );

  await prisma.user.update({
    where: { id: adminId },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });
  await logAudit({
    userId: user.id,
    action: "UPDATE",
    entityType: "User",
    entityId: adminId,
    summary: `Reset password for ${admin.email}`,
  });
}
async function extendSubscription(
  user: RequestingUser,
  id: string,
  plan: "BASIC" | "PRO",
  days: number,
) {
  const clinic = await prisma.clinic.findUnique({ where: { id } });
  if (!clinic) throw new AppError("Clinic not found", 404, httpsStatus.ERROR);

  // still paid up: add days after the current end date (paying early loses nothing).
  // already expired: count from today (no free retroactive days).
  const now = new Date();
  const base =
    clinic.paidUntil && clinic.paidUntil > now ? clinic.paidUntil : now;
  const paidUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  const updated = await prisma.clinic.update({
    where: { id },
    data: { plan, paidUntil },
  });

  await logAudit({
    userId: user.id,
    action: "UPDATE",
    entityType: "Clinic",
    entityId: id,
    summary: `Payment confirmed for "${clinic.name}": ${plan}, +${days} days, paid until ${paidUntil.toISOString().slice(0, 10)}`,
  });
  return updated;
}
export default {
  onboardClinic,
  getMyClinic,
  getClinicById,
  updateMyClinic,
  listAllClinics,
  setClinicActive,
  updateSubscription,
  resetAdminPassword,
  extendSubscription,
};
