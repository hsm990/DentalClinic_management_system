import clinicService from "./service";
import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";

const onboard = asyncHandler(async (req: Request, res: Response) => {
  const result = await clinicService.onboardClinic(req.user!, req.body); // user added
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
const updateMine = asyncHandler(async (req: Request, res: Response) => {
  const clinic = await clinicService.updateMyClinic(req.user!, req.body);
  res.json({ clinic });
});
const listAll = asyncHandler(async (_req: Request, res: Response) => {
  const clinics = await clinicService.listAllClinics();
  res.json({ clinics });
});

const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const clinic = await clinicService.setClinicActive(
    req.user!,
    req.params.id as string,
    req.body.isActive,
  );
  res.json({ clinic });
});

const updateSubscription = asyncHandler(async (req: Request, res: Response) => {
  const clinic = await clinicService.updateSubscription(
    req.user!,
    req.params.id as string,
    req.body,
  );
  res.json({ clinic });
});

const resetAdminPassword = asyncHandler(async (req: Request, res: Response) => {
  await clinicService.resetAdminPassword(
    req.user!,
    req.params.id as string,
    req.body.adminId,
    req.body.newPassword,
  );
  res.json({ message: "Password reset" });
});
const extend = asyncHandler(async (req: Request, res: Response) => {
  const clinic = await clinicService.extendSubscription(
    req.user!,
    req.params.id as string,
    req.body.plan,
    req.body.days,
  );
  res.json({ clinic });
});
export default {
  onboard,
  getMine,
  getById,
  updateMine,
  listAll,
  setStatus,
  updateSubscription,
  resetAdminPassword,
  extend,
};
