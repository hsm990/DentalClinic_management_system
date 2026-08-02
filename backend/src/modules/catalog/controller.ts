import { Request, Response } from "express";
import catalogService from "./service";
import { asyncHandler } from "../../common/asyncHandler";

const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const list = await catalogService.listCategories(req.user!);
  res.status(200).json({ list });
});

const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const createdCategory = catalogService.createCategory(req.user!, req.body);
  res.status(201).json({ createdCategory });
});

const listProcedures = asyncHandler(async (req: Request, res: Response) => {
  const procedures = await catalogService.listProcedures(req.user!);
  res.json({ procedures });
});

const createProcedure = asyncHandler(async (req: Request, res: Response) => {
  const procedure = await catalogService.createProcedure(req.user!, req.body);
  res.status(201).json({ procedure });
});

const updateProcedure = asyncHandler(async (req: Request, res: Response) => {
  const procedure = await catalogService.updateProcedure(
    req.user!,
    req.params.id as string,
    req.body,
  );
  res.json({ procedure });
});

export default {
  listCategories,
  createCategory,
  listProcedures,
  createProcedure,
  updateProcedure,
};
