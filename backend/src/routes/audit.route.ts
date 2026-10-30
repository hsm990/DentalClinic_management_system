import { Router } from "express";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import { listAuditLogsQuerySchema } from "../modules/audit/schema";
import auditController from "../modules/audit/controller";

const router = Router();
router.get(
  "/",
  requireRole("ADMIN"),
  validate(listAuditLogsQuerySchema, "query"),
  auditController.list,
);
export default router;
