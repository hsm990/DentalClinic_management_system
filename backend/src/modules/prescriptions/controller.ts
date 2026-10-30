import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import prescriptionsService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const prescriptions = await prescriptionsService.listPrescriptions(
    req.user!,
    req.params.patientId as string,
  );
  res.json({ prescriptions });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const prescription = await prescriptionsService.createPrescription(
    req.user!,
    req.params.patientId as string,
    req.body,
  );
  res.status(201).json({ prescription });
});

export default { list, create };
