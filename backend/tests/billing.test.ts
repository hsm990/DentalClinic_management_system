import request from "supertest";
import app from "../src/app";
import { testPrisma, resetDb } from "./testDb";
import {
  createClinicWithAdmin,
  createPatient,
  createProcedure,
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

describe("billing", () => {
  it("blocks billing the same treatment-plan item twice", async () => {
    const { clinic, admin } = await createClinicWithAdmin();
    const patient = await createPatient(clinic.id);
    const procedure = await createProcedure(clinic.id);
    const token = await loginAs(admin.email);

    const plan = await testPrisma.treatmentPlan.create({
      data: { title: "Test plan", patientId: patient.id },
    });
    const item = await testPrisma.treatmentPlanItem.create({
      data: {
        treatmentPlanId: plan.id,
        procedureId: procedure.id,
        status: "COMPLETED",
        estimatedCost: 30,
      },
    });

    const firstInvoice = await request(app)
      .post(`/api/v1/patients/${patient.id}/invoices`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            procedureId: procedure.id,
            quantity: 1,
            treatmentPlanItemId: item.id,
          },
        ],
      });

    expect(firstInvoice.status).toBe(201);

    const secondInvoice = await request(app)
      .post(`/api/v1/patients/${patient.id}/invoices`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            procedureId: procedure.id,
            quantity: 1,
            treatmentPlanItemId: item.id,
          },
        ],
      });

    expect(secondInvoice.status).toBe(409);
  });

  it("flips invoice status PENDING -> PARTIALLY_PAID -> PAID as payments come in", async () => {
    const { clinic, admin } = await createClinicWithAdmin();
    const patient = await createPatient(clinic.id);
    const procedure = await createProcedure(clinic.id); // price 30
    const token = await loginAs(admin.email);

    const invoiceRes = await request(app)
      .post(`/api/v1/patients/${patient.id}/invoices`)
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ procedureId: procedure.id, quantity: 1 }] });

    const invoiceId = invoiceRes.body.invoice.id;

    await request(app)
      .post(`/api/v1/invoices/${invoiceId}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 10, method: "CASH" });

    const afterPartial = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(afterPartial.body.invoice.status).toBe("PARTIALLY_PAID");

    await request(app)
      .post(`/api/v1/invoices/${invoiceId}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 20, method: "CARD" });

    const afterFull = await request(app)
      .get(`/api/v1/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(afterFull.body.invoice.status).toBe("PAID");
  });
});
afterAll(async () => {
  await testPrisma.$disconnect();
  await prisma.$disconnect();
});
