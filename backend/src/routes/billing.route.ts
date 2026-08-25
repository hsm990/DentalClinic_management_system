import { Router } from "express";
import requireRole from "../middleware/rbac.middleware";
import validate from "../middleware/validate.middleware";
import { idParamSchema } from "../common/schema";
import {
  createInvoiceSchema,
  recordPaymentSchema,
  revenueQuerySchema,
  financeSummaryQuerySchema,
} from "../modules/billing/schema";
import billingController from "../modules/billing/controller";

const router = Router();

router.post(
  "/patients/:patientId/invoices",
  requireRole("ADMIN", "RECEPTIONIST"),
  validate(createInvoiceSchema),
  billingController.createInvoice,
);

router.get(
  "/invoices/:id",
  validate(idParamSchema, "params"),
  billingController.getInvoice,
);

router.post(
  "/invoices/:id/payments",
  requireRole("ADMIN", "RECEPTIONIST"),
  validate(idParamSchema, "params"),
  validate(recordPaymentSchema),
  billingController.recordPayment,
);

router.get(
  "/reports/revenue",
  requireRole("ADMIN"),
  validate(revenueQuerySchema, "query"),
  billingController.getRevenue,
);
router.get(
  "/patients/:patientId/invoices",
  billingController.listPatientInvoices,
);
router.get(
  "/reports/outstanding",
  requireRole("ADMIN", "RECEPTIONIST"),
  billingController.getOutstandingSummary,
);
router.get(
  "/reports/finance-summary",
  requireRole("ADMIN"),
  validate(financeSummaryQuerySchema, "query"),
  billingController.getFinanceSummary,
);
export default router;
