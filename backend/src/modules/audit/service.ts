import AppError from "../../common/AppError";
import auditRepository from "./repository";
import * as httpsStatus from "../../common/httpStatus";

interface RequestingUser {
  id: string;
  role: string;
  clinicId: string | null;
}

async function listLogs(user: RequestingUser, filters: any) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  return auditRepository.findAll(user.clinicId, filters);
}

export default { listLogs };
