import { Router } from "express";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
} from "../modules/expenses/schema";
import expensesController from "../modules/expenses/controller";

const router = Router();

router.get(
  "/",
  requireRole("ADMIN"),
  validate(listExpensesQuerySchema, "query"),
  expensesController.list,
);
router.post(
  "/",
  requireRole("ADMIN"),
  validate(createExpenseSchema),
  expensesController.create,
);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(updateExpenseSchema),
  expensesController.update,
);
router.delete("/:id", requireRole("ADMIN"), expensesController.remove);

export default router;
