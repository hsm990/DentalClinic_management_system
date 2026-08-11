import { Request, Response } from "express";
import userService from "./service";
import { asyncHandler } from "../../common/asyncHandler";

const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.user!, req.body);
  res.status(201).json({ user });
});
const listDentists = asyncHandler(async (req: Request, res: Response) => {
  const dentists = await userService.listDentists(req.user!);
  res.json({ dentists });
});
export default { create, listDentists };
