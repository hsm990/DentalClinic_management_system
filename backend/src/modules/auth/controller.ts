import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import authService from "./service";
import AppError from "../../common/AppError";
import * as httpStatus from "../../common/httpStatus";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.logIn(
    email,
    password,
  );
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({
    accessToken,
    user,
  });
});

const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError("No refresh token provided", 401, httpStatus.ERROR);
  }
  const accessToken = authService.refreshAccessToken(token);
  res.json({ accessToken });
});

const me = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = await authService.getCurrentUser(req.user!.id);
  res.json({ user: currentUser });
});

const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
});

export default { login, refresh, me, logout };
