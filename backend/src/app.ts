import express from "express";
import cors from "cors";
import helmet from "helmet";
import { asyncHandler } from "./common/AsyncHandler";
import prisma from "./config/prisma";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS ?? "").split(",").filter(Boolean),
    credentials: true,
  }),
);
app.get(
  "/api/v1/health",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  }),
);

export default app;
