import { HttpStatus } from "../common/httpStatus";

class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  statusText: string;
  constructor(message: string, statusCode = 400, statusText: HttpStatus) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.statusText = statusText;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
