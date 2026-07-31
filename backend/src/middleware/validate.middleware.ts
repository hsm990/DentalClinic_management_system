import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import AppError from "../common/AppError";
import * as httpStatus from "../common/httpStatus";

type ValidateTarget = "body" | "params" | "query";

function validate(schema: ZodType, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      return next(new AppError(message, 422, httpStatus.FAIL));
    }

    req[target] = result.data;
    next();
  };
}

export default validate;
