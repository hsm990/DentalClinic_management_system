import * as httpStatus from "../common/httpStatus";
import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import AppError from "../common/AppError";

type ValidateTarget = "body" | "params" | "query";

function validate(schema: ZodType, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      return next(new AppError(message, 422, httpStatus.ERROR));
    }

    if (target === "query") {
      Object.keys(req.query).forEach((key) => {
        delete (req.query as Record<string, unknown>)[key];
      });
      Object.assign(req.query, result.data);
    } else {
      req[target] = result.data;
    }

    next();
  };
}

export default validate;
