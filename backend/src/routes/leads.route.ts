import { Router } from "express";
import rateLimit from "express-rate-limit";
import validate from "../middleware/validate.middleware";
import authMiddleware from "../middleware/auth.middleware";
import requireRole from "../middleware/rbac.middleware";
import {
  createLeadSchema,
  updateLeadStatusSchema,
} from "../modules/leads/schema";
import leadsController from "../modules/leads/controller";

const router = Router();

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // same spirit as the login limiter — this is a public, unauthenticated endpoint
  message: { error: { message: "Too many requests, try again later" } },
});

// public — no authMiddleware, this is the whole point
router.post(
  "/",
  leadLimiter,
  validate(createLeadSchema),
  leadsController.create,
);

// viewing leads requires being logged in as SUPER_ADMIN
router.get(
  "/",
  authMiddleware,
  requireRole("SUPER_ADMIN"),
  leadsController.list,
);
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("SUPER_ADMIN"),
  validate(updateLeadStatusSchema),
  leadsController.updateStatus,
);
export default router;
