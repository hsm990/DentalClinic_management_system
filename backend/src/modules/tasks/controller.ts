import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import tasksService from "./service";

const list = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await tasksService.listTasks(req.user!);
  res.json({ tasks });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.createTask(req.user!, req.body);
  res.status(201).json({ task });
});

const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.updateTaskStatus(
    req.user!,
    req.params.id as string,
    req.body.status,
  );
  res.json({ task });
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  await tasksService.deleteTask(req.user!, req.params.id as string);
  res.status(200).json({ message: "Task deleted" });
});

export default { list, create, updateStatus, remove };
