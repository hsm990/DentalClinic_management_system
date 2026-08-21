import { Router } from "express";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import { idParamSchema } from "../common/schema";
import {
  createTreatmentPlanSchema,
  addPlanItemSchema,
  updateItemStatusSchema,
} from "../modules/treatment-plans/schema";
import treatmentPlansController from "../modules/treatment-plans/controller";

const router = Router();

router.get(
  "/patients/:patientId/treatment-plans",
  treatmentPlansController.list,
);

router.post(
  "/patients/:patientId/treatment-plans",
  requireRole("ADMIN", "DENTIST"),
  validate(createTreatmentPlanSchema),
  treatmentPlansController.create,
);

router.post(
  "/treatment-plans/:planId/items",
  requireRole("ADMIN", "DENTIST"),
  validate(addPlanItemSchema),
  treatmentPlansController.addItem,
);

router.patch(
  "/treatment-plan-items/:id/status",
  requireRole("ADMIN", "DENTIST"),
  validate(idParamSchema, "params"),
  validate(updateItemStatusSchema),
  treatmentPlansController.updateItemStatus,
);
router.delete(
  "/treatment-plans/:planId",
  requireRole("ADMIN", "DENTIST"),
  treatmentPlansController.remove,
);
export default router;
