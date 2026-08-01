import clinicService from "./service";
import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";

const onboard = asyncHandler(async (req: Request, res: Response) => {
  const result = await clinicService.onboardClinic(req.body);
  res.status(201).json(result);
});

const getMine = asyncHandler(async (req: Request, res: Response) => {
  const clinic = await clinicService.getMyClinic(req.user!);
  res.json({ clinic });
});
const getById = asyncHandler(async (req: Request, res: Response) => {
  const clinic = await clinicService.getClinicById(req.params.id as string);
  res.json({ clinic });
});

export default { onboard, getMine, getById };
