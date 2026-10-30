import { Router } from "express";
import validate from "../middleware/validate.middleware";
import { createPrescriptionSchema } from "../modules/prescriptions/schema";
import prescriptionsController from "../modules/prescriptions/controller";

const router = Router();

router.get("/patients/:patientId/prescriptions", prescriptionsController.list);
router.post(
  "/patients/:patientId/prescriptions",
  validate(createPrescriptionSchema),
  prescriptionsController.create,
);

export default router;
