import express from "express";
import cors from "cors";
import helmet from "helmet";
import { asyncHandler } from "./common/asyncHandler";
import prisma from "./config/prisma";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware";

import authRouter from "./routes/auth.routes";
import clinicsRouter from "./routes/clinics.route";
import usersRouter from "./routes/users.route";
import patientsRouter from "./routes/patients.route";
import appointmentsRouter from "./routes/appointments.route";
import catalogRouter from "./routes/catalog.route";
import treatmentPlansRouter from "./routes/treatment-plans.route";
import invoicesRouter from "./routes/invoices.route";
import authMiddleware from "./middleware/auth.middleware";

const app = express();

app.use(helmet());
app.use(cookieParser());

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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/clinics", authMiddleware, clinicsRouter);
app.use("/api/v1/users", authMiddleware, usersRouter);
app.use("/api/v1/patients", authMiddleware, patientsRouter);
app.use("/api/v1/appointments", appointmentsRouter);
app.use("/api/v1/procedure-categories", authMiddleware, catalogRouter);
app.use("/api/v1/treatment-plans", treatmentPlansRouter);
app.use("/api/v1/invoices", invoicesRouter);

app.use(errorMiddleware);
export default app;
