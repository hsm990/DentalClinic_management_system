// src/types/express.d.ts
import { UserRole } from "../generated/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        clinicId: string | null;
      };
    }
  }
}

export {};
