import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../common/AppError";
import * as httpsStatus from "../common/httpStatus";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
interface AccessPayload {
  id: string;
  role: string;
  clinicId: string | null;
}
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || header.startsWith("Bearer ")) {
    return next(new AppError("Not authenticated", 401, httpsStatus.ERROR));
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as AccessPayload;
    req.user = {
      id: decoded.id,
      role: decoded.role as any,
      clinicId: decoded.clinicId,
    };
    next();
  } catch {
    return next(
      new AppError("Invalid or expired access token", 401, httpsStatus.ERROR),
    );
  }
}
export default authMiddleware;
