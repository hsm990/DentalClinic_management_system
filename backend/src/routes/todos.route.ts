import { Router } from "express";
import validate from "../middleware/validate.middleware";
import {
  createTodoSchema,
  updateTodoSchema,
  listTodosQuerySchema,
} from "../modules/todos/schema";
import todosController from "../modules/todos/controller";

const router = Router();

// no requireRole at all — every authenticated user manages their own list
router.get("/", validate(listTodosQuerySchema, "query"), todosController.list);
router.post("/", validate(createTodoSchema), todosController.create);
router.patch("/:id", validate(updateTodoSchema), todosController.update);
router.delete("/:id", todosController.remove);

export default router;
