import request from "supertest";
import app from "../src/app";
import { testPrisma, resetDb } from "./testDb";
import { createClinicWithAdmin } from "./fixtures";
import prisma from "../src/config/prisma";
beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

describe("POST /api/v1/auth/login", () => {
  it("returns an access token for valid credentials", async () => {
    const { admin } = await createClinicWithAdmin();

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: admin.email, password: "password123" });
    console.log("LOGIN RESPONSE BODY:", res.body); // ← temporary, remove after debugging

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(admin.email);
  });

  it("rejects an invalid password with 401", async () => {
    const { admin } = await createClinicWithAdmin();

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: admin.email, password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("rejects a malformed body with 422", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(422);
  });
});
afterAll(async () => {
  await testPrisma.$disconnect();
  await prisma.$disconnect();
});
