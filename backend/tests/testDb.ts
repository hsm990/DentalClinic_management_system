import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const testPrisma = new PrismaClient({ adapter });

// deletes in FK-safe order — children before parents
export async function resetDb() {
  await testPrisma.payment.deleteMany();
  await testPrisma.invoiceItem.deleteMany();
  await testPrisma.invoice.deleteMany();
  await testPrisma.treatmentPlanItem.deleteMany();
  await testPrisma.treatmentPlan.deleteMany();
  await testPrisma.toothChartEntry.deleteMany();
  await testPrisma.appointment.deleteMany();
  await testPrisma.procedure.deleteMany();
  await testPrisma.procedureCategory.deleteMany();
  await testPrisma.patient.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.clinic.deleteMany();
}
