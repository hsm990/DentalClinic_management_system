import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import inventoryService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const items = await inventoryService.listItems(req.user!);
  res.json({ items });
});

const getLowStockSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await inventoryService.getLowStockSummary(req.user!);
  res.json(summary);
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.createItem(req.user!, req.body);
  res.status(201).json({ item });
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.updateItem(
    req.user!,
    req.params.id as string,
    req.body,
  );
  res.json({ item });
});

const adjustQuantity = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.adjustQuantity(
    req.user!,
    req.params.id as string,
    req.body.delta,
  );
  res.json({ item });
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  await inventoryService.deleteItem(req.user!, req.params.id as string);
  res.status(200).json({ message: "Item deleted" });
});

export default {
  list,
  getLowStockSummary,
  create,
  update,
  adjustQuantity,
  remove,
};
