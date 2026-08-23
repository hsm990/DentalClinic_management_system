import { Router } from "express";
import validate from "../middleware/validate.middleware";
import requireRole from "../middleware/rbac.middleware";

import {
  createTaskSchema,
  updateTaskStatusSchema,
} from "../modules/tasks/schema";
import tasksController from "../modules/tasks/controller";

const router = Router();

// any authenticated staff member can create and view tasks — matches
// "all clinic members can add tasks"
router.get("/", tasksController.list);
router.post("/", validate(createTaskSchema), tasksController.create);
router.patch(
  "/:id/status",
  validate(updateTaskStatusSchema),
  tasksController.updateStatus,
);
router.delete("/:id", requireRole("ADMIN"), tasksController.remove);

export default router;
