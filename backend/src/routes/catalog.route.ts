import { Router } from "express";
import validate from "../middleware/validate.middleware";
import catalogController from "../modules/catalog/controller";
import requireRole from "../middleware/rbac.middleware";
import { idParamSchema } from "../common/schema";
import {
  createCategorySchema,
  createProcedureSchema,
  updateProcedureSchema,
} from "../modules/catalog/schema";

const router = Router();

router
  .route("/categories")
  .get(catalogController.listCategories)
  .post(
    requireRole("ADMIN"),
    validate(createCategorySchema),
    catalogController.createCategory,
  );
router
  .route("/procedures")
  .get(catalogController.listProcedures)
  .post(
    requireRole("ADMIN"),
    validate(createProcedureSchema),
    catalogController.createProcedure,
  );

router.patch(
  "/procedures/:id",
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateProcedureSchema),
  catalogController.updateProcedure,
);

export default router;
