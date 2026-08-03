import { Router } from "express";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import { idParamSchema } from "../common/schema";
import {
  createAppointmentSchema,
  updateStatusSchema,
  listAppointmentsQuerySchema,
} from "../modules/appointments/schema";
import appointmentsController from "../modules/appointments/controller";

const router = Router();

router
  .route("/")
  .get(
    validate(listAppointmentsQuerySchema, "query"),
    appointmentsController.list,
  )
  .post(
    requireRole("ADMIN", "RECEPTIONIST", "DENTIST"),
    validate(createAppointmentSchema),
    appointmentsController.create,
  );
router
  .route("/:id/status")
  .patch(
    requireRole("ADMIN", "RECEPTIONIST", "DENTIST", "ASSISTANT"),
    validate(idParamSchema, "params"),
    validate(updateStatusSchema),
    appointmentsController.updateStatus,
  );

export default router;
