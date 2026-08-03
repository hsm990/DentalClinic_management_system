import { Router } from "express";
import { z } from "zod";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import {
  createTreatmentPlanSchema,
  addPlanItemSchema,
  updateItemStatusSchema,
} from "../modules/treatment-plans/schema";
import treatmentPlansController from "../modules/treatment-plans/controller";

const router = Router();

const planIdParamSchema = z.object({
  planId: z.cuid("Invalid id"),
});

const itemIdParamSchema = z.object({
  id: z.cuid("Invalid id"),
});

router
  .route("/")
  .get(treatmentPlansController.list)
  .post(
    requireRole("ADMIN", "DENTIST", "RECEPTIONIST"),
    validate(createTreatmentPlanSchema),
    treatmentPlansController.create,
  );

router.post(
  "/:planId/items",
  requireRole("ADMIN", "DENTIST"),
  validate(planIdParamSchema, "params"),
  validate(addPlanItemSchema),
  treatmentPlansController.addItem,
);

router.patch(
  "/items/:id/status",
  requireRole("ADMIN", "DENTIST", "ASSISTANT"),
  validate(itemIdParamSchema, "params"),
  validate(updateItemStatusSchema),
  treatmentPlansController.updateItemStatus,
);

export default router;
