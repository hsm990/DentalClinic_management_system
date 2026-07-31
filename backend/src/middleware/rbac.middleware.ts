import { Request, Response, NextFunction } from "express";
import AppError from "../common/AppError";
import { UserRole } from "../generated/prisma/enums";
import * as httpsStatus from "../common/httpStatus";

function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401, httpsStatus.ERROR));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "You don't have permission to do this",
          403,
          httpsStatus.ERROR,
        ),
      );
    }
    next();
  };
}

export default requireRole;
