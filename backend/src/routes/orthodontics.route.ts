import { Router } from "express";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import {
  createCaseSchema,
  updateCaseStatusSchema,
  addVisitSchema,
} from "../modules/orthodontics/schema";
import orthoController from "../modules/orthodontics/controller";

const router = Router();

router.get("/patients/:patientId/orthodontic-cases", orthoController.list);

router.post(
  "/patients/:patientId/orthodontic-cases",
  requireRole("ADMIN", "DENTIST"),
  validate(createCaseSchema),
  orthoController.create,
);

router.patch(
  "/orthodontic-cases/:caseId/status",
  requireRole("ADMIN", "DENTIST"),
  validate(updateCaseStatusSchema),
  orthoController.updateStatus,
);

router.post(
  "/orthodontic-cases/:caseId/visits",
  requireRole("ADMIN", "DENTIST", "ASSISTANT"),
  validate(addVisitSchema),
  orthoController.addVisit,
);

export default router;
