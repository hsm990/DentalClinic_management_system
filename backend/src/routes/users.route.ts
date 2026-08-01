import { Router } from "express";
import userController from "../modules/users/controller";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import { createUserSchema } from "../modules/users/schema";
const router = Router();

router
  .route("/")
  .get()
  .post(
    requireRole("ADMIN"),
    validate(createUserSchema),
    userController.create,
  );
router.route("/:id").get().put().delete();

export default router;
