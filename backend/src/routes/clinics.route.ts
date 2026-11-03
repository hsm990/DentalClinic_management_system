import { Router } from "express";
import validate from "../middleware/validate.middleware";
import requireRole from "../middleware/rbac.middleware";
import {
  onboardClinicSchema,
  clinicIdParamSchema,
  updateClinicSchema,
  setClinicStatusSchema,
  updateSubscriptionSchema,
  resetAdminPasswordSchema,
  extendSubscriptionSchema,
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
router.patch(
  "/:id/status",
  requireRole("SUPER_ADMIN"),
  validate(clinicIdParamSchema, "params"),
  validate(setClinicStatusSchema),
  clinicController.setStatus,
);
router.patch(
  "/:id/subscription",
  requireRole("SUPER_ADMIN"),
  validate(clinicIdParamSchema, "params"),
  validate(updateSubscriptionSchema),
  clinicController.updateSubscription,
);
router.post(
  "/:id/reset-admin-password",
  requireRole("SUPER_ADMIN"),
  validate(clinicIdParamSchema, "params"),
  validate(resetAdminPasswordSchema),
  clinicController.resetAdminPassword,
);
router.post(
  "/:id/extend",
  requireRole("SUPER_ADMIN"),
  validate(clinicIdParamSchema, "params"),
  validate(extendSubscriptionSchema),
  clinicController.extend,
);
export default router;
