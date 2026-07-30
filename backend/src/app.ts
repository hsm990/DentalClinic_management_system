import express from "express";
import cors from "cors";
import helmet from "helmet";
import { asyncHandler } from "./common/asyncHandler";
import prisma from "./config/prisma";
import authRouter from "./routes/auth.routes";
import clinicsRouter from "./routes/clinics.route";
import usersRouter from "./routes/users.route";
import patientsRouter from "./routes/patients.route";
import appointmentsRouter from "./routes/appointments.route";
import proceduresRouter from "./routes/procedures.route";
import procedureCategoriesRouter from "./routes/procedure-categories.route";
import treatmentPlansRouter from "./routes/treatment-plans.route";
import invoicesRouter from "./routes/invoices.route";

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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/clinics", clinicsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/patients", patientsRouter);
app.use("/api/v1/appointments", appointmentsRouter);
app.use("/api/v1/procedures", proceduresRouter);
app.use("/api/v1/procedure-categories", procedureCategoriesRouter);
app.use("/api/v1/treatment-plans", treatmentPlansRouter);
app.use("/api/v1/invoices", invoicesRouter);

export default app;
