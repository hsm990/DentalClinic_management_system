import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import treatmentPlansService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const plans = await treatmentPlansService.listPlans(
    req.user!,
    req.params.patientId as string,
  );
  res.json({ plans });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const plan = await treatmentPlansService.createPlan(
    req.user!,
    req.params.patientId as string,
    req.body,
  );
  res.status(201).json({ plan });
});

const addItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await treatmentPlansService.addItem(
    req.user!,
    req.params.planId as string,
    req.body,
  );
  res.status(201).json({ item });
});

const updateItemStatus = asyncHandler(async (req: Request, res: Response) => {
  const item = await treatmentPlansService.updateItemStatus(
    req.user!,
    req.params.id as string,
    req.body.status,
  );
  res.json({ item });
});

export default { list, create, addItem, updateItemStatus };
