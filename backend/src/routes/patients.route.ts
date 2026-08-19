import { Router } from "express";
import validate from "../middleware/validate.middleware";
import requireRole from "../middleware/rbac.middleware";
import { idParamSchema } from "../common/schema";
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsQuerySchema,
} from "../modules/patients/schema";
import patientsController from "../modules/patients/controller";
import toothChartRoutes from "./tooth-chart.route";
const router = Router();
router
  .route("/")
  .get(validate(listPatientsQuerySchema, "query"), patientsController.list);

router.patch(
  "/:id/archive",
  requireRole("ADMIN", "RECEPTIONIST"),
  validate(idParamSchema, "params"),
  patientsController.archive,
);

router.patch(
  "/:id/restore",
  requireRole("ADMIN", "RECEPTIONIST"),
  validate(idParamSchema, "params"),
  patientsController.restore,
);
router
  .route("/")
  .post(
    requireRole("ADMIN", "DENTIST", "ASSISTANT", "RECEPTIONIST"),
    validate(createPatientSchema),
    patientsController.create,
  );
router
  .route("/:id")
  .get(validate(idParamSchema, "params"), patientsController.getById)
  .patch(
    requireRole("ADMIN", "RECEPTIONIST", "DENTIST"),
    validate(idParamSchema, "params"),
    validate(updatePatientSchema),
    patientsController.update,
  )
  .delete(
    requireRole("ADMIN", "RECEPTIONIST", "DENTIST"),
    validate(idParamSchema, "params"),
    patientsController.remove,
  );
router.use("/", toothChartRoutes);

export default router;
