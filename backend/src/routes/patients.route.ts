import { Router } from "express";
import validate from "../middleware/validate.middleware";
import requireRole from "../middleware/rbac.middleware";
import { idParamSchema } from "../common/schema";
import {
  createPatientSchema,
  updatePatientSchema,
} from "../modules/patients/schema";
import patientsController from "../modules/patients/controller";
import toothChartRoutes from "./tooth-chart.route";
const router = Router();

router
  .route("/")
  .get(patientsController.list)
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
