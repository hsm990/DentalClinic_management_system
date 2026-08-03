import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import appointmentsService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const appointments = await appointmentsService.listAppointments(
    req.user!,
    req.query,
  );
  res.json({ appointments });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentsService.createAppointment(
    req.user!,
    req.body,
  );
  res.status(201).json({ appointment });
});

const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentsService.updateStatus(
    req.user!,
    req.params.id as string,
    req.body.status,
  );
  res.json({ appointment });
});

export default { list, create, updateStatus };
