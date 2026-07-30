import { Router } from "express";
const router = Router();

router.route("/").get();
router.route("/login").post();
router.route("/logout").post();
router.route("/refresh").get();
router.route("/me").get();

export default router;
