import { Router } from "express";
import rateLimiter from "../common/rateLimiter";
import validate from "../middleware/validate.middleware";
import { loginSchema } from "../modules/auth/schema";
import authController from "../modules/auth/controller";
import authMiddleware from "../middleware/auth.middleware";
import { changePasswordSchema } from "../modules/auth/schema";
const router = Router();

router.route("/").get((_req, res) => {
  res.send("Auth API");
});
router
  .route("/login")
  .post(
    rateLimiter("too many login attemps try later"),
    validate(loginSchema),
    authController.login,
  );
router.route("/logout").post(authMiddleware, authController.logout);
router.route("/refresh").post(authController.refresh);
router.route("/me").get(authMiddleware, authController.me);
router
  .route("/change-password")
  .post(
    authMiddleware,
    rateLimiter("Too many attempts, try again later"),
    validate(changePasswordSchema),
    authController.changePassword,
  );
export default router;
