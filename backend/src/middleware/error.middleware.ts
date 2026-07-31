import { Request, Response, NextFunction } from "express";
import AppError from "../common/AppError";

function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, status: err.statusText },
    });
  }
  return res.status(500).json({
    error: { message: "Something went wrong" },
  });
}

export default errorMiddleware;
