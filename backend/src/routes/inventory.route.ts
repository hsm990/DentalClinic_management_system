import { Router } from "express";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  adjustQuantitySchema,
} from "../modules/inventory/schema";
import inventoryController from "../modules/inventory/controller";

const router = Router();

router.get("/", inventoryController.list);
router.get("/low-stock", inventoryController.getLowStockSummary);

router.post(
  "/",
  requireRole("ADMIN"),
  validate(createInventoryItemSchema),
  inventoryController.create,
);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  validate(updateInventoryItemSchema),
  inventoryController.update,
);
router.delete("/:id", requireRole("ADMIN"), inventoryController.remove);

router.patch(
  "/:id/quantity",
  requireRole("ADMIN", "ASSISTANT"),
  validate(adjustQuantitySchema),
  inventoryController.adjustQuantity,
);

export default router;
