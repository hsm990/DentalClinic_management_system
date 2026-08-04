import request from "supertest";
import app from "../src/app";
import { testPrisma, resetDb } from "./testDb";
import { createClinicWithAdmin, createPatient } from "./fixtures";
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

describe("tenant isolation", () => {
  it("clinic B cannot see clinic A's patients", async () => {
    const { clinic: clinicA, admin: adminA } = await createClinicWithAdmin({
      adminEmail: "a@test.dev",
    });
    const { admin: adminB } = await createClinicWithAdmin({
      adminEmail: "b@test.dev",
    });
    await createPatient(clinicA.id);

    const tokenB = await loginAs(adminB.email);

    const res = await request(app)
      .get("/api/v1/patients")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.patients).toHaveLength(0);
  });

  it("fetching another clinic's patient by id returns 404, not the data", async () => {
    const { clinic: clinicA } = await createClinicWithAdmin({
      adminEmail: "a2@test.dev",
    });
    const { admin: adminB } = await createClinicWithAdmin({
      adminEmail: "b2@test.dev",
    });
    const patient = await createPatient(clinicA.id);

    const tokenB = await loginAs(adminB.email);

    const res = await request(app)
      .get(`/api/v1/patients/${patient.id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });
});
afterAll(async () => {
  await testPrisma.$disconnect();
  await prisma.$disconnect();
});
