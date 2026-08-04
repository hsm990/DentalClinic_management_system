import request from "supertest";
import app from "../src/app";
import { testPrisma, resetDb } from "./testDb";
import {
  createClinicWithAdmin,
  createDentist,
  createPatient,
} from "./fixtures";
import prisma from "../src/config/prisma";
beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

async function loginAs(email: string) {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });
  return res.body.accessToken as string;
}

describe("appointment status transitions", () => {
  it("rejects SCHEDULED -> CHECKED_IN (skipping CONFIRMED) with 422", async () => {
    const { clinic, admin } = await createClinicWithAdmin();
    const dentist = await createDentist(clinic.id);
    const patient = await createPatient(clinic.id);
    const token = await loginAs(admin.email);

    const created = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientId: patient.id,
        dentistId: dentist.id,
        scheduledAt: "2026-08-10T09:00:00Z",
      });

    const res = await request(app)
      .patch(`/api/v1/appointments/${created.body.appointment.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "CHECKED_IN" });

    expect(res.status).toBe(422);
  });

  it("allows SCHEDULED -> CONFIRMED -> CHECKED_IN in order", async () => {
    const { clinic, admin } = await createClinicWithAdmin();
    const dentist = await createDentist(clinic.id);
    const patient = await createPatient(clinic.id);
    const token = await loginAs(admin.email);

    const created = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientId: patient.id,
        dentistId: dentist.id,
        scheduledAt: "2026-08-10T09:00:00Z",
      });

    const id = created.body.appointment.id;

    await request(app)
      .patch(`/api/v1/appointments/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "CONFIRMED" });

    const res = await request(app)
      .patch(`/api/v1/appointments/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "CHECKED_IN" });

    expect(res.status).toBe(200);
    expect(res.body.appointment.status).toBe("CHECKED_IN");
  });
});
afterAll(async () => {
  await testPrisma.$disconnect();
  await prisma.$disconnect();
});
