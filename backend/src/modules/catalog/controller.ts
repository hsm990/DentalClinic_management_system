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
const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await catalogService.updateCategory(
    req.user!,
    req.params.id as string,
    req.body,
  );
  res.json({ category });
});

const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await catalogService.deleteCategory(req.user!, req.params.id as string);
  res.status(200).json({ message: "Category deleted" });
});

const listProcedures = asyncHandler(async (req: Request, res: Response) => {
  const procedures = await catalogService.listProcedures(
    req.user!,
    req.query.includeInactive === "true",
  );
  res.json({ procedures });
});

const setProcedureActive = asyncHandler(async (req: Request, res: Response) => {
  const procedure = await catalogService.setProcedureActive(
    req.user!,
    req.params.id as string,
    req.body.isActive,
  );
  res.json({ procedure });
});
export default {
  listCategories,
  createCategory,
  listProcedures,
  createProcedure,
  updateProcedure,
  deleteCategory,
  setProcedureActive,
  updateCategory,
};
