import { Router } from "express";
import rateLimiter from "../common/rateLimiter";
import validate from "../middleware/validate.middleware";
import { loginSchema } from "../modules/auth/schema";
import authController from "../modules/auth/controller";
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
router.route("/logout").post((_req, res) => {
  res.send("Auth API");
});
router.route("/refresh").get((_req, res) => {
  res.send("Auth API");
});
router.route("/me").get((_req, res) => {
  res.send("Auth API");
});

export default router;
