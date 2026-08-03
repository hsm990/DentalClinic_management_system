import { Router } from "express";
import validate from "../middleware/validate.middleware";
import requireRole from "../middleware/rbac.middleware";
import {
  onboardClinicSchema,
  clinicIdParamSchema,
} from "../modules/clinics/schema";
import clinicController from "../modules/clinics/controller";
const router = Router();

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

export default router;
