import { Router } from "express";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import {
  patientIdParamSchema,
  toothParamSchema,
  upsertToothSchema,
} from "../modules/tooth-chart/schema";
import toothChartController from "../modules/tooth-chart/controller";

const router = Router();

router.get(
  "/:patientId/tooth-chart",
  validate(patientIdParamSchema, "params"),
  toothChartController.getChart,
);

router.put(
  "/:patientId/tooth-chart/:toothNumber",
  requireRole("ADMIN", "DENTIST", "ASSISTANT"),
  validate(toothParamSchema, "params"),
  validate(upsertToothSchema),
  toothChartController.upsertTooth,
);

export default router;
