import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import patientsService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const patients = await patientsService.listPatients(req.user!, search);
  res.json({ patients });
});

const getById = asyncHandler(async (req: Request, res: Response) => {
  const patient = await patientsService.getPatient(
    req.user!,
    req.params.id as string,
  );
  res.json({ patient });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const patient = await patientsService.createPatient(req.user!, req.body);
  res.status(201).json({ patient });
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const patient = await patientsService.updatePatient(
    req.user!,
    req.params.id as string,
    req.body,
  );
  res.json({ patient });
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  await patientsService.deletePatient(req.user!, req.params.id as string);
  res.status(200).json({ message: "Patient deleted" });
});
export default { list, getById, create, update, remove };
