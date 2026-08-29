import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import todosService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as Record<string, string>;
  const todos = await todosService.listTodos(req.user!.id, {
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });
  res.json({ todos });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todosService.createTodo(req.user!.id, req.body);
  res.status(201).json({ todo });
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todosService.updateTodo(
    req.user!.id,
    req.params.id as string,
    req.body,
  );
  res.json({ todo });
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  await todosService.deleteTodo(req.user!.id, req.params.id as string);
  res.status(200).json({ message: "Todo deleted" });
});

export default { list, create, update, remove };
