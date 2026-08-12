import { Router } from "express";
import userController from "../modules/users/controller";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import { createUserSchema } from "../modules/users/schema";
const router = Router();

router
  .route("/")
  .post(
    requireRole("ADMIN"),
    validate(createUserSchema),
    userController.create,
  );
router.get("/dentists", userController.listDentists);
router.get("/", requireRole("ADMIN"), userController.listStaff);
export default router;
