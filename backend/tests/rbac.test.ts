import request from "supertest";
import app from "../src/app";
import { testPrisma, resetDb } from "./testDb";
import { createClinicWithAdmin, createDentist } from "./fixtures";
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

describe("RBAC", () => {
  it("rejects a request with no token at all — 401", async () => {
    const res = await request(app).get("/api/v1/patients");
    expect(res.status).toBe(401);
  });

  it("a DENTIST cannot create a staff user — 403", async () => {
    const { clinic } = await createClinicWithAdmin();
    const dentist = await createDentist(clinic.id);
    const token = await loginAs(dentist.email);

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "new@test.dev",
        password: "password123",
        firstName: "New",
        lastName: "User",
        role: "RECEPTIONIST",
      });

    expect(res.status).toBe(403);
  });

  it("an ADMIN can create a staff user — 201", async () => {
    const { admin } = await createClinicWithAdmin();
    const token = await loginAs(admin.email);

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "staff@test.dev",
        password: "password123",
        firstName: "Staff",
        lastName: "Member",
        role: "RECEPTIONIST",
      });

    expect(res.status).toBe(201);
  });
});
afterAll(async () => {
  await testPrisma.$disconnect();
  await prisma.$disconnect();
});
