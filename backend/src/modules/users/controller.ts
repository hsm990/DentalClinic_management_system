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
const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await userService.listStaff(req.user!);
  res.json({ staff });
});
export default { create, listDentists, listStaff };
