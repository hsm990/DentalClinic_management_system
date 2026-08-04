import bcrypt from "bcrypt";
import { testPrisma } from "./testDb";

export async function createClinicWithAdmin(overrides?: {
  clinicName?: string;
  adminEmail?: string;
}) {
  const clinic = await testPrisma.clinic.create({
    data: { name: overrides?.clinicName ?? "Test Clinic" },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await testPrisma.user.create({
    data: {
      email: overrides?.adminEmail ?? `admin-${clinic.id}@test.dev`,
      passwordHash,
      firstName: "Admin",
      lastName: "Test",
      role: "ADMIN",
      clinicId: clinic.id,
    },
  });

  return { clinic, admin, password: "password123" };
}

export async function createDentist(clinicId: string) {
  const passwordHash = await bcrypt.hash("password123", 10);
  return testPrisma.user.create({
    data: {
      email: `dentist-${clinicId}@test.dev`,
      passwordHash,
      firstName: "Dentist",
      lastName: "Test",
      role: "DENTIST",
      clinicId,
    },
  });
}

export async function createPatient(clinicId: string) {
  return testPrisma.patient.create({
    data: { firstName: "Test", lastName: "Patient", clinicId },
  });
}

export async function createProcedure(clinicId: string) {
  const category = await testPrisma.procedureCategory.create({
    data: { name: "General", clinicId },
  });
  return testPrisma.procedure.create({
    data: { name: "Cleaning", price: 30, categoryId: category.id, clinicId },
  });
}
