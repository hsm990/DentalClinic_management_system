import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import authService from "./service";
import AppError from "../../common/AppError";
import * as httpStatus from "../../common/httpStatus";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
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
    data: {
      accessToken,
      user,
    },
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
export default { login, refresh };
