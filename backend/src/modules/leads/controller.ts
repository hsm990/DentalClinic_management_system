import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import leadsService from "./service";

const create = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadsService.createLead(req.body);
  res.status(201).json({ lead });
});

const list = asyncHandler(async (req: Request, res: Response) => {
  const leads = await leadsService.listLeads();
  res.json({ leads });
});
const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadsService.updateLeadStatus(
    req.params.id as string,
    req.body.status,
  );
  res.json({ lead });
});

export default { create, list, updateStatus };
