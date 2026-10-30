import { Router } from "express";
import validate from "../middleware/validate.middleware";
import catalogController from "../modules/catalog/controller";
import requireRole from "../middleware/rbac.middleware";
import { idParamSchema } from "../common/schema";
import {
  createCategorySchema,
  createProcedureSchema,
  updateProcedureSchema,
  setProcedureActiveSchema,
  updateCategorySchema,
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
router.patch(
  "/categories/:id",
  requireRole("ADMIN"),
  validate(updateCategorySchema),
  catalogController.updateCategory,
);
router.delete(
  "/categories/:id",
  requireRole("ADMIN"),
  catalogController.deleteCategory,
);
router.patch(
  "/procedures/:id/status",
  requireRole("ADMIN"),
  validate(setProcedureActiveSchema),
  catalogController.setProcedureActive,
);
export default router;
