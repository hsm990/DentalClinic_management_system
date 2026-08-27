import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import orthoService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const cases = await orthoService.listCases(
    req.user!,
    req.params.patientId as string,
  );
  res.json({ cases });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const orthoCase = await orthoService.createCase(
    req.user!,
    req.params.patientId as string,
    req.body,
  );
  res.status(201).json({ case: orthoCase });
});

const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const orthoCase = await orthoService.updateStatus(
    req.user!,
    req.params.caseId as string,
    req.body.status,
  );
  res.json({ case: orthoCase });
});

const addVisit = asyncHandler(async (req: Request, res: Response) => {
  const visit = await orthoService.addVisit(
    req.user!,
    req.params.caseId as string,
    req.body,
  );
  res.status(201).json({ visit });
});

export default { list, create, updateStatus, addVisit };
