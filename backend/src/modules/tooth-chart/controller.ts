import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import toothChartService from "./service";

const getChart = asyncHandler(async (req: Request, res: Response) => {
  const chart = await toothChartService.getToothChart(
    req.user!,
    req.params.patientId as string,
  );
  res.json({ chart });
});

const upsertTooth = asyncHandler(async (req: Request, res: Response) => {
  const entry = await toothChartService.upsertTooth(
    req.user!,
    req.params.patientId as string,
    Number(req.params.toothNumber),
    req.body,
  );
  res.json({ entry });
});

export default { getChart, upsertTooth };
