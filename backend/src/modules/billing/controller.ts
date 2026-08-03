import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import billingService from "./service";

const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await billingService.createInvoice(
    req.user!,
    req.params.patientId as string,
    req.body,
  );
  res.status(201).json({ invoice });
});

const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await billingService.getInvoice(
    req.user!,
    req.params.id as string,
  );
  res.json({ invoice });
});

const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await billingService.recordPayment(
    req.user!,
    req.params.id as string,
    req.body,
  );
  res.status(201).json({ payment });
});

const getRevenue = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as any;
  const revenue = await billingService.getRevenue(req.user!, from, to);
  res.json({ revenue });
});

export default { createInvoice, getInvoice, recordPayment, getRevenue };
