import generateJwt from "../../common/generateJwt";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import { TokenPayload } from "../../common/generateJwt";
import { SignOptions } from "jsonwebtoken";
import * as httpsStatus from "../../common/httpStatus";
import jwt from "jsonwebtoken";
import { getClinicAccessIssue } from "../../common/clinicAccess";

function accessToken(payload: TokenPayload) {
  return generateJwt(
    payload,
    process.env.JWT_ACCESS_SECRET!,
    process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  );
}

function refreshToken(payload: TokenPayload) {
  return generateJwt(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  );
}

async function logIn(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      clinic: { select: { isActive: true, plan: true, paidUntil: true } },
    },
  });
  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    throw new AppError("Invalid email or password", 401, httpsStatus.ERROR);
  }
  const accessIssue = getClinicAccessIssue(user.clinic);
  if (accessIssue) throw new AppError(accessIssue, 403, httpsStatus.ERROR);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const payload: TokenPayload = {
    id: user.id,
    role: user.role,
    clinicId: user.clinicId,
  };
  return {
    accessToken: accessToken(payload),
    refreshToken: refreshToken(payload),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}
async function refreshAccessToken(token: string) {
  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!,
    ) as TokenPayload;
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      httpsStatus.ERROR,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      clinic: { select: { isActive: true, plan: true, paidUntil: true } },
    },
  });
  if (!user || !user.isActive || getClinicAccessIssue(user.clinic)) {
    throw new AppError("Account is no longer active", 401, httpsStatus.ERROR);
  }

  // role and clinicId come fresh from the DB, so a role change also applies at next refresh
  return accessToken({ id: user.id, role: user.role, clinicId: user.clinicId });
}
async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404, httpsStatus.ERROR);

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  // 400, not 401: a 401 would trigger the frontend's refresh-and-retry logic
  if (!ok)
    throw new AppError("Current password is incorrect", 400, httpsStatus.ERROR);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });
}
async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      clinicId: true,
      isActive: true,
    },
  });
  if (!user) throw new AppError("User not found", 404, httpsStatus.ERROR);
  return user;
}
export default { logIn, refreshAccessToken, getCurrentUser, changePassword };
