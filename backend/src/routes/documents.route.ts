import { Router } from "express";
import { uploadDocument } from "../modules/documents/upload.middleware";
import documentsController from "../modules/documents/controller";

const router = Router();

router.get("/patients/:patientId/documents", documentsController.list);
router.post(
  "/patients/:patientId/documents",
  uploadDocument,
  documentsController.upload,
);
router.get("/documents/:id/download-url", documentsController.getDownloadUrl);
router.delete("/documents/:id", documentsController.remove);

export default router;
