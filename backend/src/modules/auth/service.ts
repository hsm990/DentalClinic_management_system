import generateJwt from "../../common/generateJwt";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import { TokenPayload } from "../../common/generateJwt";
import { SignOptions } from "jsonwebtoken";
import * as httpsStatus from "../../common/httpStatus";
import jwt from "jsonwebtoken";
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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new AppError("user not found", 404, httpsStatus.ERROR);
  }
  const matchPassword = await bcrypt.compare(password, user.passwordHash);
  if (!matchPassword) {
    throw new AppError("password not correct", 401, httpsStatus.ERROR);
  }
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
function refreshAccessToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as TokenPayload;
    const payload: TokenPayload = {
      id: decoded.id,
      role: decoded.role,
      clinicId: decoded.clinicId,
    };
    return accessToken(payload);
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      httpsStatus.ERROR,
    );
  }
}
export default { logIn, refreshAccessToken };
