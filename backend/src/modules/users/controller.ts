import { Request, Response } from "express";
import userService from "./service";
import { asyncHandler } from "../../common/asyncHandler";

const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.user!, req.body);
  res.status(201).json({ user });
});

export default { create };
