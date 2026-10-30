import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import expensesService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as Record<string, string>;
  const expenses = await expensesService.listExpenses(req.user!, {
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });
  res.json({ expenses });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expensesService.createExpense(req.user!, req.body);
  res.status(201).json({ expense });
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expensesService.updateExpense(
    req.user!,
    req.params.id as string,
    req.body,
  );
  res.json({ expense });
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  await expensesService.deleteExpense(req.user!, req.params.id as string);
  res.status(200).json({ message: "Expense deleted" });
});

export default { list, create, update, remove };
