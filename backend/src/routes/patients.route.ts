import { Router } from "express";
import validate from "../middleware/validate.middleware";
import requireRole from "../middleware/rbac.middleware";
import { idParamSchema } from "../common/schema";
import {
  createPatientSchema,
  updatePatientSchema,
} from "../modules/patients/schema";
import patientsController from "../modules/patients/controller";
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
  .put(
    requireRole("ADMIN", "RECEPTIONIST", "DENTIST"),
    validate(idParamSchema, "params"),
    validate(updatePatientSchema),
    patientsController.update,
  )
  .delete(
    requireRole("ADMIN", "RECEPTIONIST", "DENTIST"),
    validate(idParamSchema, "params"),
    patientsController.deletePatient,
  );

export default router;
