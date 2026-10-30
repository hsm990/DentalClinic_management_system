import { Router } from "express";
import validate from "../middleware/validate.middleware";
import requireRole from "../middleware/rbac.middleware";
import {
  onboardClinicSchema,
  clinicIdParamSchema,
  updateClinicSchema,
} from "../modules/clinics/schema";
import clinicController from "../modules/clinics/controller";
const router = Router();
router.get("/", requireRole("SUPER_ADMIN"), clinicController.listAll);
router
  .route("/onboard")
  .post(
    requireRole("SUPER_ADMIN"),
    validate(onboardClinicSchema),
    clinicController.onboard,
  );
router.get("/me", clinicController.getMine);
router
  .route("/:id")
  .get(
    requireRole("SUPER_ADMIN"),
    validate(clinicIdParamSchema, "params"),
    clinicController.getById,
  );
router.patch(
  "/me",
  requireRole("ADMIN"),
  validate(updateClinicSchema),
  clinicController.updateMine,
);
export default router;
